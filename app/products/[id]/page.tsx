"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/app/hooks/use-toast"; 

import { updateProduct, getProduct, Product } from "@/app/lib/products";
import { getCategories } from "@/app/lib/categories";

interface Category {
  id: number;
  name: string;
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    quantity: "",
    minStock: "",
    maxStock: "",
    categoryId: ""
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [productId, setProductId] = useState<number | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Load product and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;
        const parsedId = parseInt(id);
        
        if (isNaN(parsedId)) {
          notFound();
          return;
        }
        
        setProductId(parsedId);

        const [product, cats] = await Promise.all([
          getProduct(parsedId),
          getCategories()
        ]);

        setFormData({
          name: product.name,
          sku: product.sku,
          description: product.description || "",
          price: product.price.toString(),
          quantity: product.quantity.toString(),
          minStock: product.minStock.toString(),
          maxStock: product.maxStock ? product.maxStock.toString() : "",
          categoryId: product.categoryId.toString()
        });
        
        setCategories(cats);
      } catch (error) {
        toast({
          title: "Error loading product",
          description: "Failed to load product data. Please try again.",
          variant: "error"
        });
        router.push("/products");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [params, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.minStock) || 0,
        maxStock: formData.maxStock ? parseInt(formData.maxStock) : undefined,
        categoryId: parseInt(formData.categoryId)
      };

      await updateProduct(productId, productData);
      
      toast({
        title: "Product updated",
        description: `"${formData.name}" has been updated successfully.`,
        variant: "success"
      });
      
      router.push("/products");
    } catch (error) {
      toast({
        title: "Error updating product",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Edit Product</h1>
              <p className="text-muted-foreground">
                Update product information
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      placeholder="Enter SKU"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                      required
                    />
                  </div>
                </div>

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

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleChange("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStock">Max Stock Level (Optional)</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    min="0"
                    placeholder="Leave empty for no limit"
                    value={formData.maxStock}
                    onChange={(e) => handleChange("maxStock", e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.name || !formData.sku || !formData.categoryId || !formData.price}
                    className="flex-1"
                  >
                    {loading ? "Updating Product..." : "Update Product"}
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
