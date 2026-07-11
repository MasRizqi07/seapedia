'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { DeliveryJobResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { CheckCircle2, MapPin, Store, Package } from 'lucide-react';

export default function ActiveJobPage() {
  const { activeRole } = useAuthStore();
  const router = useRouter();
  
  const [job, setJob] = useState<DeliveryJobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchActiveJob = () => {
    api.get<DeliveryJobResponse | null>('/api/driver/active')
      .then(setJob)
      .catch(err => toast({ title: 'Error loading job', description: err.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeRole === 'DRIVER') {
      fetchActiveJob();
    }
  }, [activeRole]);

  const handleCompleteJob = async () => {
    if (!job) return;
    setCompleting(true);
    try {
      await api.post(`/api/driver/jobs/${job.id}/complete`);
      toast({ title: 'Delivery completed successfully!' });
      setJob(null);
    } catch (err: any) {
      toast({ title: 'Could not complete job', description: err.message, variant: 'destructive' });
    } finally {
      setCompleting(false);
    }
  };

  if (activeRole !== 'DRIVER') return null;
  if (loading) return <div>Loading...</div>;

  if (!job) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Active Job</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Job</h2>
            <p className="text-muted-foreground mb-6">You don't have any deliveries in progress.</p>
            <button
              onClick={() => router.push('/dashboard/driver/jobs')}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 font-medium transition-colors"
            >
              Find Available Jobs
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Delivery</h1>
        <div className="bg-ocean-100 text-ocean-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          In Progress
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="relative pl-8 pb-8 border-l-2 border-dashed border-primary">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-background" />
                <h3 className="font-bold text-lg text-amber-600 mb-1">Pickup at Store</h3>
                <p className="text-muted-foreground">{job.order?.store?.name}</p>
                <div className="mt-4 bg-muted/50 p-3 rounded text-sm">
                  <span className="font-medium">Order ID:</span> {job.orderId}
                </div>
              </div>

              <div className="relative pl-8">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-ocean-500 ring-4 ring-background" />
                <h3 className="font-bold text-lg text-ocean-600 mb-1">Deliver to Buyer</h3>
                <p className="text-muted-foreground">{job.order?.deliveryMethod.replace('_', ' ')} Delivery</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items to Deliver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.order?.items?.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400 m-3" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{item.product?.name}</div>
                    <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-1">Expected Earning</div>
                <div className="text-4xl font-bold text-primary">{formatRupiah(job.earnings)}</div>
              </div>
              <button
                onClick={handleCompleteJob}
                disabled={completing}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {completing ? 'Completing...' : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Delivery
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
