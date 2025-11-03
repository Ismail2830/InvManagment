'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createCategoryFromForm } from '@/app/lib/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CategoryFormProps {
  initialData?: {
    name: string
    description?: string | null
  }
  isEdit?: boolean
  categoryId?: number
}

export function CategoryForm({ initialData, isEdit = false }: CategoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    
    try {
      await createCategoryFromForm(formData)
      toast.success('Category created successfully!')
      router.push('/categories')
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Category Name
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Electronics, Clothing, Books"
          defaultValue={initialData?.name}
          required
          disabled={isLoading}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Choose a clear, descriptive name for your category
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description
          <span className="text-muted-foreground text-sm ml-1">(Optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Provide additional details about this category..."
          defaultValue={initialData?.description || ''}
          rows={4}
          disabled={isLoading}
          className="w-full resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Help others understand what products belong in this category
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Creating...' : isEdit ? 'Update Category' : 'Create Category'}
        </Button>
        <Button 
          variant="outline" 
          type="button"
          disabled={isLoading}
          onClick={() => router.push('/categories')}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}