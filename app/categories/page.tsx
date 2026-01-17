'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


import { getCategories } from '../lib/categories'
import { CategoriesTable } from '../components/categories/categories-table'
import { CategoriesTableSkeleton } from '../components/categories/categories-table-skeleton'
import { useEffect, useState } from 'react'



export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load categories'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className='min-h-screen bg-background'>
      {/* Header Section */}
      <div className='border-b bg-background/95 backdrop:blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                Categories
              </h1>
              <p className='text-muted-foreground'>
                Manage your product categories and organize your inventory
              </p>
            </div>

            <Button asChild className='w-full md:w-auto'>
              <Link href={'/categories/new'}>
                <Plus className='mr-2 h-4 w-4' />
                Add Category
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CategoriesTableSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-destructive/10 p-3 mb-4">
                  <svg
                    className="h-6 w-6 text-destructive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Failed to load categories</h3>
                <p className="text-muted-foreground mb-4">
                  {error.message}
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : (
              <CategoriesTable data={categories} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
