'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { formatRupiah } from '@/lib/utils';
import { Wallet, Activity, ArrowUpRight } from 'lucide-react';

export default function BuyerReportsPage() {
  const { activeRole } = useAuthStore();
  const [report, setReport] = useState<{ total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole === 'BUYER') {
      api.get<{ total: number }>('/api/buyer/reports/spending')
        .then(setReport)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeRole]);

  if (activeRole !== 'BUYER') return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">Spending Report</h1>
      <p className="text-muted-foreground">Overview of your spending on completed orders.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : formatRupiah(report?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime spending on completed orders
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
