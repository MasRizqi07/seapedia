"use client"

import * as React from "react"
import { AlertTriangle, Clock, FastForward } from "lucide-react"
import { GlassCard } from "./ui/glass-card"
import { Button } from "./ui/button"

export interface AdminSimulateClockCardProps {
  currentSimulatedTime: Date
  onSimulateNextDay: () => Promise<void>
}

export function AdminSimulateClockCard({ currentSimulatedTime, onSimulateNextDay }: AdminSimulateClockCardProps) {
  const [isSimulating, setIsSimulating] = React.useState(false)

  const handleSimulate = async () => {
    setIsSimulating(true)
    try {
      await onSimulateNextDay()
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <GlassCard 
      variant="glass" 
      className="border-2 border-danger-strong/50 shadow-[0_0_30px_-5px_rgba(225,29,72,0.15)] relative overflow-hidden"
    >
      {/* Striped hazard background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, var(--color-danger-strong) 10px, var(--color-danger-strong) 20px)"
        }}
      />
      
      <div className="relative z-10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-xl bg-danger-strong/10 text-danger-strong flex items-center justify-center shrink-0 border border-danger-strong/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-danger-strong flex items-center gap-2">
              System Time Override
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-danger-strong text-white tracking-wider">Danger Zone</span>
            </h3>
            <p className="text-sm text-text-secondary mt-1 max-w-md">
              Simulates advancing the platform clock by 24 hours. This will forcefully trigger SLAs, expire vouchers, and update order statuses platform-wide.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs font-mono bg-bg-void/50 px-3 py-1.5 rounded-lg border border-glass-border w-fit">
              <Clock className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-text-secondary">Current Time:</span>
              <span className="text-text-primary">{currentSimulatedTime.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          onClick={handleSimulate}
          isLoading={isSimulating}
          className="w-full sm:w-auto shrink-0 shadow-[0_0_24px_-4px_rgba(225,29,72,0.5)]"
        >
          <FastForward className="w-4 h-4 mr-2" />
          Simulate +24 Hours
        </Button>
      </div>
    </GlassCard>
  )
}
