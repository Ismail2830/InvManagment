import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/orders
export async function GET(request: NextRequest) {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                price: true,
                                quantity: true,
                                category: {
                                    select: {
                                        name: true
                                    }
                                },
                                supplier:{
                                    select:{ name:true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc'}
        })
        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json({ 
          error: "Failed to fetch orders",
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });   
    }
}

// POST /api/orders
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, notes } = body;
        if(!items || items.length === 0){
            return NextResponse.json({
                error: "Order must contain at least one item."
            }, { status: 400 });
            
        }

        // generate order number
        const orderNumber = `ORD-${Date.now()}`;

        // Calcule toal and prerare Items
        let totalAmount = 0
        const orderItems = []
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    quantity: true
                }
            })
            if (!product) {
                return NextResponse.json({
                    error: `Product with ID ${item.productId} not found.`
                }, { status: 404 });
            }
            if(product.quantity < item.quantity){
                return NextResponse.json({
                    error: `Insufficient stock for product ${product.name}. Available quantity: ${product.quantity}.`
                }, { status: 400 });
            }
            const itemTotal = parseFloat(product.price.toString()) * item.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }
        // Create Order
        const order = await prisma.order.create({
            data: {
                orderNumber,
                totalAmount,
                notes: notes || null,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                category: { select: { name: true } },
                                supplier: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        })
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}