'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { Tag, Plus } from 'lucide-react';
import Link from 'next/link';

interface Promo {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  expiryDate: string;
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Promo[]>('/api/admin/promos')
      .then(setPromos)
      .catch(err => toast({ title: 'Error', description: err.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag className="w-8 h-8 text-primary" /> Promos
        </h1>
        <Link href="/dashboard/admin/promos/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" /> Create Promo
        </Link>
      </div>
      
      {promos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            No promos configured.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((promo) => (
            <Card key={promo.id}>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xl font-bold font-mono tracking-widest text-primary text-center uppercase">
                  {promo.code}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-medium">
                    {promo.discountType === 'FIXED' ? formatRupiah(promo.value) : `${promo.value}% OFF`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className={`font-medium ${new Date(promo.expiryDate) < new Date() ? 'text-destructive' : ''}`}>
                    {new Date(promo.expiryDate).toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
