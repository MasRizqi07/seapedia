import * as React from "react"
import { cn } from "@/lib/utils"

export interface PriceBreakdownProps extends React.HTMLAttributes<HTMLDivElement> {
  subtotal: number
  discount?: number
  deliveryFee?: number
  className?: string
}

export function PriceBreakdown({ 
  subtotal, 
  discount = 0, 
  deliveryFee = 0,
  className,
  ...props 
}: PriceBreakdownProps) {
  const taxableAmount = subtotal - discount + deliveryFee
  const ppn = taxableAmount * 0.11
  const total = taxableAmount + ppn

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className={cn("space-y-3 text-sm tabular-nums", className)} {...props}>
      <div className="flex justify-between items-center text-text-secondary">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      
      {discount > 0 && (
        <div className="flex justify-between items-center text-success">
          <span>Diskon</span>
          <span>-{formatCurrency(discount)}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center text-text-secondary">
        <span>Biaya Pengiriman</span>
        <span>{deliveryFee === 0 ? "Gratis" : formatCurrency(deliveryFee)}</span>
      </div>
      
      <div className="flex justify-between items-center text-text-secondary">
        <span>PPN (11%)</span>
        <span>{formatCurrency(ppn)}</span>
      </div>
      
      <div className="pt-3 border-t border-border flex justify-between items-center">
        <span className="font-semibold text-text-primary text-base">Total Keseluruhan</span>
        <span className="font-bold text-accent-buyer-500 text-lg">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
