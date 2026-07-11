"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RoleBadge, Role } from "./RoleBadge"
import { ChevronDown } from "lucide-react"

const AVAILABLE_ROLES: Role[] = ["buyer", "seller", "driver", "admin"]

export function RoleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Infer current role from pathname, default to buyer
  let currentRole: Role = "buyer"
  if (pathname.startsWith("/seller")) currentRole = "seller"
  else if (pathname.startsWith("/driver")) currentRole = "driver"
  else if (pathname.startsWith("/admin")) currentRole = "admin"

  React.useEffect(() => {
    // Apply theme data attribute for role-based coloring
    document.documentElement.setAttribute("data-role", currentRole)
    
    // Trigger crossfade animation on body
    const body = document.body
    body.classList.remove("animate-crossfade")
    void body.offsetWidth // trigger reflow
    body.classList.add("animate-crossfade")
  }, [currentRole])

  const handleRoleSwitch = (role: Role) => {
    if (role === currentRole) return
    
    switch (role) {
      case "seller":
        router.push("/seller")
        break
      case "driver":
        router.push("/driver")
        break
      case "admin":
        router.push("/admin")
        break
      case "buyer":
      default:
        router.push("/")
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-full hover:bg-bg-surface-raised transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="w-8 h-8 border border-glass-border">
          <AvatarImage src="/avatars/01.png" alt="User" />
          <AvatarFallback className="bg-bg-surface text-text-primary">SE</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-sm font-medium leading-none">Seed Account</span>
          <RoleBadge role={currentRole} className="mt-1 transform scale-90 origin-left" />
        </div>
        <ChevronDown className="w-4 h-4 text-text-secondary ml-1" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-glass-fill-strong backdrop-blur-xl border-glass-border">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {AVAILABLE_ROLES.map((role) => (
          <DropdownMenuItem 
            key={role} 
            className="cursor-pointer focus:bg-bg-surface-raised"
            onClick={() => handleRoleSwitch(role)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="capitalize">{role}</span>
              {currentRole === role && (
                <div className="w-2 h-2 rounded-full bg-accent-buyer-500" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
