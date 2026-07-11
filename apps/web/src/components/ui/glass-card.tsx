import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "glass-strong"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "glass", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border transition-colors",
          {
            "bg-glass-fill backdrop-blur-md border-glass-border shadow-sm": variant === "glass",
            "bg-bg-surface border-border": variant === "solid",
            "bg-glass-fill-strong backdrop-blur-xl border-glass-border shadow-lg": variant === "glass-strong",
          },
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
