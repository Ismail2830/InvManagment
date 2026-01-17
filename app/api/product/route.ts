import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type Decimalish = number | string | { toString(): string };

type CreateProductBody = {
  name: string;
  sku: string;
  description?: string | null;
  price: Decimalish;
  costPrice?: Decimalish | null;
  quantity?: number | null;
  minStock?: number | null;
  maxStock?: number | null;
  unit?: string | null;
  isActive?: boolean | null;
  categoryId: number;
  supplierId: number;
};

function normalizeDecimal(v: Decimalish): number | string {
  return typeof v === "object" ? v.toString() : v;
}

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
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      error: "Failed to fetch products",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CreateProductBody>;
    const {
      name,
      sku,
      description = null,
      price,
      costPrice = null,
      quantity = null,
      minStock = null,
      maxStock = null,
      unit = null,
      isActive = null,
      categoryId,
      supplierId,
    } = body;

    if (!name || !sku || price == null || !categoryId || !supplierId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        // If your Prisma field is NOT nullable, pass undefined instead of null
        description: description ?? undefined,
        unit: unit ?? undefined,
        isActive: isActive ?? undefined,

        // Decimal fields: pass number|string, not object
        price: normalizeDecimal(price),
        costPrice: costPrice == null ? undefined : normalizeDecimal(costPrice),

        // Numeric optionals: pass undefined if null to use model defaults
        quantity: quantity ?? undefined,
        minStock: minStock ?? undefined,
        maxStock: maxStock ?? undefined,

        categoryId,
        supplierId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "SKU must be unique" }, { status: 409 });
    }
    console.error("POST /api/products error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}