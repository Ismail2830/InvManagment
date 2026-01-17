function apiUrl(path: string) {
  if (typeof window === "undefined") {
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

// Add proper TypeScript interfaces
export interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number | string | { toString: () => string };
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number | string | { toString: () => string };
  subtotal: number | string | { toString: () => string };
  product?: {
    id: number;
    name: string;
    sku: string;
    price: number | string | { toString: () => string };
  };
}

export interface CreateOrderData {
  items: { productId: number; quantity: number }[];
  notes?: string;
}

// Simple orders helper - worls with your products shema
export async function getOrders() : Promise<Order[]> {
    try {
        const response = await fetch(apiUrl('/api/orders'), {
            next: { revalidate: 60 } // cache for 60 seconds
        })

        if(!response.ok) {
            throw new Error('Failed to fetch orders')
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders, Please try again later.");
    }
}

export async function getOrder(id: number): Promise<Order> {
    try {
        const response = await fetch(apiUrl(`/api/orders/${id}`), {
            next: { revalidate: 300 } // cache for 5 minutes
        })
        if(!response.ok) {
            throw new Error('Failed to fetch order')
        }
        return await response.json()
    } catch (error) {
        console.error("Error fetching order:", error);
        throw new Error("Failed to fetch order, Please try again later.");
    }
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
    try {
        const response = await fetch(apiUrl('/api/orders'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if(!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to create order')
        }

        return await response.json()
    } catch (error) {
        console.error("Error creating order:", error);
        throw error
    }
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  try {
    const response = await fetch(apiUrl(`/api/orders/${id}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update order')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

export async function deleteOrder(id: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch(apiUrl(`/api/orders/${id}`), {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete order')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting order:', error)
    throw error
  }
}
