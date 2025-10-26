import Link from 'next/link'
import { 
  Package, 
  BarChart3, 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Layers3,
  Building2,
  LineChart
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="h-4 w-4" />
            Modern Inventory Management System
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            Manage Your Inventory
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              With Confidence
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Streamline your product management, track orders in real-time, and make data-driven decisions with powerful analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/products">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20"></div>
          <Card className="relative overflow-hidden border-2">
            <CardContent className="p-6 sm:p-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Products', value: '1,234', icon: Package, color: 'text-blue-600' },
                  { label: 'Orders', value: '567', icon: ShoppingCart, color: 'text-green-600' },
                  { label: 'Categories', value: '24', icon: Layers3, color: 'text-purple-600' },
                  { label: 'Suppliers', value: '48', icon: Building2, color: 'text-orange-600' }
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 flex items-center justify-center h-40">
                <LineChart className="h-20 w-20 text-gray-400 dark:text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features to help you manage inventory efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Package,
              title: 'Product Management',
              description: 'Easily add, edit, and organize your products with categories and suppliers.',
              color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
            },
            {
              icon: ShoppingCart,
              title: 'Order Tracking',
              description: 'Track orders in real-time with status updates and date range filtering.',
              color: 'bg-green-100 text-green-600 dark:bg-green-900/30'
            },
            {
              icon: BarChart3,
              title: 'Analytics Dashboard',
              description: 'Get insights with charts, stock alerts, and performance metrics.',
              color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
            },
            {
              icon: TrendingUp,
              title: 'Stock Movements',
              description: 'Record and track all inventory movements with detailed history.',
              color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
            },
            {
              icon: Layers3,
              title: 'Category System',
              description: 'Organize products into categories for better management.',
              color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30'
            },
            {
              icon: Building2,
              title: 'Supplier Management',
              description: 'Manage supplier information and track supplier performance.',
              color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
            }
          ].map((feature, i) => (
            <Card key={i} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '100%', label: 'Free & Open Source' },
              { value: '24/7', label: 'Real-time Updates' },
              { value: '∞', label: 'Unlimited Products' },
              { value: '< 1s', label: 'Lightning Fast' }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Start managing your inventory efficiently today. No credit card required.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Inventory Pro</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 Inventory Pro. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/products" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Products
              </Link>
              <Link href="/orders" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Orders
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
