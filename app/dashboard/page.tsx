'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

import { MetricCards } from '../components/dashboard/metric-cards' 
import { StockStatusChart } from '../components/dashboard/stock-status-chart' 
import { TopCategoriesChart } from '../components/dashboard/top-categories-chart' 
import { SupplierPerformanceChart } from '../components/dashboard/supplier-performance-chart' 
import { RecentActivityFeed } from '../components/dashboard/recent-activity-feed' 
import { AlertsPanel } from '../components/dashboard/alerts-panel' 
import { DashboardSkeleton } from '../components/dashboard/dashboard-skeleton' 
import { OrdersOverTimeChart } from '../components/dashboard/orders-over-time-chart' 
 

import { getAnalytics } from '../lib/analytics' 
import { getOrdersAnalytics } from '../lib/orders-analytics'

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [ordersData, setOrdersData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [analyticsData, ordersAnalytics] = await Promise.all([
          getAnalytics(),
          getOrdersAnalytics(14)
        ])
        setAnalytics(analyticsData)
        setOrdersData(ordersAnalytics)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load dashboard'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to load dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              {error.message}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <MetricCards analytics={analytics} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <StockStatusChart data={analytics.stockDistribution} />
              </div>
              <div className="xl:col-span-1">
                <AlertsPanel alerts={analytics.alerts} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OrdersOverTimeChart 
                data={ordersData.overTime}
                summary={ordersData.summary}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopCategoriesChart data={analytics.topCategories} />
              <SupplierPerformanceChart data={analytics.supplierPerformance} />
            </div>

            <RecentActivityFeed activities={analytics.recentActivity} />
          </div>
        )}
      </div>
    </div>
  )
}
