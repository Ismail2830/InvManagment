import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

// GET /api/suppliers - Get all suppliers
export async function GET(request: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json(suppliers, { status: 200 })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
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

    // Email validation if provided
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        )
      }

      // Check for duplicate email
      const existingSupplier = await prisma.supplier.findUnique({
        where: { email: email.trim() }
      })

      if (existingSupplier) {
        return NextResponse.json(
          { error: 'Supplier with this email already exists' },
          { status: 409 }
        )
      }
    }

    const supplier = await prisma.supplier.create({
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

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}
