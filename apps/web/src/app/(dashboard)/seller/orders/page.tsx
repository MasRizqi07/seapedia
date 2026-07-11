'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { OrderResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Package } from 'lucide-react';

export default function SellerOrdersPage() {
  const { activeRole } = useAuthStore();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchOrders = () => {
    if (activeRole === 'SELLER') {
      api.get<OrderResponse[]>('/api/seller/orders')
        .then(setOrders)
        .catch(err => toast({ title: 'Error loading orders', description: err.message, variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeRole]);

  const handleProcess = async (orderId: string) => {
    setProcessingId(orderId);
    try {
      await api.patch(`/api/seller/orders/${orderId}/process`, {});
      toast({ title: 'Order processed successfully!' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Failed to process order', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  if (activeRole !== 'SELLER') return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Incoming Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            No incoming orders yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Order ID: {order.id}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium', timeStyle: 'short'
                    })}
                  </div>
                </div>
                <Badge variant={order.status === 'PACKING' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    {order.items?.map(item => (
                      <div key={item.productId} className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.product?.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{item.product?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} x {formatRupiah(item.priceAtPurchase)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-right ml-4 pl-4 border-l flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total Revenue</div>
                      <div className="font-bold text-ocean-600">{formatRupiah(order.subtotal)}</div>
                      <div className="text-xs text-muted-foreground mt-2">Delivery</div>
                      <div className="text-sm font-medium">{order.deliveryMethod.replace('_', ' ')}</div>
                    </div>
                    {order.status === 'PACKING' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleProcess(order.id)}
                          disabled={processingId === order.id}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                          {processingId === order.id ? 'Processing...' : 'Proses Pesanan'}
                        </button>
                      </div>
                    )}
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
