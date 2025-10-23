import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days') || '14'
    const days = parseInt(daysParam)

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    // Get order counts
    const [totalOrders, pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.count({ where: { status: 'cancelled' } })
    ])

    // Today's orders
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayOrders = await prisma.order.count({
      where: {
        orderDate: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Yesterday's orders for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const yesterdayOrders = await prisma.order.count({
      where: {
        orderDate: {
          gte: yesterday,
          lt: today
        }
      }
    })

    // Orders in the selected date range
    const ordersInRange = await prisma.order.findMany({
      where: { 
        orderDate: { 
          gte: startDate,
          lte: endDate
        } 
      },
      select: { 
        id: true,
        orderNumber: true,
        orderDate: true,
        totalAmount: true,
        status: true,
        items: {
          select: {
            quantity: true,
            price: true
          }
        }
      },
      orderBy: { orderDate: 'asc' }
    })

    // Group orders by date
    const ordersByDate = new Map<string, { 
      count: number
      revenue: number
      pending: number
      completed: number
      cancelled: number
    }>()

    ordersInRange.forEach(order => {
      const dateStr = order.orderDate.toISOString().split('T')[0]
      const existing = ordersByDate.get(dateStr) || { 
        count: 0, 
        revenue: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
      }
      
      const amount = typeof order.totalAmount === 'object' ? 
        parseFloat(order.totalAmount.toString()) : 
        order.totalAmount
      
      ordersByDate.set(dateStr, {
        count: existing.count + 1,
        revenue: existing.revenue + (order.status === 'completed' ? amount : 0),
        pending: existing.pending + (order.status === 'pending' ? 1 : 0),
        completed: existing.completed + (order.status === 'completed' ? 1 : 0),
        cancelled: existing.cancelled + (order.status === 'cancelled' ? 1 : 0)
      })
    })

    // Format for chart (all days in range)
    const ordersOverTime = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateStr = date.toISOString().split('T')[0]
      const data = ordersByDate.get(dateStr) || { 
        count: 0, 
        revenue: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
      }
      
      ordersOverTime.push({
        date: dateStr,
        count: data.count,
        revenue: data.revenue,
        pending: data.pending,
        completed: data.completed,
        cancelled: data.cancelled,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }

    // Calculate total revenue
    const totalRevenue = ordersInRange
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => {
        const amount = typeof o.totalAmount === 'object' ? 
          parseFloat(o.totalAmount.toString()) : 
          o.totalAmount
        return sum + amount
      }, 0)

    // Calculate average order value
    const completedOrdersInRange = ordersInRange.filter(o => o.status === 'completed')
    const averageOrderValue = completedOrdersInRange.length > 0 
      ? totalRevenue / completedOrdersInRange.length 
      : 0

    // Total items sold
    const totalItemsSold = ordersInRange
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)

    // Top selling products (from completed orders in range)
    const productSales = new Map<number, { 
      productId: number
      totalQuantity: number
      totalRevenue: number
    }>()

    const ordersWithProducts = await prisma.order.findMany({
      where: {
        status: 'completed',
        orderDate: { 
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        }
      }
    })

    ordersWithProducts.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || {
          productId: item.productId,
          totalQuantity: 0,
          totalRevenue: 0
        }
        
        const itemPrice = typeof item.price === 'object' ? 
          parseFloat(item.price.toString()) : 
          item.price
        
        productSales.set(item.productId, {
          productId: item.productId,
          totalQuantity: existing.totalQuantity + item.quantity,
          totalRevenue: existing.totalRevenue + (itemPrice * item.quantity)
        })
      })
    })

    // Get top 5 products
    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => {
        const order = ordersWithProducts.find(o => 
          o.items.some(i => i.productId === productId)
        )
        const product = order?.items.find(i => i.productId === productId)?.product
        
        return {
          productId,
          name: product?.name || 'Unknown',
          sku: product?.sku || 'N/A',
          quantity: data.totalQuantity,
          revenue: data.totalRevenue
        }
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Calculate growth percentage (today vs yesterday)
    const growthPercentage = yesterdayOrders > 0 
      ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100) 
      : todayOrders > 0 ? 100 : 0

    const ordersAnalytics = {
      summary: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        today: todayOrders,
        yesterday: yesterdayOrders,
        growthPercentage: parseFloat(growthPercentage.toFixed(1)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        totalItemsSold
      },
      overTime: ordersOverTime,
      topProducts,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      }
    }

    return NextResponse.json(ordersAnalytics, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=180, stale-while-revalidate=360'
      }
    })
  } catch (error) {
    console.error('Error fetching orders analytics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
