import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/orders/:id
export async function GET (
    request: NextRequest,
    context: RouteContext
){
    const { id } = await context.params;
    const orderId = parseInt(id);
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
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
        });
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }
}

// DELETE /api/orders/:id
export async function DELETE (
    request: NextRequest,
    context: RouteContext
){
    try {
        const { id } = await context.params;
        const orderId = parseInt(id);
         await prisma.order.delete({
            where: { id: orderId }
        });
        return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting order:", error);
        return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
    }
}


