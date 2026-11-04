'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { ProductResponse } from '@seapedia/types';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';

export default function SellerProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await api.get<ProductResponse[]>('/api/seller/products');
      setProducts(data);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error fetching products';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/api/seller/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: 'Product deleted' });
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error deleting product';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const stockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>;
    if (stock <= 10) return <Badge className="bg-yellow-600 text-white">Low: {stock}</Badge>;
    return <Badge className="bg-green-600 text-white">{stock} in stock</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="animate-pulse text-xl text-cyan-400">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="h-8 w-8 text-cyan-400" />
            Products
          </h2>
          <p className="text-slate-300 mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} listed
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card className="glass border-white/10 bg-white/5 p-12 text-center">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-lg text-slate-300 mb-4">No products yet.</p>
          <Link href="/seller/products/new">
            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="glass border-white/10 bg-white/5 hover:border-cyan-500/30 transition-colors overflow-hidden"
            >
              {/* Image */}
              <div className="h-40 bg-slate-800 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-slate-600" />
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white text-lg leading-tight line-clamp-1">
                    {product.name}
                  </h3>
                  {stockBadge(product.stock)}
                </div>

                <p className="text-slate-400 text-sm line-clamp-2">{product.description}</p>

                <div className="text-xl font-bold text-cyan-400">
                  Rp {product.price.toLocaleString('id-ID')}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <Link href={`/seller/products/${product.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/10 text-slate-300 hover:text-white"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                    onClick={() => handleDelete(product.id, product.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
