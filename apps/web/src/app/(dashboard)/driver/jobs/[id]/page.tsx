'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { DeliveryJobResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { ArrowLeft, MapPin, Store, Package } from 'lucide-react';

export default function JobDetailPage() {
  const { activeRole } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  
  const [job, setJob] = useState<DeliveryJobResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);

  useEffect(() => {
    if (activeRole === 'DRIVER' && params.id) {
      api.get<DeliveryJobResponse>(`/api/driver/jobs/${params.id}`)
        .then(setJob)
        .catch(err => {
          toast({ title: 'Error', description: err.message, variant: 'destructive' });
          router.push('/dashboard/driver/jobs');
        })
        .finally(() => setLoading(false));
    }
  }, [activeRole, params.id, router]);

  const handleTakeJob = async () => {
    if (!job) return;
    setTaking(true);
    try {
      await api.post(`/api/driver/jobs/${job.id}/take`);
      toast({ title: 'Job claimed successfully!' });
      router.push('/dashboard/driver/active');
    } catch (err: any) {
      toast({ title: 'Could not claim job', description: err.message, variant: 'destructive' });
      if (err.statusCode === 409) {
        // Someone else took it
        router.push('/dashboard/driver/jobs');
      }
    } finally {
      setTaking(false);
    }
  };

  if (activeRole !== 'DRIVER') return null;
  if (loading) return <div>Loading...</div>;
  if (!job) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/driver/jobs" className="inline-flex items-center text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Available Jobs
      </Link>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Details</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items to Deliver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.order?.items?.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400 m-4" />
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
                <div className="text-sm text-muted-foreground mb-1">Your Earnings</div>
                <div className="text-4xl font-bold text-primary">{formatRupiah(job.earnings)}</div>
              </div>
              <button
                onClick={handleTakeJob}
                disabled={taking || job.status !== 'AVAILABLE'}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {taking ? 'Claiming...' : 'Take Job'}
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Store className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="font-medium mb-1">Pickup Store</div>
                  <div className="text-muted-foreground">{job.order?.store?.name}</div>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-ocean-500 shrink-0" />
                <div>
                  <div className="font-medium mb-1">Delivery Destination</div>
                  <div className="text-muted-foreground">{job.order?.deliveryMethod.replace('_', ' ')} Delivery</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
