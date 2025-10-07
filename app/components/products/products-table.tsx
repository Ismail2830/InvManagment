'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  Edit3, 
  Trash2, 
  MoreHorizontal, 
  Package,
  DollarSign,
  AlertTriangle,
  Plus
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/app/hooks/use-toast'

import { deleteProduct } from '@/app/lib/products'
import type { Product } from '@/app/lib/products'

interface ProductsTableProps {
  data: Product[]
}

export function ProductsTable({ data }: ProductsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduct) return

    setIsDeleting(true)

    try {
      await deleteProduct(selectedProduct.id)
      toast({
        title: "Product deleted",
        description: `${selectedProduct.name} has been successfully deleted.`,
        variant: "success"
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error deleting product",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "error"
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedProduct(null)
    }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= 0) {
      return { status: 'out-of-stock', variant: 'destructive' as const, text: 'Out of Stock' }
    }
    if (quantity <= minStock) {
      return { status: 'low-stock', variant: 'default' as const, text: 'Low Stock' }
    }
    return { status: 'in-stock', variant: 'secondary' as const, text: 'In Stock' }
  }

  if (data.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="space-y-4">
        {/* Mobile View - Cards */}
        <div className="block lg:hidden space-y-4">
          {data.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onDelete={handleDelete}
              getStockStatus={getStockStatus}
            />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Product</TableHead>
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead className="w-[150px]">Category</TableHead>
                <TableHead className="w-[100px]">Price</TableHead>
                <TableHead className="w-[100px]">Stock</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product) => {
                const stockStatus = getStockStatus(product.quantity, product.minStock)
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {product.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.category?.name || 'No Category'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                        {product.price}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package className="h-3 w-3 mr-1 text-muted-foreground" />
                        {product.quantity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant} className="gap-1">
                        {stockStatus.status === 'out-of-stock' && <AlertTriangle className="h-3 w-3" />}
                        {stockStatus.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ProductActions 
                        product={product} 
                        onDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Mobile Card Component
interface ProductCardProps {
  product: Product
  onDelete: (product: Product) => void
  getStockStatus: (quantity: number, minStock: number) => any
}

function ProductCard({ product, onDelete, getStockStatus }: ProductCardProps) {
  const stockStatus = getStockStatus(product.quantity, product.minStock)
  
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold leading-none">{product.name}</h3>
          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <ProductActions product={product} onDelete={onDelete} />
      </div>

      {product.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Category:</span>
          <div className="font-medium">{product.category?.name || 'No Category'}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Price:</span>
          <div className="font-medium">${product.price}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Stock:</span>
          <div className="font-medium">{product.quantity} units</div>
        </div>
        <div>
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={stockStatus.variant} className="text-xs">
            {stockStatus.text}
          </Badge>
        </div>
      </div>
    </div>
  )
}

// Actions Dropdown Component
interface ProductActionsProps {
  product: Product
  onDelete: (product: Product) => void
}

function ProductActions({ product, onDelete }: ProductActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`/products/${product.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/products/${product.id}/edit`}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Product
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No products found</h3>
      <p className="text-muted-foreground mb-4">
        Get started by adding your first product to inventory.
      </p>
      <Button asChild>
        <Link href="/products/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </Button>
    </div>
  )
}
