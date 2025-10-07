'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  Edit3, 
  Trash2, 
  MoreHorizontal, 
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Package,
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

import { deleteSupplier } from '@/app/lib/suppliers'
import type { Supplier } from '@/app/lib/suppliers'

interface SuppliersTableProps {
  data: Supplier[]
}

export function SuppliersTable({ data }: SuppliersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSupplier) return

    // Check if supplier has products
    if (selectedSupplier._count && selectedSupplier._count.products > 0) {
      toast({
        title: "Cannot delete supplier",
        description: "This supplier has products. Please reassign or delete all products first.",
        variant: "error"
      })
      setDeleteDialogOpen(false)
      return
    }

    setIsDeleting(true)

    try {
      await deleteSupplier(selectedSupplier.id)
      toast({
        title: "Supplier deleted",
        description: `${selectedSupplier.name} has been successfully deleted.`,
        variant: "success"
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error deleting supplier",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "error"
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSelectedSupplier(null)
    }
  }

  if (data.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="space-y-4">
        {/* Mobile View - Cards */}
        <div className="block lg:hidden space-y-4">
          {data.map((supplier) => (
            <SupplierCard 
              key={supplier.id} 
              supplier={supplier} 
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Supplier</TableHead>
                <TableHead className="w-[200px]">Contact</TableHead>
                <TableHead className="w-[150px]">Contact Person</TableHead>
                <TableHead className="w-[100px]">Products</TableHead>
                <TableHead className="w-[120px]">Created</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {supplier.name}
                      </div>
                      {supplier.address && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {supplier.address}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {supplier.email && (
                        <div className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <a 
                            href={`mailto:${supplier.email}`} 
                            className="text-blue-600 hover:underline"
                          >
                            {supplier.email}
                          </a>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <a 
                            href={`tel:${supplier.phone}`} 
                            className="text-blue-600 hover:underline"
                          >
                            {supplier.phone}
                          </a>
                        </div>
                      )}
                      {!supplier.email && !supplier.phone && (
                        <span className="text-xs text-muted-foreground italic">
                          No contact info
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {supplier.contactPerson ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{supplier.contactPerson}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Not specified
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
                      {supplier._count?.products || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(supplier.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <SupplierActions 
                      supplier={supplier} 
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
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSupplier?.name}"? 
              This action cannot be undone.
              {selectedSupplier?._count && selectedSupplier._count.products > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive text-sm">
                  ⚠️ This supplier has {selectedSupplier._count.products} products.
                  You must reassign or delete all products before deleting this supplier.
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
interface SupplierCardProps {
  supplier: Supplier
  onDelete: (supplier: Supplier) => void
}

function SupplierCard({ supplier, onDelete }: SupplierCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <h3 className="font-semibold leading-none flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {supplier.name}
          </h3>
          <p className="text-xs text-muted-foreground">ID: {supplier.id}</p>
        </div>
        <SupplierActions supplier={supplier} onDelete={onDelete} />
      </div>

      {/* Contact Info */}
      <div className="space-y-2">
        {supplier.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <a 
              href={`mailto:${supplier.email}`} 
              className="text-blue-600 hover:underline"
            >
              {supplier.email}
            </a>
          </div>
        )}
        {supplier.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <a 
              href={`tel:${supplier.phone}`} 
              className="text-blue-600 hover:underline"
            >
              {supplier.phone}
            </a>
          </div>
        )}
        {supplier.contactPerson && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            {supplier.contactPerson}
          </div>
        )}
        {supplier.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            {supplier.address}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          {supplier._count?.products || 0} products
        </div>
        <div>
          {new Date(supplier.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

// Actions Dropdown Component
interface SupplierActionsProps {
  supplier: Supplier
  onDelete: (supplier: Supplier) => void
}

function SupplierActions({ supplier, onDelete }: SupplierActionsProps) {
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
          <Link href={`/suppliers/${supplier.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/suppliers/${supplier.id}/edit`}>
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Supplier
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => onDelete(supplier)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Supplier
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
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No suppliers found</h3>
      <p className="text-muted-foreground mb-4">
        Get started by adding your first supplier.
      </p>
      <Button asChild>
        <Link href="/suppliers/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Link>
      </Button>
    </div>
  )
}
