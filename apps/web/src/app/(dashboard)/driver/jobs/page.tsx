'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DeliveryJobResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { MapPin, Store, ChevronRight } from 'lucide-react';

export default function AvailableJobsPage() {
  const { activeRole } = useAuthStore();
  const [jobs, setJobs] = useState<DeliveryJobResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole === 'DRIVER') {
      api.get<DeliveryJobResponse[]>('/api/driver/jobs')
        .then(setJobs)
        .catch(err => toast({ title: 'Error loading jobs', description: err.message, variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  }, [activeRole]);

  if (activeRole !== 'DRIVER') return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Available Jobs</h1>
      
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            No available delivery jobs right now. Please check back later.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:border-primary transition-colors">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Delivery Job</CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">Order: {job.orderId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Earning</div>
                    <div className="font-bold text-ocean-600 text-lg">{formatRupiah(job.earnings)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <Store className="w-4 h-4 text-amber-500" />
                    <div className="w-0.5 h-6 bg-border" />
                    <MapPin className="w-4 h-4 text-ocean-500" />
                  </div>
                  <div className="space-y-3 flex-1 text-sm">
                    <div>
                      <div className="font-medium">Pickup</div>
                      <div className="text-muted-foreground">{job.order?.store?.name || 'Store'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Delivery Method</div>
                      <div className="text-muted-foreground">{job.order?.deliveryMethod.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/driver/jobs/${job.id}`}
                  className="flex items-center justify-center w-full py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 font-medium transition-colors mt-2"
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
