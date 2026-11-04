'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewVoucherPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'FIXED',
    value: '',
    expiryDate: '',
    usageLimit: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/admin/vouchers', {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        value: parseInt(formData.value, 10),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        usageLimit: parseInt(formData.usageLimit, 10),
      });
      toast({ title: 'Voucher created successfully!' });
      router.push('/admin/vouchers');
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to create voucher';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/vouchers" className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Create Voucher</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Voucher Code</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-md uppercase"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. SUMMERSALE20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.discountType === 'FIXED' ? 'e.g. 50000' : 'e.g. 15'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full p-2 border rounded-md"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Max uses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-2 border rounded-md"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors font-medium mt-4"
            >
              {loading ? 'Creating...' : 'Create Voucher'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
