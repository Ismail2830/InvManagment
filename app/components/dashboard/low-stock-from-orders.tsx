import { AlertTriangle, Package, ArrowRight, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface LowStockFromOrdersProps {
  items: Array<{
    id: number
    name: string
    sku: string
    currentStock: number
    minStock: number
    totalOrdered: number
    orderCount: number
    category: string
  }>
}

export function LowStockFromOrders({ items }: LowStockFromOrdersProps) {
  const outOfStock = items.filter(item => item.currentStock === 0)
  const lowStock = items.filter(item => item.currentStock > 0 && item.currentStock <= item.minStock)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Low Stock Alerts</span>
          </div>
          {items.length > 0 && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              {items.length}
            </Badge>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Products running low from order activity
        </p>
      </CardHeader>
      <CardContent className="p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-3">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              All Stock Levels Good! 🎉
            </h3>
            <p className="text-xs text-muted-foreground">
              No low stock issues from recent orders
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Out of Stock - Critical Section */}
            {outOfStock.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Out of Stock ({outOfStock.length})
                </h4>
                {outOfStock.map((item) => (
                  <Link key={item.id} href={`/products/${item.id}`}>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              SKU: {item.sku}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs whitespace-nowrap">
                          OUT
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Min Stock: {item.minStock}</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {item.totalOrdered} sold • {item.orderCount} orders
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Low Stock - Warning Section */}
            {lowStock.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Low Stock ({lowStock.length})
                </h4>
                {lowStock.map((item) => (
                  <Link key={item.id} href={`/products/${item.id}`}>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              SKU: {item.sku}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant="default" 
                          className="text-xs whitespace-nowrap bg-amber-600"
                        >
                          {item.currentStock}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Min Stock: {item.minStock}</span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          {item.totalOrdered} sold • {item.orderCount} orders
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* View All Button */}
            {items.length > 5 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/products?filter=low-stock">
                    <span>View All {items.length} Items</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
