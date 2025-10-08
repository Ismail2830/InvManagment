// Analytics helper functions and types for dashboard

// Base interfaces for analytics data
export interface AnalyticsOverview {
  totalProducts: number
  totalCategories: number
  totalSuppliers: number
  lowStockProducts: number
  outOfStockProducts: number
  totalInventoryValue: number
  averageProductValue: number
}

export interface StockDistributionItem {
  name: string
  value: number
  color: string
  percentage: string
}

export interface CategoryAnalytics {
  name: string
  fullName: string
  products: number
  value: number
  color: string
}

export interface SupplierAnalytics {
  name: string
  fullName: string
  products: number
  value: number
  color: string
}

export interface ProductAlert {
  id: number
  name: string
  sku: string
  quantity: number
  minStock: number
  category: {
    id: number
    name: string
  }
}

export interface RecentActivity {
  id: number
  name: string
  sku: string
  quantity: number
  price: number
  createdAt: string
  timeAgo: string
  category: {
    id: number
    name: string
  }
  supplier?: {
    id: number
    name: string
  }
}

export interface MonthlyTrend {
  month: string
  products: number
  value: number
}

export interface AlertsCollection {
  lowStock: ProductAlert[]
  outOfStock: ProductAlert[]
  recent: RecentActivity[]
}

export interface TrendsData {
  monthly: MonthlyTrend[]
}

// Main analytics data interface
export interface AnalyticsData {
  overview: AnalyticsOverview
  stockDistribution: StockDistributionItem[]
  topCategories: CategoryAnalytics[]
  supplierPerformance: SupplierAnalytics[]
  recentActivity: RecentActivity[]
  alerts: AlertsCollection
  trends: TrendsData
}

// Analytics API Error class
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message)
    this.name = 'AnalyticsError'
  }
}

// Helper function to handle API responses
async function handleAnalyticsResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'Failed to fetch analytics data'
    let errorDetails = undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
      errorDetails = errorData.details
    } catch {
      // If JSON parsing fails, use default message
      errorMessage = `HTTP ${response.status}: ${response.statusText}`
    }
    
    throw new AnalyticsError(errorMessage, response.status, errorDetails)
  }

  try {
    return await response.json()
  } catch (error) {
    throw new AnalyticsError('Invalid response format from analytics API')
  }
}

// Add this helper function at the top of your file
function apiUrl(path: string) {
  if (typeof window === "undefined") {
    const base = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

// Main function to fetch dashboard analytics
export async function getAnalytics(): Promise<AnalyticsData> {
  try {
    const response = await fetch(apiUrl('/api/analytics'), {
      next: { 
        revalidate: 300, // Cache for 5 minutes
        tags: ['analytics', 'dashboard']
      },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    return await handleAnalyticsResponse<AnalyticsData>(response)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    
    if (error instanceof AnalyticsError) {
      throw error
    }
    
    throw new AnalyticsError(
      'Unable to load analytics. Please check your connection and try again.',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

// Utility functions for analytics calculations
export const analyticsUtils = {
  // Calculate percentage with proper rounding
  calculatePercentage: (value: number, total: number): string => {
    if (total === 0) return '0'
    return ((value / total) * 100).toFixed(1)
  },

  // Format currency values
  formatCurrency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  },

  // Format large numbers with abbreviations
  formatNumber: (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value.toLocaleString()
  },

  // Get time ago string
  getTimeAgo: (date: Date | string): string => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return past.toLocaleDateString()
  },

  // Generate colors for charts
  generateChartColors: (count: number): string[] => {
    const baseColors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#f97316', // orange
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#ec4899', // pink
      '#6b7280'  // gray
    ]
    
    const colors = []
    for (let i = 0; i < count; i++) {
      if (i < baseColors.length) {
        colors.push(baseColors[i])
      } else {
        // Generate HSL colors for additional items
        const hue = (i * 137.508) % 360 // Golden angle approximation
        colors.push(`hsl(${hue}, 70%, 50%)`)
      }
    }
    
    return colors
  },

  // Calculate stock health score (0-100)
  calculateStockHealthScore: (
    totalProducts: number,
    inStock: number,
    lowStock: number,
    outOfStock: number
  ): number => {
    if (totalProducts === 0) return 100
    
    const inStockScore = (inStock / totalProducts) * 100
    const lowStockPenalty = (lowStock / totalProducts) * 30
    const outOfStockPenalty = (outOfStock / totalProducts) * 60
    
    const score = Math.max(0, inStockScore - lowStockPenalty - outOfStockPenalty)
    return Math.round(score)
  },

  // Get stock status color
  getStockStatusColor: (quantity: number, minStock: number): string => {
    if (quantity === 0) return '#ef4444' // red
    if (quantity <= minStock) return '#f59e0b' // amber
    return '#22c55e' // green
  },

  // Get stock status text
  getStockStatusText: (quantity: number, minStock: number): string => {
    if (quantity === 0) return 'Out of Stock'
    if (quantity <= minStock) return 'Low Stock'
    return 'In Stock'
  },

  // Calculate inventory turnover rate (simplified)
  calculateTurnoverRate: (
    totalSales: number,
    averageInventoryValue: number
  ): number => {
    if (averageInventoryValue === 0) return 0
    return Math.round((totalSales / averageInventoryValue) * 100) / 100
  },

  // Get trend direction
  getTrendDirection: (current: number, previous: number): 'up' | 'down' | 'neutral' => {
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'neutral'
  },

  // Calculate percentage change
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }
}

// Cache management utilities
export const analyticsCache = {
  // Cache keys
  CACHE_KEYS: {
    ANALYTICS: 'dashboard-analytics',
    OVERVIEW: 'analytics-overview',
    STOCK_DISTRIBUTION: 'stock-distribution',
    TOP_CATEGORIES: 'top-categories',
    SUPPLIER_PERFORMANCE: 'supplier-performance'
  },

  // Cache durations (in seconds)
  CACHE_DURATION: {
    SHORT: 60,      // 1 minute
    MEDIUM: 300,    // 5 minutes
    LONG: 1800      // 30 minutes
  },

  // Clear all analytics cache
  clearCache: () => {
    if (typeof window !== 'undefined') {
      Object.values(analyticsCache.CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }
}

// Export default analytics service
export const analyticsService = {
  getAnalytics,
  utils: analyticsUtils,
  cache: analyticsCache,
  AnalyticsError
}

export default analyticsService
