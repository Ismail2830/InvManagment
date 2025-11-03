"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/app/hooks/use-toast' 

import { getOrder, updateOrderStatus, deleteOrder, Order } from '@/app/lib/orders'

interface OrderPageProps {
  params: Promise<{ id: string }>
}

// Helper function to safely format currency (no explicit any)
const formatCurrency = (
  value: number | string | { toString(): string } | null | undefined
): string => {
  if (value === null || value === undefined) return '0.00'

  let numericValue: number

  if (typeof value === 'number') {
    numericValue = value
  } else if (typeof value === 'string') {
    numericValue = parseFloat(value)
  } else {
    // Decimal-like object
    numericValue = parseFloat(value.toString())
  }

  return isNaN(numericValue) ? '0.00' : numericValue.toFixed(2)
}

export default function OrderPage({ params }: OrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { id } = await params
        const parsedId = parseInt(id)

        if (isNaN(parsedId)) {
          toast({
            title: 'Error',
            description: 'Invalid order ID',
            variant: 'destructive'
          })
          router.push('/orders')
          return
        }

        setOrderId(parsedId)

        const orderData = await getOrder(parsedId)
        setOrder(orderData)
        setStatus(orderData.status)
      } catch (error) {
        console.error('Error loading order:', error)
        toast({
          title: 'Error',
          description: 'Failed to load order',
          variant: 'destructive'
        })
        router.push('/orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [params, router, toast])

  const update = async (s: string) => {
    if (!orderId) return

    try {
      await updateOrderStatus(orderId, s)
      setStatus(s)
      toast({
        title: 'Updated',
        description: 'Order status updated successfully',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      })
    }
  }

  const doDelete = async () => {
    if (!orderId) return

    try {
      await deleteOrder(orderId)
      toast({
        title: 'Deleted',
        description: 'Order deleted successfully',
        variant: 'default'
      })
      router.push('/orders')
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete order',
        variant: 'destructive'
      })
    }
  }

  const getStatusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (s.toLowerCase()) {
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-6 w-40 mb-4" />
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-8 w-full mb-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
          </Button>
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Order not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Order {order.orderNumber}
              <Badge variant={getStatusVariant(status)}>
                {status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Date:</span> {new Date(order.orderDate).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Total:</span> ${formatCurrency(order.totalAmount)}
              </div>
            </div>

            {order.notes && (
              <div>
                <span className="font-medium">Notes:</span> {order.notes}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="status" className="block font-medium">Status</label>
              <Select value={status} onValueChange={update}>
                <SelectTrigger id="status" className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: NonNullable<Order['items']>[number]) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {item.product?.sku || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {item.quantity} × ${formatCurrency(item.unitPrice)}
                    </div>
                    <div className="font-semibold">
                      ${formatCurrency(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No items found</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="destructive"
            onClick={doDelete}
            className="w-full sm:w-auto"
          >
            Delete Order
          </Button>
        </div>
      </div>
    </div>
  )
}