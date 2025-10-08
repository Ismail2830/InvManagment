import { Suspense } from 'react'
import { 
  Package, 
  Layers3, 
  Building2, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Activity,
  Clock
} from 'lucide-react'

import { MetricCards } from '../components/dashboard/metric-cards' 
import { StockStatusChart } from '../components/dashboard/stock-status-chart' 
import { TopCategoriesChart } from '../components/dashboard/top-categories-chart' 
import { SupplierPerformanceChart } from '../components/dashboard/supplier-performance-chart' 
import { RecentActivityFeed } from '../components/dashboard/recent-activity-feed' 
import { AlertsPanel } from '../components/dashboard/alerts-panel' 
import { DashboardSkeleton } from '../components/dashboard/dashboard-skeleton' 

import { getAnalytics } from '../lib/analytics' 

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                Inventory management overview
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  )
}

async function DashboardContent() {
  try {
    const analytics = await getAnalytics()
    
    return (
      <div className="space-y-6">
        {/* Metric Cards - Mobile First Grid */}
        <MetricCards analytics={analytics} />

        {/* Charts Section - Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Stock Status - Full width on mobile, 2/3 on desktop */}
          <div className="xl:col-span-2">
            <StockStatusChart data={analytics.stockDistribution} />
          </div>
          
          {/* Alerts Panel - Stack on mobile */}
          <div className="xl:col-span-1">
            <AlertsPanel alerts={analytics.alerts} />
          </div>
        </div>

        {/* Categories and Suppliers Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCategoriesChart data={analytics.topCategories} />
          <SupplierPerformanceChart data={analytics.supplierPerformance} />
        </div>

        {/* Recent Activity - Full Width */}
        <RecentActivityFeed activities={analytics.recentActivity} />
      </div>
    )
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          There was an error loading the dashboard data. Please check your connection and try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }
}
