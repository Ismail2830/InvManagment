"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/app/hooks/use-toast"; 

import { createProduct } from "@/app/lib/products";
import { getCategories } from "@/app/lib/categories";
import { getSuppliers } from "@/app/lib/suppliers";

interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

// Function to generate SKU
function generateSKU(productName: string, categoryName?: string): string {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const namePrefix = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove special characters
    .slice(0, 3) // Take first 3 characters
    .padEnd(3, 'X'); // Pad with X if less than 3 chars
  
  const categoryPrefix = categoryName
    ? categoryName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2).padEnd(2, 'X')
    : 'XX';
    
  return `${categoryPrefix}-${namePrefix}-${timestamp}`;
}

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    quantity: "",
    minStock: "",
    maxStock: "",
    unit: "pcs",
    categoryId: "",
    supplierId: ""
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [generatedSku, setGeneratedSku] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  // Load categories and suppliers on component mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [cats, sups] = await Promise.all([
          getCategories(),
          getSuppliers()
        ]);

        if (isMounted) {
          setCategories(cats);
          setSuppliers(sups);
        }
        
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Error loading data",
            description: "Failed to load categories or suppliers. Please refresh the page.",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
          setSuppliersLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []); 

  // Generate SKU whenever name or category changes
  useEffect(() => {
    if (formData.name) {
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoryId));
      const sku = generateSKU(formData.name, selectedCategory?.name);
      setGeneratedSku(sku);
    } else {
      setGeneratedSku("");
    }
  }, [formData.name, formData.categoryId, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        sku: generatedSku, // Use generated SKU
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.minStock) || 0,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
        unit: formData.unit,
        categoryId: parseInt(formData.categoryId),
        supplierId: parseInt(formData.supplierId)
      };

      await createProduct(productData);
      
      toast({
        title: "Product created",
        description: `"${formData.name}" has been added to inventory with SKU: ${generatedSku}`,
        variant: "default" // Fixed: changed from "success"
      });
      
      router.push("/products");
    } catch (error) {
      toast({
        title: "Error creating product",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive" // Fixed: changed from "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Add New Product</h1>
              <p className="text-muted-foreground">
                Add a new product to your inventory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                {/* Generated SKU Display */}
                {generatedSku && (
                  <div className="space-y-2">
                    <Label>Generated SKU</Label>
                    <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                      {generatedSku}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      SKU is automatically generated based on product name and category
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description (optional)"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Category and Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => handleChange("categoryId", value)}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select 
                      value={formData.supplierId} 
                      onValueChange={(value) => handleChange("supplierId", value)}
                      disabled={suppliersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={suppliersLoading ? "Loading suppliers..." : "Select a supplier"} />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Selling Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost Price</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.costPrice}
                      onChange={(e) => handleChange("costPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Current Stock</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Min Stock Level</Label>
                    <Input
                      id="minStock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.minStock}
                      onChange={(e) => handleChange("minStock", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Max Stock Level</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      min="0"
                      placeholder="Leave empty for no limit"
                      value={formData.maxStock}
                      onChange={(e) => handleChange("maxStock", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., pcs, kg, liters"
                    value={formData.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.name || !formData.categoryId || !formData.supplierId || !formData.price}
                    className="flex-1"
                  >
                    {loading ? "Creating Product..." : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/products">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}