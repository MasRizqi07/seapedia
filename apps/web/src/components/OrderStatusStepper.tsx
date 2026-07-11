import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { OrderStatus } from "./StatusChip"

export interface OrderStatusStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStatus: OrderStatus
}

const STEPS = [
  "Sedang Dikemas",
  "Menunggu Pengirim",
  "Sedang Dikirim",
  "Selesai"
]

export function OrderStatusStepper({ currentStatus, className, ...props }: OrderStatusStepperProps) {
  const isRetur = currentStatus === "Retur"
  const currentIndex = isRetur ? -1 : STEPS.indexOf(currentStatus)

  return (
    <div className={cn("flex items-center justify-between w-full relative", className)} {...props}>
      {/* Background line */}
      <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-border -z-10" />
      
      {/* Active line */}
      {!isRetur && currentIndex > 0 && (
        <div 
          className="absolute left-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-accent-buyer-500 transition-all duration-500 -z-10"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 80}%` }}
        />
      )}

      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        
        let circleClass = "bg-bg-surface-raised border-border text-text-tertiary"
        let textClass = "text-text-tertiary font-normal"

        if (isCompleted) {
          circleClass = "bg-accent-buyer-500 border-accent-buyer-500 text-bg-void shadow-[0_0_12px_-2px_rgba(34,211,238,0.5)]"
          textClass = "text-text-primary font-medium"
        } else if (isCurrent) {
          circleClass = "bg-bg-surface border-accent-buyer-500 text-accent-buyer-500 shadow-[0_0_12px_-2px_rgba(34,211,238,0.3)]"
          textClass = "text-accent-buyer-500 font-semibold"
        }

        return (
          <div key={step} className="flex flex-col items-center gap-2 w-1/4">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              circleClass
            )}>
              {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
            </div>
            <span className={cn("text-[10px] sm:text-xs text-center transition-colors duration-300", textClass)}>
              {step}
            </span>
          </div>
        )
      })}
      
      {/* Retur Branch State */}
      {isRetur && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center p-4 bg-glass-fill-strong backdrop-blur-md rounded-xl border border-danger/20 shadow-lg shadow-danger/10">
           <div className="w-8 h-8 rounded-full bg-danger text-white flex items-center justify-center mb-2">
             <X className="w-5 h-5" />
           </div>
           <span className="text-danger font-semibold text-sm">Pesanan Diretur</span>
        </div>
      )}
    </div>
  )
}
