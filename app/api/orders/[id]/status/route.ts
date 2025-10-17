import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

interface RouteContext {
  params: Promise<{ id: string }>
}

// PATCH /api/orders/[id]/status
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const orderId = parseInt(id)
    const { status } = await request.json()

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, completed, or cancelled' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // If changing to completed, reduce stock
    if (status === 'completed' && order.status !== 'completed') {
      await prisma.$transaction(
        order.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } }
          })
        )
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                supplier: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedOrder, { status: 200 })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
