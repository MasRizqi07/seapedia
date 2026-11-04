'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { CartResponse } from '@seapedia/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function BuyerCartPage() {
  const { activeRole } = useAuthStore();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const data = await api.get<CartResponse>('/api/cart');
      setCart(data);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error loading cart';
      toast({ title: 'Error loading cart', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRole === 'BUYER') void fetchCart();
  }, [activeRole]);

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const data = await api.patch<CartResponse>(`/api/cart/items/${productId}`, { quantity });
      setCart(data);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error updating quantity';
      toast({ title: 'Error updating quantity', description: message, variant: 'destructive' });
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const data = await api.delete<CartResponse>(`/api/cart/items/${productId}`);
      setCart(data);
      toast({ title: 'Item removed' });
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error removing item';
      toast({ title: 'Error removing item', description: message, variant: 'destructive' });
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    try {
      const data = await api.delete<CartResponse>('/api/cart');
      setCart(data);
      toast({ title: 'Cart cleared' });
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Error clearing cart';
      toast({ title: 'Error clearing cart', description: message, variant: 'destructive' });
    }
  };

  if (activeRole !== 'BUYER') return null;

  if (loading) return <div className="p-4 text-text-secondary">Loading cart...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Cart</h1>
        {cart && cart.items.length > 0 && (
          <Button variant="destructive" onClick={clearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      {!cart || cart.items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">Your cart is empty.</div>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.productId}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-24 h-24 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">No Image</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{item.product?.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.product?.store?.name}</p>
                      <div className="font-bold text-ocean-600 mt-1">
                        {formatRupiah(item.product?.price || 0)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatRupiah(cart.subtotal)}</span>
                </div>
                <div className="text-xs text-muted-foreground border-b pb-4">
                  Taxes and shipping calculated at checkout.
                </div>
                <Link href="/buyer/checkout" className="block">
                  <Button className="w-full font-bold">Proceed to Checkout</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
