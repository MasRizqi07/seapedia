import * as React from "react"
import { Package, Clock, Truck, CheckCircle2, RotateCcw, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type OrderStatus = 
  | "Sedang Dikemas" 
  | "Menunggu Pengirim" 
  | "Sedang Dikirim" 
  | "Selesai" 
  | "Retur"

export interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
  status: OrderStatus
}

const statusConfig: Record<OrderStatus, { icon: LucideIcon, styles: string }> = {
  "Sedang Dikemas": {
    icon: Package,
    styles: "bg-warning/10 text-warning border-warning/20"
  },
  "Menunggu Pengirim": {
    icon: Clock,
    styles: "bg-info/10 text-info border-info/20"
  },
  "Sedang Dikirim": {
    icon: Truck,
    styles: "bg-accent-buyer-500/10 text-accent-buyer-500 border-accent-buyer-500/20"
  },
  "Selesai": {
    icon: CheckCircle2,
    styles: "bg-success/10 text-success border-success/20"
  },
  "Retur": {
    icon: RotateCcw,
    styles: "bg-danger/10 text-danger border-danger/20"
  }
}

export function StatusChip({ status, className, ...props }: StatusChipProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
        config.styles,
        className
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{status}</span>
    </div>
  )
}
