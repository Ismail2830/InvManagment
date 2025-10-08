import { Activity, Package, Clock, Eye } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface RecentActivityFeedProps {
  activities: Array<{
    id: number
    name: string
    sku: string
    quantity: number
    price: number
    timeAgo: string
    category: { name: string }
  }>
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Recent Activity</span>
          </div>
          <span className="text-sm font-normal text-gray-500">
            Last 7 days
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              New products will appear here when added
            </p>
            <Button asChild>
              <Link href="/products/new">
                Add First Product
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile-First Activity List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activities.slice(0, 6).map((activity) => (
                <div 
                  key={activity.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {activity.sku}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {activity.category.name}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium ml-1 text-green-600">
                          ${activity.price}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock:</span>
                        <span className="font-medium ml-1">
                          {activity.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.timeAgo}
                    </div>
                    <Link 
                      href={`/products/${activity.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {activities.length > 6 && (
              <div className="pt-4 border-t">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/products">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Products ({activities.length} recent)
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
