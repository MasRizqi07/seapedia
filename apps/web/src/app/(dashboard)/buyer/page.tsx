'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { api } from '@/lib/api';
import { formatRupiah } from '@/lib/utils';
import type { WalletResponse } from '@seapedia/types';

export default function BuyerDashboardPage() {
  const { activeRole } = useAuthStore();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole !== 'BUYER') return;

    api
      .get<WalletResponse>('/api/wallet')
      .then(setWallet)
      .catch(() => setWallet(null))
      .finally(() => setLoading(false));
  }, [activeRole]);

  if (activeRole !== 'BUYER') {
    return <div className="text-red-400">Unauthorized</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="h-8 w-8 text-cyan-400" />
          Buyer Dashboard
        </h2>
        <p className="text-slate-300 mt-2">Manage your purchases, cart, and addresses.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '...' : formatRupiah(wallet?.balance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
