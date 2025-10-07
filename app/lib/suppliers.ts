// Supplier helper functions - API interactions

function apiUrl(path: string) {
  if (typeof window === "undefined") {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      `http://localhost:${process.env.PORT || 3000}`;
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

export interface Supplier {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  contactPerson: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

// GET /api/suppliers - Fetch all suppliers
export async function getSuppliers() {
  try {
    const response = await fetch(apiUrl('/api/suppliers'), {
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch suppliers: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    throw new Error('Unable to load suppliers. Please try again.')
  }
}

// GET /api/suppliers/[id] - Fetch single supplier
export async function getSupplier(id: number) {
  try {
    const response = await fetch(`/api/suppliers/${id}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Supplier not found')
      }
      throw new Error(`Failed to fetch supplier: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching supplier:', error)
    throw error
  }
}

// POST /api/suppliers - Create new supplier
export async function createSupplier(data: {
  name: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
}) {
  try {
    const response = await fetch('/api/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create supplier')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating supplier:', error)
    throw error
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function updateSupplier(id: number, data: {
  name: string
  email?: string
  phone?: string
  address?: string
  contactPerson?: string
}) {
  try {
    const response = await fetch(`/api/suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 404) {
        throw new Error('Supplier not found')
      }
      throw new Error(errorData.error || 'Failed to update supplier')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating supplier:', error)
    throw error
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function deleteSupplier(id: number) {
  try {
    const response = await fetch(`/api/suppliers/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 404) {
        throw new Error('Supplier not found')
      }
      if (response.status === 409) {
        throw new Error('Cannot delete supplier with existing products')
      }
      throw new Error(errorData.error || 'Failed to delete supplier')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting supplier:', error)
    throw error
  }
}
