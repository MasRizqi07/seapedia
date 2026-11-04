"use client"

import * as React from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SLACountdownBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  endTime: Date
  totalDurationSeconds: number
  /** Role to determine the safe color (default uses emerald/success) */
  role?: "buyer" | "seller" | "driver" | "admin"
}

export function SLACountdownBadge({ 
  endTime, 
  totalDurationSeconds, 
  role = "driver",
  className,
  ...props 
}: SLACountdownBadgeProps) {
  const [remainingSeconds, setRemainingSeconds] = React.useState(() => {
    return Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000))
  })

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(() => {
        const next = Math.floor((endTime.getTime() - Date.now()) / 1000)
        if (next <= 0) {
          clearInterval(interval)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  const percentage = totalDurationSeconds > 0 ? (remainingSeconds / totalDurationSeconds) * 100 : 0
  const isExpired = remainingSeconds <= 0

  let statusClass = ""
  let pulseClass = ""

  if (isExpired) {
    statusClass = "bg-danger-strong/10 text-danger-strong border-danger-strong/20"
  } else if (percentage < 20) {
    statusClass = "bg-danger/10 text-danger border-danger/20"
    pulseClass = "animate-pulse" // Will be disabled in globals.css if reduced-motion
  } else if (percentage < 50) {
    statusClass = "bg-warning/10 text-warning border-warning/20"
  } else {
    // Safe color depends on role or defaults to emerald
    switch (role) {
      case "buyer": statusClass = "bg-accent-buyer-500/10 text-accent-buyer-500 border-accent-buyer-500/20"; break;
      case "seller": statusClass = "bg-accent-seller-500/10 text-accent-seller-500 border-accent-seller-500/20"; break;
      case "admin": statusClass = "bg-accent-admin-500/10 text-accent-admin-500 border-accent-admin-500/20"; break;
      case "driver":
      default:
        statusClass = "bg-success/10 text-success border-success/20"; break;
    }
  }

  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60
  
  const formattedTime = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':')

  const Icon = isExpired ? AlertTriangle : Clock

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors duration-500",
        statusClass,
        pulseClass,
        className
      )}
      {...props}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{isExpired ? "EXPIRED" : formattedTime}</span>
    </div>
  )
}
