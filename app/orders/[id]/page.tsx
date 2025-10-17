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

import { getOrder, updateOrderStatus, deleteOrder } from '@/app/lib/orders'

export default function OrderPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    getOrder(id).then(o=>{
      setOrder(o); setStatus(o.status)
    })
    .catch(()=>{ toast({title:'Error',description:'Load failed',variant:'error'}); router.push('/orders')})
    .finally(()=>setLoading(false))
  },[id,router,toast])

  const update = async (s:string) => {
    await updateOrderStatus(id,s)
    setStatus(s)
    toast({title:'Updated',variant:'success'})
  }

  const doDelete = async ()=>{
    await deleteOrder(id)
    toast({title:'Deleted',variant:'success'})
    router.push('/orders')
  }

  if(loading) return <div className="p-6"><Skeleton className="h-6 w-40 mb-4"/><Skeleton className="h-8 w-full mb-2"/><Skeleton className="h-8 w-full"/></div>

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Order {order.orderNumber}
            <Badge className={ status==='completed'?'bg-green-100 text-green-800': status==='cancelled'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800' }>
              {status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>Date: {new Date(order.orderDate).toLocaleString()}</div>
          <div>Total: ${parseFloat(order.totalAmount.toString()).toFixed(2)}</div>
          {order.notes && <div>Notes: {order.notes}</div>}
          <div>
            <label htmlFor="status" className="block mb-1 font-medium">Status</label>
            <Select value={status} onValueChange={update}>
              <SelectTrigger id="status"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="completed">completed</SelectItem>
                <SelectItem value="cancelled">cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((it:any)=>(
            <div key={it.id} className="flex justify-between border-b pb-2">
              <div>
                <div className="font-medium">{it.product.name}</div>
                <div className="text-sm text-muted-foreground">SKU: {it.product.sku}</div>
              </div>
              <div className="text-right">
                <div>{it.quantity} × ${parseFloat(it.price.toString()).toFixed(2)}</div>
                <div className="font-semibold">${(parseFloat(it.price.toString()) * it.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex gap-4">
        <Button variant="destructive" onClick={doDelete}>Delete Order</Button>
      </div>
    </div>
  )
}
