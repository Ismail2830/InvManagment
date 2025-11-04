function apiUrl(path: string) {
  if (typeof window === "undefined") {
    const base =
      process.env.NEXT_PUBLIC_APP_URL || "";
      
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}


// GET /api/categories - List all categories
export async function getCategories() {
    try {
        const response = await fetch(apiUrl('/api/categories'), {
           // cache for 60 seconds
         // ensure fresh data on every request
        })
        if(!response.ok) {
            throw new Error(`Failed to fetch categories : ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Failed to fetch categories, Please try again later.");
    }
}

// GET /api/categories/[id] - Get category by ID
export async function getCategory(id: number) {
    try {
        const response = await fetch(`/api/categories/${id}`, {
            next: { revalidate: 300 } // cache for 5 minutes
        })
        if(!response.ok) {
            if(response.status === 404) {
                throw new Error("Category not found")
            }
            throw new Error(`Failed to fetch category : ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching category', error);
        throw error
    }
}

// POST /api/categories - Create a new category
export async function createCategory(data: {
    name: string;
    description?: string;
}) {
    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if(!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create category')   
        }
        return await response.json()

    } catch (error) {
        console.error('Error creating category', error);
        throw error
    }
}

// PUT /api/categories/[id] - Update a category
export async function updateCategory(id: number, data: {
    name: string
    description?: string
}) {
    try {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if(!response.ok) {
            const errorData = await response.json()
            if(response.status === 404) {
                throw new Error("Category not found")  
        }
            throw new Error(errorData.error || 'Failed to update category')
        }
        return await response.json()
    } catch (error) {
        console.error('Error updating category', error);
        throw error
    }
}

// Delete a category by ID using your API route
export async function deleteCategory(id: number) {
  try {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error("Category not found");
      }
      if (response.status === 409) {
        throw new Error("Cannot delete category with existing products");
      }
      throw new Error(errorData.error || 'Failed to delete category');
    }
    // DELETE returns 204 No Content
    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error('Error deleting category', error);
    throw error;
  }
}

// Helper function for form data
export async function createCategoryFromForm(formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
    }
    return createCategory(data)
}

// Helper function for form data
export async function updateCategoryFromForm(id: number, formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
    }
    return updateCategory(id, data)
}