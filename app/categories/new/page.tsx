import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryForm } from '../../components/categories/category-form'

export default function NewCategoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Category</h1>
            <p className="text-sm text-muted-foreground">Create a category to organize products.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Fill out the details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}