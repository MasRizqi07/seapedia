'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import { AddressResponse } from '@seapedia/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/auth-store';

export default function BuyerAddressesPage() {
  const { activeRole } = useAuthStore();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    label: '',
    recipientName: '',
    phone: '',
    fullAddress: '',
  });

  const fetchAddresses = async () => {
    try {
      const data = await api.get<AddressResponse[]>('/api/address');
      setAddresses(data);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch addresses';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRole === 'BUYER') void fetchAddresses();
  }, [activeRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/address', form);
      toast({ title: 'Address added' });
      setIsAdding(false);
      setForm({ label: '', recipientName: '', phone: '', fullAddress: '' });
      await fetchAddresses();
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to add address';
      toast({ title: 'Failed to add address', description: message, variant: 'destructive' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/api/address/${id}`, { isDefault: true });
      toast({ title: 'Default address updated' });
      await fetchAddresses();
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to update address';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/api/address/${id}`);
      toast({ title: 'Address deleted' });
      await fetchAddresses();
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete address';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  if (activeRole !== 'BUYER') return null;

  if (loading) return <div className="p-4 text-text-secondary">Loading addresses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Addresses</h1>
        {!isAdding && <Button onClick={() => setIsAdding(true)}>Add New Address</Button>}
      </div>

      {isAdding && (
        <Card className="border-primary/50 shadow-sm">
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label (e.g., Home, Office)</Label>
                  <Input
                    id="label"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={form.recipientName}
                    onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullAddress">Full Address</Label>
                <Textarea
                  id="fullAddress"
                  value={form.fullAddress}
                  onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Address</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={address.isDefault ? 'border-primary ring-1 ring-primary' : ''}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{address.label}</CardTitle>
                  <CardDescription>
                    {address.recipientName} ({address.phone})
                  </CardDescription>
                </div>
                {address.isDefault && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                    Default
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {address.fullAddress}
              </p>

              <div className="flex space-x-2 mt-6">
                {!address.isDefault && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleDelete(address.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {addresses.length === 0 && !isAdding && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            You don&apos;t have any saved addresses.
          </div>
        )}
      </div>
    </div>
  );
}
