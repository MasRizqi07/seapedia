'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CartResponse, AddressResponse, WalletResponse, OrderResponse, DeliveryMethod } from '@seapedia/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DELIVERY_FEES = {
  [DeliveryMethod.INSTANT]: 25000,
  [DeliveryMethod.NEXT_DAY]: 15000,
  [DeliveryMethod.REGULAR]: 10000,
};

export default function CheckoutPage() {
  const { activeRole } = useAuthStore();
  const router = useRouter();
  
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.REGULAR);
  const [discountCode, setDiscountCode] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeRole !== 'BUYER') return;

    Promise.all([
      api.get<CartResponse>('/api/cart'),
      api.get<AddressResponse[]>('/api/address'),
      api.get<WalletResponse>('/api/wallet')
    ]).then(([cartData, addressesData, walletData]) => {
      setCart(cartData);
      setAddresses(addressesData);
      setWallet(walletData);
      
      if (addressesData.length > 0) {
        const defaultAddr = addressesData.find(a => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : addressesData[0].id);
      }
      setLoading(false);
    }).catch(err => {
      toast({ title: 'Error loading checkout data', description: err.message, variant: 'destructive' });
      setLoading(false);
    });
  }, [activeRole]);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast({ title: 'Please select a delivery address', variant: 'destructive' });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast({ title: 'Your cart is empty', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.post<OrderResponse>('/api/checkout', {
        addressId: selectedAddressId,
        deliveryMethod,
        discountCode: discountCode || undefined,
      });
      
      toast({ title: 'Order successful!' });
      router.push(`/dashboard/buyer/orders/${order.id}`);
    } catch (err: any) {
      toast({ title: 'Checkout failed', description: err.message, variant: 'destructive' });
      setSubmitting(false);
    }
  };

  if (activeRole !== 'BUYER') return null;
  if (loading) return <div>Loading...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const deliveryFee = DELIVERY_FEES[deliveryMethod];
  const ppnAmount = Math.floor(subtotal * 0.12);
  const totalAmount = subtotal + deliveryFee + ppnAmount;
  const isInsufficientBalance = (wallet?.balance || 0) < totalAmount;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div>
                  <p className="text-red-500 mb-2">You need to add a delivery address first.</p>
                  <Button variant="outline" onClick={() => router.push('/dashboard/buyer/addresses')}>
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      className={`p-4 border rounded-lg cursor-pointer ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-slate-300'}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="font-bold">{addr.label} {addr.isDefault && <span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full ml-2">Default</span>}</div>
                      <div className="text-sm mt-1">{addr.recipientName} - {addr.phone}</div>
                      <div className="text-sm text-muted-foreground mt-1">{addr.fullAddress}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={deliveryMethod} onValueChange={(val) => setDeliveryMethod(val as DeliveryMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DeliveryMethod.INSTANT}>Instant (Rp 25.000)</SelectItem>
                  <SelectItem value={DeliveryMethod.NEXT_DAY}>Next Day (Rp 15.000)</SelectItem>
                  <SelectItem value={DeliveryMethod.REGULAR}>Regular (Rp 10.000)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden">
                        {item.product?.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <div className="font-medium">{item.product?.name}</div>
                        <div className="text-sm text-muted-foreground">{item.quantity} x {formatRupiah(item.product?.price || 0)}</div>
                      </div>
                    </div>
                    <div className="font-bold">
                      {formatRupiah((item.product?.price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discount Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Voucher or Promo code"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Discount will be applied to subtotal during checkout processing. 
                Invalid codes will cause checkout to fail.
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatRupiah(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PPN (12%)</span>
                <span>{formatRupiah(ppnAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span className="text-ocean-600">{formatRupiah(totalAmount)}</span>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wallet Balance</span>
                  <span className={isInsufficientBalance ? 'text-red-500 font-bold' : ''}>
                    {formatRupiah(wallet?.balance || 0)}
                  </span>
                </div>
                {isInsufficientBalance && (
                  <div className="text-red-500 text-xs">
                    Insufficient balance. Please top up your wallet.
                  </div>
                )}
              </div>

              <Button 
                className="w-full font-bold" 
                size="lg"
                onClick={handleCheckout}
                disabled={submitting || addresses.length === 0 || isInsufficientBalance}
              >
                {submitting ? 'Processing...' : 'Pay & Checkout'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
