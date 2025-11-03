import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type Decimalish = number | string | { toString(): string };

type UpdateProductBody = {
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

const normalizeDecimal = (v: Decimalish): number | string =>
  typeof v === "object" ? v.toString() : v;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);

  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        supplier: true,
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);

  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Partial<UpdateProductBody>;
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

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        description: description ?? undefined,
        price: normalizeDecimal(price),
        costPrice: costPrice == null ? undefined : normalizeDecimal(costPrice),
        quantity: quantity ?? undefined,
        minStock: minStock ?? undefined,
        maxStock: maxStock ?? undefined,
        unit: unit ?? undefined,
        isActive: isActive ?? undefined,
        categoryId,
        supplierId,
      },
      include: { category: true, supplier: true },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json({ error: "SKU must be unique" }, { status: 409 });
      }
      if (err.code === "P2025") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
    }
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);

  if (Number.isNaN(productId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id: productId } });
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}