'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { OrderResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OverdueOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    api.get<OrderResponse[]>('/api/admin/orders/overdue')
      .then(setOrders)
      .catch(err => toast({ title: 'Error loading orders', description: err.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Overdue & Returned Orders</h1>
      </div>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            No overdue or returned orders found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className={order.status === 'RETURNED' ? 'border-destructive/20 bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}>
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm">Order ID: {order.id}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      Store: {order.store?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${order.status === 'RETURNED' ? 'text-destructive' : 'text-amber-600'}`}>
                      {order.status}
                    </div>
                    <div className="text-sm font-medium">{formatRupiah(order.totalAmount)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="text-sm">
                  <div className="font-medium mb-2">Order Items:</div>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {order.items?.map(item => (
                      <li key={item.productId}>{item.product?.name} x{item.quantity}</li>
                    ))}
                  </ul>
                </div>
                
                {order.history && order.history.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="font-medium text-sm mb-2">History & Refund Trail:</div>
                    <div className="space-y-2">
                      {order.history.map(h => (
                        <div key={h.id} className="flex gap-3 text-sm">
                          <div className="w-24 shrink-0 text-muted-foreground text-xs">
                            {new Date(h.changedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                          <div>
                            <span className="font-medium">{h.status}</span>
                            {h.note && <span className="text-muted-foreground ml-2">— {h.note}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {order.status !== 'RETURNED' && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 mt-2 bg-amber-100/50 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>This order has breached its SLA ({new Date(order.slaDueAt!).toLocaleString('id-ID')}) and will be refunded in the next sweep.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
