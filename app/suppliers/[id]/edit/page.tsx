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
import { useToast } from "@/app/hooks/use-toast"; 

import { updateSupplier, getSupplier } from "@/app/lib/suppliers";

interface EditSupplierPageProps {
  params: Promise<{ id: string }>
}

export default function EditSupplierPage({ params }: EditSupplierPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: ""
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [supplierId, setSupplierId] = useState<number | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Load supplier data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;
        const parsedId = parseInt(id);
        
        if (isNaN(parsedId)) {
          notFound();
          return;
        }
        
        setSupplierId(parsedId);
        const supplier = await getSupplier(parsedId);

        setFormData({
          name: supplier.name,
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          contactPerson: supplier.contactPerson || ""
        });
      } catch (error) {
        toast({
          title: "Error loading supplier",
          description: "Failed to load supplier data. Please try again.",
          variant: "error"
        });
        router.push("/suppliers");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [params, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;

    setLoading(true);

    try {
      const supplierData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        contactPerson: formData.contactPerson || undefined
      };

      await updateSupplier(supplierId, supplierData);
      
      toast({
        title: "Supplier updated",
        description: `"${formData.name}" has been updated successfully.`,
        variant: "success"
      });
      
      router.push("/suppliers");
    } catch (error) {
      toast({
        title: "Error updating supplier",
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
          <p className="text-muted-foreground">Loading supplier...</p>
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
              <Link href="/suppliers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Suppliers
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Supplier</h1>
              <p className="text-muted-foreground">
                Update supplier information
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
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter supplier name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@supplier.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    placeholder="John Smith"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange("contactPerson", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter supplier address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.name.trim()}
                    className="flex-1"
                  >
                    {loading ? "Updating Supplier..." : "Update Supplier"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/suppliers">Cancel</Link>
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
