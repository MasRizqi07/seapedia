'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { OrderResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';

export default function BuyerOrdersPage() {
  const { activeRole } = useAuthStore();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole === 'BUYER') {
      api.get<OrderResponse[]>('/api/orders')
        .then(setOrders)
        .catch(err => toast({ title: 'Error loading orders', description: err.message, variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  }, [activeRole]);

  if (activeRole !== 'BUYER') return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Order History</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">You have no orders yet.</div>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Order {order.id}
                  </CardTitle>
                  <div className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>
                <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="font-medium">{order.store?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.items?.length} items • {order.deliveryMethod.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                    <div className="font-bold text-lg text-ocean-600">{formatRupiah(order.totalAmount)}</div>
                    <Link href={`/dashboard/buyer/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="mt-2">View Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
