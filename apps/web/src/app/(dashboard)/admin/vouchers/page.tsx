'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { Ticket, Plus } from 'lucide-react';
import Link from 'next/link';

interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Voucher[]>('/api/admin/vouchers')
      .then(setVouchers)
      .catch(err => toast({ title: 'Error', description: err.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ticket className="w-8 h-8 text-primary" /> Vouchers
        </h1>
        <Link href="/dashboard/admin/vouchers/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" /> Create Voucher
        </Link>
      </div>
      
      {vouchers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            No vouchers configured.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <Card key={voucher.id}>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xl font-bold font-mono tracking-widest text-primary text-center uppercase">
                  {voucher.code}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Value</span>
                  <span className="font-medium">
                    {voucher.discountType === 'FIXED' ? formatRupiah(voucher.value) : `${voucher.value}% OFF`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used / Limit</span>
                  <span className="font-medium">{voucher.usedCount} / {voucher.usageLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className={`font-medium ${new Date(voucher.expiryDate) < new Date() ? 'text-destructive' : ''}`}>
                    {new Date(voucher.expiryDate).toLocaleString('id-ID')}
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
