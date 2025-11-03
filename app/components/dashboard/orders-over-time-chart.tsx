"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, TrendingUp, DollarSign, Package2 } from 'lucide-react'

interface OrdersOverTimeChartProps {
  data: Array<{
    date: string
    count: number
    revenue: number
    label: string
  }>
  summary: {
    total: number
    today: number
    pending: number
    completed: number
    totalRevenue: number
    averageOrderValue?: number
    growthPercentage?: number
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      date: string
      count: number
      revenue: number
      label: string
    }
  }>
}

export function OrdersOverTimeChart({ data, summary }: OrdersOverTimeChartProps) {
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-sm mb-1">{item.label}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Orders: <span className="font-semibold">{item.count}</span>
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Revenue: <span className="font-semibold">${item.revenue.toFixed(2)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const growthPercentage = summary.growthPercentage || 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            Orders Overview
          </CardTitle>
          {growthPercentage !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              growthPercentage > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-3 w-3 ${growthPercentage < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(growthPercentage).toFixed(1)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Package2 className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Today</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{summary.today}</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Revenue</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              margin={{ top: 5, right: 5, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={Math.floor(data.length / 7)}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Last {data.length} days
        </div>
      </CardContent>
    </Card>
  )
}