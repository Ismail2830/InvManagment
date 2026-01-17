'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit3, Package, Tag, DollarSign, Box, TrendingDown, TrendingUp, Calendar, Building2, FolderTree } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getProduct, Product } from '@/app/lib/products'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [productId, setProductId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!productId) return

    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const data = await getProduct(parseInt(productId))
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load product'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <svg
                className="h-6 w-6 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Product not found</h3>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'The product you are looking for does not exist.'}
            </p>
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const stockStatus = product.quantity <= product.minStock ? 'low' : product.quantity >= (product.maxStock || Infinity) ? 'high' : 'normal'
  const stockPercentage = product.maxStock ? (product.quantity / product.maxStock) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {product.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge 
                variant={product.isActive ? "default" : "secondary"}
                className={product.isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Button asChild>
                <Link href={`/products/${product.id}/edit`}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Product
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Product Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Basic details about the product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">{product.description}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unit</Label>
                  <p className="mt-1 text-sm font-medium">{product.unit || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="mt-1">
                    <Badge 
                      variant={product.isActive ? "default" : "secondary"}
                      className={product.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Selling Price</Label>
                <p className="mt-1 text-2xl font-bold">${Number(product.price).toFixed(2)}</p>
              </div>
              {product.costPrice && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cost Price</Label>
                  <p className="mt-1 text-lg font-semibold text-muted-foreground">
                    ${Number(product.costPrice).toFixed(2)}
                  </p>
                </div>
              )}
              {product.costPrice && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Profit Margin</Label>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    ${(Number(product.price) - Number(product.costPrice)).toFixed(2)}
                    <span className="text-sm ml-2">
                      ({(((Number(product.price) - Number(product.costPrice)) / Number(product.costPrice)) * 100).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Stock Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Current Stock</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold">{product.quantity}</p>
                  {stockStatus === 'low' && (
                    <Badge variant="destructive" className="gap-1">
                      <TrendingDown className="h-3 w-3" />
                      Low
                    </Badge>
                  )}
                  {stockStatus === 'high' && (
                    <Badge variant="default" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      High
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label className="text-muted-foreground">Min Stock</Label>
                  <span className="font-medium">{product.minStock}</span>
                </div>
                {product.maxStock && (
                  <div className="flex justify-between text-sm">
                    <Label className="text-muted-foreground">Max Stock</Label>
                    <span className="font-medium">{product.maxStock}</span>
                  </div>
                )}
              </div>

              {product.maxStock && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Stock Level
                  </Label>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        stockStatus === 'low'
                          ? 'bg-destructive'
                          : stockStatus === 'high'
                          ? 'bg-primary'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category & Supplier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.category ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {product.category.name}
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No category assigned</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Supplier
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.supplier ? (
                <div>
                  <p className="font-medium">{product.supplier.name}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No supplier assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                <p className="mt-1 text-sm">
                  {new Date(product.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                <p className="mt-1 text-sm">
                  {new Date(product.updatedAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-medium ${className}`}>{children}</div>
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>

          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
