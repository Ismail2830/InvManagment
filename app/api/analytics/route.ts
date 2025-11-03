import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

type Decimalish = number | string | { toString(): string }

interface ProductAlertItem {
  id: number
  name: string
  sku: string
  quantity: number
  minStock: number
  price: Decimalish
  createdAt: Date
  category: { id: number; name: string } | null
  supplier: { id: number; name: string } | null
}

export async function GET() {
  try {
    // Basic metrics
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      inventoryAggregation,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.product.aggregate({
        _sum: { 
          price: true,
          quantity: true 
        },
        _avg: { price: true }
      })
    ])

    // Get all products with details for analysis
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        minStock: true,
        price: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stock status
    let inStock = 0
    let lowStock = 0
    let outOfStock = 0
    const lowStockAlerts: ProductAlertItem[] = []
    const outOfStockAlerts: ProductAlertItem[] = []

    products.forEach((product) => {
      if (product.quantity === 0) {
        outOfStock++
        outOfStockAlerts.push(product as ProductAlertItem)
      } else if (product.quantity <= product.minStock) {
        lowStock++
        lowStockAlerts.push(product as ProductAlertItem)
      } else {
        inStock++
      }
    })

    // Prevent division by zero
    const safeTotal = totalProducts || 1

    // Stock distribution for pie chart
    const stockDistribution: { name: string; value: number; color: string; percentage: string }[] = [
      { 
        name: 'In Stock', 
        value: inStock, 
        color: '#22c55e', 
        percentage: ((inStock / safeTotal) * 100).toFixed(1) 
      },
      { 
        name: 'Low Stock', 
        value: lowStock, 
        color: '#f59e0b', 
        percentage: ((lowStock / safeTotal) * 100).toFixed(1) 
      },
      { 
        name: 'Out of Stock', 
        value: outOfStock, 
        color: '#ef4444', 
        percentage: ((outOfStock / safeTotal) * 100).toFixed(1) 
      }
    ]

    // Top categories by product count
    const categoryStats = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        products: {
          select: { price: true, quantity: true }
        }
      },
      orderBy: {
        products: { _count: 'desc' }
      },
      take: 8
    })

    const topCategories = categoryStats.map((cat, index) => ({
      name: cat.name.length > 15 ? `${cat.name.substring(0, 15)}...` : cat.name,
      fullName: cat.name,
      products: cat._count.products,
      value: cat.products.reduce((sum, p) => {
        const price = typeof p.price === 'object' ? parseFloat(p.price.toString()) : (p.price as number)
        return sum + (price * p.quantity)
      }, 0),
      color: `hsl(${(index * 45) % 360}, 70%, 50%)`
    }))

    // Supplier performance
    const supplierStats = await prisma.supplier.findMany({
      include: {
        _count: { select: { products: true } },
        products: {
          select: { price: true, quantity: true }
        }
      },
      orderBy: {
        products: { _count: 'desc' }
      },
      take: 5
    })

    const supplierPerformance = supplierStats.map((supplier, index) => ({
      name: supplier.name.length > 15 ? `${supplier.name.substring(0, 15)}...` : supplier.name,
      fullName: supplier.name,
      products: supplier._count.products,
      value: supplier.products.reduce((sum, p) => {
        const price = typeof p.price === 'object' ? parseFloat(p.price.toString()) : (p.price as number)
        return sum + (price * p.quantity)
      }, 0),
      color: `hsl(${(index * 72) % 360}, 65%, 55%)`
    }))

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = products
      .filter(p => new Date(p.createdAt) >= sevenDaysAgo)
      .slice(0, 10)
      .map(product => ({
        ...product,
        price: typeof product.price === 'object' ? parseFloat(product.price.toString()) : (product.price as number),
        timeAgo: getTimeAgo(new Date(product.createdAt))
      }))

    // Monthly trends (last 6 months)
    const monthlyTrends: { month: string; products: number; value: number }[] = []
    const avgPrice =
      inventoryAggregation._avg.price
        ? (typeof inventoryAggregation._avg.price === 'object'
            ? parseFloat(inventoryAggregation._avg.price.toString())
            : inventoryAggregation._avg.price)
        : 0

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthProducts = await prisma.product.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        products: monthProducts,
        value: monthProducts * avgPrice
      })
    }

    // Calculate total inventory value properly
    const totalInventoryValue =
      inventoryAggregation._sum.price
        ? (typeof inventoryAggregation._sum.price === 'object'
            ? parseFloat(inventoryAggregation._sum.price.toString())
            : inventoryAggregation._sum.price)
        : 0

    const analytics = {
      overview: {
        totalProducts,
        totalCategories,
        totalSuppliers,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock,
        totalInventoryValue,
        averageProductValue: avgPrice
      },
      stockDistribution,
      topCategories,
      supplierPerformance,
      recentActivity,
      alerts: {
        lowStock: lowStockAlerts.slice(0, 10),
        outOfStock: outOfStockAlerts.slice(0, 10),
        recent: recentActivity.slice(0, 5)
      },
      trends: {
        monthly: monthlyTrends
      }
    }

    return NextResponse.json(analytics, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}