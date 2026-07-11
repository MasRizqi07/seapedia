import * as React from "react"
import { Wallet, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface WalletBalancePillProps extends React.HTMLAttributes<HTMLDivElement> {
  balance: number
  onTopUp: () => void
  lowBalanceThreshold?: number
}

export function WalletBalancePill({ 
  balance, 
  onTopUp, 
  lowBalanceThreshold = 50000,
  className,
  ...props 
}: WalletBalancePillProps) {
  const isLowBalance = balance < lowBalanceThreshold
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-3 bg-bg-surface-raised border rounded-full p-1 pl-3 transition-colors",
        isLowBalance ? "border-warning/50" : "border-glass-border",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Wallet className={cn("w-4 h-4", isLowBalance ? "text-warning" : "text-text-secondary")} />
        <span className={cn(
          "text-sm font-medium tabular-nums",
          isLowBalance ? "text-warning" : "text-text-primary"
        )}>
          {formatCurrency(balance)}
        </span>
      </div>
      
      <Button 
        size="sm" 
        onClick={onTopUp}
        className="h-7 rounded-full px-3 text-xs gap-1 bg-bg-surface hover:bg-bg-surface border border-glass-border hover:border-accent-buyer-500/50 hover:text-accent-buyer-500"
        variant="outline"
      >
        <Plus className="w-3 h-3" />
        Top Up
      </Button>
    </div>
  )
}
