import { 
  Package, 
  Layers3, 
  Building2, 
  TrendingDown, 
  AlertTriangle,
  DollarSign
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AnalyticsOverview {
  totalProducts: number
  totalCategories: number
  totalSuppliers: number
  lowStockProducts: number
  outOfStockProducts: number
  totalInventoryValue: number
  averageProductValue: number
}

interface Analytics {
  overview: AnalyticsOverview
  stockDistribution?: unknown[]
  topCategories?: unknown[]
  supplierPerformance?: unknown[]
  recentActivity?: unknown[]
  alerts?: unknown
  trends?: unknown
}

interface MetricCardsProps {
  analytics: Analytics
}

export function MetricCards({ analytics }: MetricCardsProps) {
  const { overview } = analytics

  const metrics = [
    {
      title: 'Total Products',
      value: overview.totalProducts.toLocaleString(),
      icon: Package,
      description: 'Active products',
      trend: overview.totalProducts > 0 ? '+' : '',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Categories',
      value: overview.totalCategories.toLocaleString(),
      icon: Layers3,
      description: 'Product categories',
      trend: '',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Suppliers',
      value: overview.totalSuppliers.toLocaleString(),
      icon: Building2,
      description: 'Active suppliers',
      trend: '',
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Low Stock',
      value: overview.lowStockProducts.toLocaleString(),
      icon: TrendingDown,
      description: 'Below minimum',
      trend: overview.lowStockProducts > 0 ? '⚠️' : '✅',
      color: overview.lowStockProducts > 0 ? 'bg-orange-500' : 'bg-gray-500',
      bgColor: overview.lowStockProducts > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
      alert: overview.lowStockProducts > 0
    },
    {
      title: 'Out of Stock',
      value: overview.outOfStockProducts.toLocaleString(),
      icon: AlertTriangle,
      description: 'Zero inventory',
      trend: overview.outOfStockProducts > 0 ? '🚨' : '✅',
      color: overview.outOfStockProducts > 0 ? 'bg-red-500' : 'bg-gray-500',
      bgColor: overview.outOfStockProducts > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/20',
      alert: overview.outOfStockProducts > 0
    },
    {
      title: 'Inventory Value',
      value: `$${overview.totalInventoryValue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total value',
      trend: '💰',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className={`${metric.bgColor} border-0 shadow-sm hover:shadow-md transition-all duration-200 ${
            metric.alert ? 'ring-2 ring-red-200 dark:ring-red-800' : ''
          }`}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`${metric.color} p-2 rounded-lg`}>
                <metric.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              {metric.alert && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  Alert
                </Badge>
              )}
              {metric.trend && !metric.alert && (
                <span className="text-lg">{metric.trend}</span>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {metric.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}