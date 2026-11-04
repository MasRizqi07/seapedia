import * as React from 'react';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export type JobState = 'available' | 'active' | 'completed';

export interface DriverJobCardProps {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  fee: number;
  distance: string;
  state: JobState;
  onAccept?: () => void;
  onComplete?: () => void;
  className?: string;
}

export function DriverJobCard({
  id,
  pickupLocation,
  dropoffLocation,
  fee,
  distance,
  state,
  onAccept,
  onComplete,
  className,
}: DriverJobCardProps) {
  const isActive = state === 'active';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <GlassCard
      variant={isActive ? 'glass-strong' : 'solid'}
      className={cn('p-4 space-y-4', className)}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs text-text-tertiary">Job #{id}</p>
          <p className="font-heading font-semibold text-lg text-text-primary">
            {formatCurrency(fee)}
          </p>
        </div>
        <div className="bg-bg-surface-raised px-2.5 py-1 rounded-md text-xs text-text-secondary font-medium">
          {distance}
        </div>
      </div>

      <div className="space-y-3 relative">
        <div className="absolute left-2.5 top-3 bottom-3 w-px bg-border -z-10" />

        <div className="flex gap-3">
          <div className="w-5 h-5 rounded-full bg-bg-surface border-2 border-accent-seller-500 flex items-center justify-center shrink-0 z-10 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-seller-500" />
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">Pickup</p>
            <p className="text-sm text-text-primary line-clamp-1">{pickupLocation}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-5 h-5 rounded-full bg-bg-surface border-2 border-accent-buyer-500 flex items-center justify-center shrink-0 z-10 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-accent-buyer-500" />
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">Dropoff</p>
            <p className="text-sm text-text-primary line-clamp-1">{dropoffLocation}</p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {state === 'available' && (
          <Button
            className="w-full bg-accent-driver-500 text-bg-void hover:bg-accent-driver-400 shadow-[0_0_24px_-4px_rgba(52,211,153,0.35)]"
            onClick={onAccept}
          >
            Accept Job
          </Button>
        )}

        {state === 'active' && (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Navigation className="w-4 h-4 mr-2" /> Navigate
            </Button>
            <Button
              className="flex-1 bg-success text-bg-void hover:bg-success/90 shadow-[0_0_24px_-4px_rgba(52,211,153,0.35)]"
              onClick={onComplete}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
            </Button>
          </div>
        )}

        {state === 'completed' && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-success font-medium bg-success/5 rounded-xl border border-success/10">
            <CheckCircle2 className="w-4 h-4" />
            Job Completed
          </div>
        )}
      </div>
    </GlassCard>
  );
}
