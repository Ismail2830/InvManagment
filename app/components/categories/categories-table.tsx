'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  Edit3, 
  Trash2, 
  MoreHorizontal, 
  Package,
  Calendar,
  Plus
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/app/hooks/use-toast'

import { deleteCategory } from '@/app/lib/categories'

interface Category {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

interface CategoriesTableProps {
  data: Category[]
}

export function CategoriesTable({ data }: CategoriesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return

    // Check if category has products
    if (selectedCategory._count && selectedCategory._count.products > 0) {
      toast({
        title: "Cannot delete category",
        description: "This category contains products. Please move or delete all products first.",
        variant: "destructive",
      })
      setDeleteDialogOpen(false)
      return
    }

    setIsDeleting(true)

    try {
      await deleteCategory(selectedCategory.id)
      toast({
        title: "Category deleted",
        description: `${selectedCategory.name} has been successfully deleted.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error deleting category",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedCategory(null)
    }
  }

  if (data.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="space-y-4">
        {/* Mobile View - Cards */}
        <div className="block md:hidden space-y-4">
          {data.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Products</TableHead>
                <TableHead className="w-[140px]">Created</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-semibold">{category.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate">
                      {category.description || (
                        <span className="text-muted-foreground italic">
                          No description
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
                      {category._count?.products || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <CategoryActions 
                      category={category} 
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? 
              This action cannot be undone.
              {selectedCategory?._count && selectedCategory._count.products > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive text-sm">
                  ⚠️ This category contains {selectedCategory._count.products} products.
                  You must move or delete all products before deleting this category.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Mobile Card Component
interface CategoryCardProps {
  category: Category
  onDelete: (category: Category) => void
}

function CategoryCard({ category, onDelete }: CategoryCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none">{category.name}</h3>
          <p className="text-xs text-muted-foreground">ID: {category.id}</p>
        </div>
        <CategoryActions category={category} onDelete={onDelete} />
      </div>

      {category.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          {category._count?.products || 0} products
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(category.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

// Actions Dropdown Component
interface CategoryActionsProps {
  category: Category
  onDelete: (category: Category) => void
}

function CategoryActions({ category, onDelete }: CategoryActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`/categories/${category.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/categories/${category.id}/edit`}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Category
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => onDelete(category)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No categories found</h3>
      <p className="text-muted-foreground mb-4">
        Get started by creating your first product category.
      </p>
      <Button asChild>
        <Link href="/categories/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Link>
      </Button>
    </div>
  )
}
