import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { 
                category: true,
                supplier: true,
             },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
       const {
        name,
        sku,
        description,
        price,
        costPrice,
        quantity,
        minStock,
        maxStock,
        unit,
        isActive,
        categoryId,
        supplierId,
       } = body;

       if(!name || !sku || !price || !categoryId || !supplierId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
       }     
       const product = await prisma.product.create({
        data: {
            name,
            sku,
            description,
            price,
            costPrice,
            quantity,
            minStock,
            maxStock,
            unit,
            isActive,
            categoryId,
            supplierId,
        },
       });   
         return NextResponse.json(product, { status: 201 });
    } catch (error : any) {
      if (error?.code === "P2002") {
      return NextResponse.json({ error: "SKU must be unique" }, { status: 409 });
    }
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });  
    }
}