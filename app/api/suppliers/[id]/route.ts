import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/suppliers/[id] - Get single supplier
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supplierId = parseInt(id)

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            quantity: true,
            price: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier, { status: 200 })
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    )
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supplierId = parseInt(id)

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, email, phone, address, contactPerson } = body

    // Basic validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Supplier name is required' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Supplier name must be less than 100 characters' },
        { status: 400 }
      )
    }

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Email validation if provided
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        )
      }

      // Check for duplicate email (excluding current supplier)
      const duplicateSupplier = await prisma.supplier.findFirst({
        where: { 
          email: email.trim(),
          id: { not: supplierId }
        }
      })

      if (duplicateSupplier) {
        return NextResponse.json(
          { error: 'Supplier with this email already exists' },
          { status: 409 }
        )
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        contactPerson: contactPerson?.trim() || null
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json(updatedSupplier, { status: 200 })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supplierId = parseInt(id)

    if (isNaN(supplierId)) {
      return NextResponse.json(
        { error: 'Invalid supplier ID' },
        { status: 400 }
      )
    }

    // Check if supplier exists and has products
    const supplierWithProducts = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!supplierWithProducts) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if supplier has products
    if (supplierWithProducts._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with existing products. Please reassign or delete all products first.' },
        { status: 409 }
      )
    }

    await prisma.supplier.delete({
      where: { id: supplierId }
    })

    return NextResponse.json(
      { message: 'Supplier deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}
