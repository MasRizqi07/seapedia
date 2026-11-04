'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import type { ProductResponse } from '@seapedia/types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
  });

  useEffect(() => {
    api
      .get<ProductResponse>(`/api/products/${productId}`)
      .then((product) => {
        setForm({
          name: product.name,
          description: product.description,
          price: String(product.price),
          stock: String(product.stock),
          imageUrl: product.imageUrl || '',
        });
      })
      .catch((err: unknown) => {
        const message = err instanceof ApiError ? err.message : 'Failed to fetch product';
        toast({ title: 'Error', description: message, variant: 'destructive' });
        router.push('/seller/products');
      })
      .finally(() => setLoading(false));
  }, [productId, router, toast]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch(`/api/seller/products/${productId}`, {
        name: form.name,
        description: form.description,
        price: parseInt(form.price, 10),
        stock: parseInt(form.stock, 10),
        imageUrl: form.imageUrl || undefined,
      });

      toast({ title: 'Product updated!', description: `${form.name} has been saved.` });
      router.push('/seller/products');
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to update product';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="animate-pulse text-xl text-cyan-400">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/seller/products">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Pencil className="h-8 w-8 text-cyan-400" />
            Edit Product
          </h2>
          <p className="text-slate-300 mt-1">Update your product listing.</p>
        </div>
      </div>

      <Card className="glass border-white/10 bg-white/5 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white">Product Details</CardTitle>
          <CardDescription>Modify the fields you want to update.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Fresh Atlantic Salmon"
                required
                minLength={3}
                maxLength={200}
                className="bg-slate-900 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your product in detail..."
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rp) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="150000"
                  required
                  min={1000}
                  className="bg-slate-900 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => updateField('stock', e.target.value)}
                  placeholder="50"
                  required
                  min={0}
                  className="bg-slate-900 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                placeholder="https://images.example.com/product.jpg"
                className="bg-slate-900 border-white/10"
              />
            </div>

            {/* Image Preview */}
            {form.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10 h-48">
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
