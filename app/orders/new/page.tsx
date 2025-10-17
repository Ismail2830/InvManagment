"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useToast } from '@/app/hooks/use-toast' 

import { createOrder } from '@/app/lib/orders'
import { getProducts } from '@/app/lib/products'

export default function NewOrderPage() {
  const [products, setProducts] = useState<any[]>([])
  const [items, setItems] = useState([{ productId: '', quantity: 1 }])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    getProducts().then(setProducts).catch(() => toast({ title: 'Error', description: 'Load products failed', variant: 'error' }))
  }, [toast])

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, key: string, value: any) => {
    const copy = [...items]; copy[i] = { ...copy[i], [key]: value }; setItems(copy)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const valid = items.filter(it => it.productId && it.quantity > 0).map(it => ({
        productId: parseInt(it.productId), quantity: it.quantity
      }))
      if (!valid.length) throw new Error('Add items')
      await createOrder({ items: valid, notes: notes || undefined })
      toast({ title: 'Order created', variant: 'success' })
      router.push('/orders')
    } catch (err:any) {
      toast({ title: 'Error', description: err.message, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">New Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {items.map((it, i) => (
              <div key={i} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Product</Label>
                  <Select value={it.productId} onValueChange={v => updateItem(i,'productId',v)}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p=>(
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name} (${p.price})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label>Qty</Label>
                  <Input type="number" min={1} value={it.quantity} onChange={e=>updateItem(i,'quantity',parseInt(e.target.value))}/>
                </div>
                {items.length>1 && (
                  <Button variant="destructive" size="icon" onClick={()=>removeItem(i)}>
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem}><Plus className="mr-2" />Add Item</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea placeholder="Optional notes" value={notes} onChange={e=>setNotes(e.target.value)} rows={3}/>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">{loading?'Creating...':'Create Order'}</Button>
          <Button variant="outline" asChild><Link href="/orders">Cancel</Link></Button>
        </div>
      </form>
    </div>
  )
}
