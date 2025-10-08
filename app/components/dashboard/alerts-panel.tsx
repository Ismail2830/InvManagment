import { AlertTriangle, TrendingDown, Clock, Package, Eye } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AlertsPanelProps {
  alerts: {
    lowStock: Array<{
      id: number
      name: string
      sku: string
      quantity: number
      minStock: number
      category: { name: string }
    }>
    outOfStock: Array<{
      id: number
      name: string
      sku: string
      quantity: number
      minStock: number
      category: { name: string }
    }>
    recent: Array<{
      id: number
      name: string
      sku: string
      timeAgo: string
      category: { name: string }
    }>
  }
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const totalAlerts = alerts.lowStock.length + alerts.outOfStock.length

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Alerts</span>
          </div>
          {totalAlerts > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {totalAlerts}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <Tabs defaultValue="stock" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="stock" className="text-xs">
              Stock ({alerts.outOfStock.length})
            </TabsTrigger>
            <TabsTrigger value="low" className="text-xs">
              Low ({alerts.lowStock.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs">
              Recent ({alerts.recent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-3 h-64 overflow-y-auto">
            {alerts.outOfStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Package className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No out of stock items! 🎉
                </p>
              </div>
            ) : (
              alerts.outOfStock.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">SKU: {item.sku}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.category.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                    <span className="text-xs text-gray-500 mt-1">
                      Min: {item.minStock}
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="low" className="space-y-3 h-64 overflow-y-auto">
            {alerts.lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <TrendingDown className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All items properly stocked! ✅
                </p>
              </div>
            ) : (
              alerts.lowStock.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">SKU: {item.sku}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.category.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="default" className="text-xs">
                      Low Stock
                    </Badge>
                    <span className="text-xs text-gray-500 mt-1">
                      {item.quantity} / {item.minStock}
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-3 h-64 overflow-y-auto">
            {alerts.recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Clock className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            ) : (
              alerts.recent.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">SKU: {item.sku}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.category.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                    <span className="text-xs text-gray-500 mt-1">
                      {item.timeAgo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        {totalAlerts > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/products?filter=alerts">
                <Eye className="h-4 w-4 mr-2" />
                View All Alerts
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
