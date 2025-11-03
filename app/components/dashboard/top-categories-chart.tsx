"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TopCategoriesChartProps {
  data: Array<{
    name: string
    fullName: string
    products: number
    value: number
    color: string
  }>
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      name: string
      fullName: string
      products: number
      value: number
      color: string
    }
  }>
}

export function TopCategoriesChart({ data }: TopCategoriesChartProps) {
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {item.fullName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Products: <span className="font-semibold">{item.products}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Value: <span className="font-semibold">${item.value.toLocaleString()}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">
          Top Categories by Products
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="products" 
                radius={[4, 4, 0, 0]}
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}