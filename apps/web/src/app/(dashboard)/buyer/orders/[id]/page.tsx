'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { OrderResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';

export default function BuyerOrderDetailPage() {
  const { activeRole } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole === 'BUYER' && params.id) {
      api.get<OrderResponse>(`/api/orders/${params.id}`)
        .then(setOrder)
        .catch(err => {
          toast({ title: 'Error', description: err.message, variant: 'destructive' });
          router.push('/dashboard/buyer/orders');
        })
        .finally(() => setLoading(false));
    }
  }, [activeRole, params.id, router]);

  if (activeRole !== 'BUYER') return null;
  if (loading) return <div>Loading...</div>;
  if (!order) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/buyer/orders" className="inline-flex items-center text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
      </Link>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Badge className="text-sm px-3 py-1">{order.status}</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items from {order.store?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.productId} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-400 m-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.product?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {formatRupiah(item.priceAtPurchase)}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold">
                    {formatRupiah(item.priceAtPurchase * item.quantity)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              {order.history && <OrderStatusTimeline history={order.history} />}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatRupiah(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PPN (12%)</span>
                <span>{formatRupiah(order.ppnAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span className="text-ocean-600">{formatRupiah(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Method</span>
                <Badge variant="outline">{order.deliveryMethod.replace('_', ' ')}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Order Date</span>
                <div className="font-medium">
                  {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
