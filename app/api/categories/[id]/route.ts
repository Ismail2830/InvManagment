import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

type ParamsPromise = Promise<{ id: string }>
type UpdateCategoryBody = { name?: string; description?: string | null }

export async function GET(
  _request: NextRequest,
  { params }: { params: ParamsPromise }
) {
  try {
    const { id } = await params
    const categoryId = Number.parseInt(id, 10)

    if (Number.isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: true,
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: ParamsPromise }
) {
  try {
    const { id } = await params
    const categoryId = Number.parseInt(id, 10)

    if (Number.isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = (await request.json()) as UpdateCategoryBody
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const description =
      typeof body?.description === "string" ? body.description.trim() : null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    try {
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: { name, description: description || null },
      })

      return NextResponse.json(updatedCategory, { status: 200 })
    } catch (err: unknown) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          return NextResponse.json({ error: "Category not found" }, { status: 404 })
        }
        if (err.code === "P2002") {
          return NextResponse.json({ error: "Category name already exists" }, { status: 409 })
        }
      }
      throw err
    }
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: ParamsPromise }
) {
  try {
    const { id } = await params
    const categoryId = Number.parseInt(id, 10)

    if (Number.isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const productCount = await prisma.product.count({ where: { categoryId } })
    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing products" },
        { status: 400 }
      )
    }

    try {
      await prisma.category.delete({ where: { id: categoryId } })
      return new NextResponse(null, { status: 204 })
    } catch (err: unknown) {
      if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
        return NextResponse.json({ error: "Category not found" }, { status: 404 })
      }
      throw err
    }
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}