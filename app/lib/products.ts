function apiUrl(path: string) {
  if (typeof window === "undefined") {
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

// Product helper functions for API interactions

export interface Product {
  id: number
  name: string
  sku: string
  description: string | null
  price: number
  costPrice?: number | null
  quantity: number
  minStock: number
  maxStock: number | null
  unit: string
  isActive: boolean
  categoryId: number
  supplierId: number
  createdAt: string
  updatedAt: string
  category?: {
    id: number
    name: string
  }
  supplier?: {
    id: number
    name: string
  }
}

// GET /api/product - Fetch all products
export async function getProducts() {
  try {
    const response = await fetch(apiUrl('/api/product'), {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Unable to load products. Please try again.')
  }
}

// GET /api/product/[id] - Fetch single product
export async function getProduct(id: number) {
  try {
    const response = await fetch(`/api/product/${id}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found')
      }
      throw new Error(`Failed to fetch product: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

// POST /api/product - Create new product
export async function createProduct(data: {
  name: string
  sku: string
  description?: string
  price: number
  costPrice?: number
  quantity?: number
  minStock?: number
  maxStock?: number
  unit?: string
  isActive?: boolean
  categoryId: number
  supplierId: number
}) {
  try {
    const response = await fetch('/api/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create product')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

// PUT /api/product/[id] - Update product
export async function updateProduct(id: number, data: {
  name: string
  sku: string
  description?: string
  price: number
  costPrice?: number
  quantity?: number
  minStock?: number
  maxStock?: number
  unit?: string
  isActive?: boolean
  categoryId: number
  supplierId: number
}) {
  try {
    const response = await fetch(`/api/product/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 404) {
        throw new Error('Product not found')
      }
      throw new Error(errorData.error || 'Failed to update product')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// DELETE /api/product/[id] - Delete product
export async function deleteProduct(id: number) {
  try {
    const response = await fetch(`/api/product/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 404) {
        throw new Error('Product not found')
      }
      throw new Error(errorData.error || 'Failed to delete product')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}