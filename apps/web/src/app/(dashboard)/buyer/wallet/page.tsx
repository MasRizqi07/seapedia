'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { WalletResponse, WalletTransactionResponse } from '@seapedia/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

export default function BuyerWalletPage() {
  const { activeRole } = useAuthStore();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [toppingUp, setToppingUp] = useState(false);

  const fetchWallet = async () => {
    try {
      const data = await api.get<WalletResponse>('/api/wallet');
      setWallet(data);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error loading wallet';
      toast({ title: 'Error loading wallet', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await api.get<WalletTransactionResponse[]>('/api/wallet/transactions');
      setWallet((prev) => (prev ? { ...prev, transactions: data } : null));
    } catch {
      // Non-blocking fallback
    }
  };

  useEffect(() => {
    if (activeRole === 'BUYER') {
      void fetchWallet().then(fetchTransactions);
    }
  }, [activeRole]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(topupAmount, 10);
    if (isNaN(amount) || amount < 1000) {
      toast({
        title: 'Invalid amount',
        description: 'Minimum top up is Rp 1.000',
        variant: 'destructive',
      });
      return;
    }

    setToppingUp(true);
    try {
      await api.post('/api/wallet/topup', { amount });
      toast({ title: 'Top up successful!' });
      setTopupAmount('');
      void fetchWallet().then(fetchTransactions);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Top up failed';
      toast({ title: 'Top up failed', description: message, variant: 'destructive' });
    } finally {
      setToppingUp(false);
    }
  };

  if (activeRole !== 'BUYER') return null;

  if (loading) return <div className="p-4 text-text-secondary">Loading wallet...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available funds for shopping</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-ocean-600 mb-6">
              {formatRupiah(wallet?.balance || 0)}
            </div>

            <form onSubmit={handleTopup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Top Up Amount (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1000"
                  step="1000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="e.g. 100000"
                  required
                />
              </div>
              <Button type="submit" disabled={toppingUp} className="w-full">
                {toppingUp ? 'Processing...' : 'Top Up (Simulated)'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {wallet?.transactions && wallet.transactions.length > 0 ? (
              <div className="space-y-4">
                {wallet.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-3 border rounded-lg bg-background/50"
                  >
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div
                      className={`font-bold ${tx.type === 'TOPUP' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {tx.type === 'TOPUP' ? '+' : '-'}
                      {formatRupiah(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
