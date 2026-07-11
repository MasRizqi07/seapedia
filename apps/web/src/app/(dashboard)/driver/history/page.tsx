'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DeliveryJobResponse } from '@seapedia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { formatRupiah } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Wallet, CheckCircle2 } from 'lucide-react';

export default function JobHistoryPage() {
  const { activeRole } = useAuthStore();
  const [jobs, setJobs] = useState<DeliveryJobResponse[]>([]);
  const [earnings, setEarnings] = useState<{ total: number }>({ total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeRole === 'DRIVER') {
      Promise.all([
        api.get<DeliveryJobResponse[]>('/api/driver/jobs/history'),
        api.get<{ total: number }>('/api/driver/earnings')
      ])
        .then(([historyData, earningsData]) => {
          setJobs(historyData);
          setEarnings(earningsData);
        })
        .catch(err => toast({ title: 'Error loading history', description: err.message, variant: 'destructive' }))
        .finally(() => setLoading(false));
    }
  }, [activeRole]);

  if (activeRole !== 'DRIVER') return null;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">History & Earnings</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary/5 border-primary/20 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{formatRupiah(earnings.total)}</div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Lifetime delivery earnings
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{jobs.length}</div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Successfully delivered
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold">Completed Jobs</h2>
      
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            No completed jobs yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-3 bg-muted/20 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm">Order ID: {job.orderId}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      Completed: {new Date(job.completedAt!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">+{formatRupiah(job.earnings)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-muted-foreground">
                    From <span className="font-medium text-foreground">{job.order?.store?.name}</span>
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    COMPLETED
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
