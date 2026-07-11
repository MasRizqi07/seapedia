'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPromoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'FIXED',
    value: '',
    expiryDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/admin/promos', {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        value: parseInt(formData.value, 10),
        expiryDate: new Date(formData.expiryDate).toISOString()
      });
      toast({ title: 'Promo created successfully!' });
      router.push('/dashboard/admin/promos');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/promos" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Create Promo</h1>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Promo Code</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-md uppercase"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. MEGASEAL"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.discountType}
                  onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="FIXED">Fixed Amount (Rp)</option>
                  <option value="PERCENT">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 border rounded-md"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.discountType === 'FIXED' ? 'e.g. 100000' : 'e.g. 50'}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date & Time</label>
              <input
                type="datetime-local"
                required
                className="w-full p-2 border rounded-md"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors font-medium mt-4"
            >
              {loading ? 'Creating...' : 'Create Promo'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
