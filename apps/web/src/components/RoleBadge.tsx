import * as React from "react"
import { cn } from "@/lib/utils"

export type Role = "buyer" | "seller" | "driver" | "admin"

export interface RoleBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  role: Role
}

const roleStyles: Record<Role, string> = {
  buyer: "bg-accent-buyer-500/10 text-accent-buyer-500 border-accent-buyer-500/20",
  seller: "bg-accent-seller-500/10 text-accent-seller-500 border-accent-seller-500/20",
  driver: "bg-accent-driver-500/10 text-accent-driver-500 border-accent-driver-500/20",
  admin: "bg-accent-admin-500/10 text-accent-admin-500 border-accent-admin-500/20",
}

export function RoleBadge({ role, className, ...props }: RoleBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        roleStyles[role],
        className
      )}
      {...props}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </div>
  )
}
