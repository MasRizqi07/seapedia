import { OrderStatusHistoryResponse } from '@seapedia/types';

export function OrderStatusTimeline({ history }: { history: OrderStatusHistoryResponse[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-4">
      {history.map((item, idx) => (
        <div key={item.id} className="flex gap-4 relative">
          {/* Vertical line connector */}
          {idx !== history.length - 1 && (
            <div className="absolute left-3 top-8 bottom-[-16px] w-0.5 bg-border" />
          )}
          
          <div className="flex-none">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs relative z-10">
              ✓
            </div>
          </div>
          
          <div className="pb-4">
            <div className="font-bold">{item.status}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(item.changedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
            {item.note && (
              <div className="text-sm mt-1 p-2 bg-muted rounded-md inline-block">
                {item.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
