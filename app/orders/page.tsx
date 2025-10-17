import { Suspense } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrders } from '@/app/lib/orders'

export default async function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-sm text-muted-foreground">Manage customer orders</p>
          </div>
          <Button asChild>
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4" /> New Order
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<OrdersSkeleton />}>
              <OrdersList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function OrdersList() {
  const orders = await getOrders()
  if (!orders.length) {
    return <div className="text-center py-12">No orders found</div>
  }
  return (
    <div className="space-y-4">
      {orders.map(order => (
        <Link  key={order.id} href={`/orders/${order.id}`} className="flex justify-between items-center p-4 border rounded hover:bg-gray-50">
            <div>
              <div className="font-medium">{order.orderNumber}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(order.orderDate).toLocaleDateString()} • ${parseFloat(order.totalAmount.toString()).toFixed(2)}
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
        </Link>
      ))}
    </div>
  )
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-4 border rounded animate-pulse">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}
