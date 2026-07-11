'use client';

import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import type { ProductResponse, PaginatedResponse } from '@seapedia/types';

export default function ProductsPage() {
  const [data, setData] = useState<PaginatedResponse<ProductResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        sortBy,
        sortOrder,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const result = await api.get<PaginatedResponse<ProductResponse>>(
        `/api/products?${params.toString()}`,
      );
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSort = (field: 'createdAt' | 'price') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'price' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-white">Catalog</h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 bg-slate-900 border-white/10 w-64"
              />
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-1">
              <SlidersHorizontal className="h-4 w-4 text-slate-400 mr-1" />
              <Button
                variant={sortBy === 'createdAt' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSort('createdAt')}
                className={sortBy === 'createdAt' ? 'bg-cyan-600 text-white' : 'text-slate-400'}
              >
                Newest {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSort('price')}
                className={sortBy === 'price' ? 'bg-cyan-600 text-white' : 'text-slate-400'}
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="animate-pulse text-xl text-cyan-400">Loading products...</div>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] text-center">
            <Package className="h-16 w-16 text-slate-600 mb-4" />
            <p className="text-xl text-slate-300 mb-2">No products found</p>
            <p className="text-slate-500">
              {debouncedSearch
                ? `No results for "${debouncedSearch}". Try a different search.`
                : 'Check back later for new listings!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.data.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="glass border-white/10 hover:border-cyan-500/50 transition-all hover:scale-[1.02] cursor-pointer overflow-hidden h-full">
                    {/* Product Image */}
                    <div className="h-48 bg-slate-800 flex items-center justify-center overflow-hidden">
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

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-cyan-400 line-clamp-1">{product.name}</CardTitle>
                      <CardDescription className="text-slate-400 line-clamp-1">
                        {product.store?.name || 'Unknown Store'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        {product.stock === 0 ? (
                          <Badge variant="destructive" className="text-xs">Sold out</Badge>
                        ) : product.stock <= 10 ? (
                          <Badge className="bg-yellow-600 text-white text-xs">Low stock</Badge>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="border-white/10 text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-slate-400">
                  Page {data.meta.page} of {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-white/10 text-slate-300"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Result count */}
            <p className="text-center text-sm text-slate-500 mt-4">
              Showing {data.data.length} of {data.meta.total} products
            </p>
          </>
        )}
      </main>
    </div>
  );
}
