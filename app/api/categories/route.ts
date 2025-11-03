import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export async function GET(_request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("GET /api/categories error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body?.name || "").trim()
    const description = typeof body?.description === "string" ? body.description : null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const created = await prisma.category.create({
      data: { name, description },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: unknown) {
    console.error("POST /api/categories error:", err)
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}