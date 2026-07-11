"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoleBadge, Role } from "@/components/RoleBadge"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<"login" | "role-select">("login")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      // Mock detecting multiple roles for this "Seed Account"
      setStep("role-select")
    }, 1000)
  }

  const handleRoleSelect = (role: Role) => {
    switch (role) {
      case "seller": router.push("/seller"); break;
      case "driver": router.push("/driver"); break;
      case "admin": router.push("/admin"); break;
      case "buyer":
      default: router.push("/"); break;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-void relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-buyer-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-admin-500/20 rounded-full blur-[120px] pointer-events-none" />

      <GlassCard variant="glass-strong" className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-text-primary">SEAPEDIA</h1>
          <p className="text-text-secondary mt-2">Welcome back to the deep sea.</p>
        </div>

        {step === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Email</label>
              <Input 
                type="email" 
                defaultValue="seed@seapedia.com" 
                className="bg-bg-surface border-glass-border focus-visible:ring-accent-buyer-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <Input 
                type="password" 
                defaultValue="password123" 
                className="bg-bg-surface border-glass-border focus-visible:ring-accent-buyer-500"
              />
            </div>
            <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
              Dive In
            </Button>
          </form>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-xl font-heading font-semibold text-text-primary">Select Profile</h2>
              <p className="text-sm text-text-secondary mt-1">This account has multiple roles.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {(["buyer", "seller", "driver", "admin"] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className="flex flex-col items-center justify-center p-4 gap-3 rounded-2xl border border-glass-border bg-bg-surface hover:bg-bg-surface-raised hover:border-accent-buyer-500/50 transition-all active:scale-[0.97]"
                >
                  <RoleBadge role={role} />
                  <span className="text-sm font-medium text-text-primary capitalize">{role} Dashboard</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
