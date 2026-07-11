'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Package, CheckCircle } from 'lucide-react';
import type { StoreResponse } from '@seapedia/types';

export default function StoreManagementPage() {
  const { toast } = useToast();
  const [store, setStore] = useState<StoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [storeName, setStoreName] = useState('');

  const fetchStore = async () => {
    try {
      const data = await api.get<StoreResponse>('/api/seller/store');
      setStore(data);
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    setCreating(true);
    try {
      const data = await api.post<StoreResponse>('/api/seller/store', { name: storeName });
      setStore(data);
      toast({ title: 'Store updated!', description: `Welcome to ${data.name}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="animate-pulse text-xl text-cyan-400">Loading...</div>
      </div>
    );
  }

  // Store exists — show overview
  if (store) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Store className="h-8 w-8 text-cyan-400" />
            My Store
          </h2>
          <p className="text-slate-300 mt-2">Manage your store profile.</p>
        </div>

        <Card className="glass border-white/10 bg-white/5 max-w-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Store className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">{store.name}</CardTitle>
                <CardDescription className="text-slate-400">Store ID: {store.id}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Package className="h-4 w-4 text-cyan-400" />
              <span>{store._count?.products ?? 0} products listed</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Store is active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No store — show creation form
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Store className="h-8 w-8 text-cyan-400" />
          Create Your Store
        </h2>
        <p className="text-slate-300 mt-2">Set up your store to start listing products and earning revenue.</p>
      </div>

      <Card className="glass border-white/10 bg-white/5 max-w-lg">
        <CardHeader>
          <CardTitle className="text-white">Store Details</CardTitle>
          <CardDescription>Choose a unique name for your store. This will be visible to buyers.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g., Ocean Fresh Market"
                required
                minLength={3}
                maxLength={100}
                className="bg-slate-900 border-white/10"
              />
            </div>
            <Button
              type="submit"
              disabled={creating || !storeName.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {creating ? 'Creating...' : 'Create Store'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
