"use client"

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategory, updateCategory } from '@/app/lib/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Category = {
  id: number;
  name: string;
  description?: string;
}

export default function EditCategoryPage() {
  const { id } = useParams(); // Get the category ID from the URL
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        if (typeof id !== 'string') {
          throw new Error("Category ID is invalid");
        }
        const fetchedCategory = await getCategory(parseInt(id, 10));
        setCategory(fetchedCategory);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!category) return;

    try {
      const updatedCategory = await updateCategory(category.id, {
        name: category.name,
        description: category.description,
      });

      // Redirect or show success message
      window.location.href = '/categories';
    } catch (error) {
      console.error(error);
      setError("Failed to update category");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!category) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link 
              href="/categories"
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mr-4"
            >
              Back to Categories
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Edit Category
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Update category details and information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <form onSubmit={handleUpdate} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Category Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={category.name}
                  onChange={(e) => setCategory({ ...category, name: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Description
                  <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={category.description || ''}
                  onChange={(e) => setCategory({ ...category, description: e.target.value })}
                  placeholder="Provide additional details about this category..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
              <Button 
                type="submit"
                className="flex-1 sm:flex-none"
              >
                Update Category
              </Button>
              <Link 
                href="/categories"
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}