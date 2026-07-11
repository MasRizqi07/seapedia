"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { OrderStatusStepper } from "@/components/OrderStatusStepper"
import { SLACountdownBadge } from "@/components/SLACountdownBadge"
import { OrderStatus } from "@/components/StatusChip"
import { Button } from "@/components/ui/button"
import { RefreshCw, Package, MapPin, ChevronRight, AlertCircle } from "lucide-react"

export default function OrdersPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [lastUpdated, setLastUpdated] = React.useState(new Date())
  
  // Mock order data
  const [status, setStatus] = React.useState<OrderStatus>("Menunggu Pengirim") // Change this to test other states
  
  // Fake SLA end time (2 hours from now)
  const [slaEndTime] = React.useState(new Date(Date.now() + 2 * 60 * 60 * 1000))

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(new Date())
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-void pb-24 lg:pb-0">
      <Navbar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 lg:p-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">Lacak Pesanan</h1>
            <p className="text-sm text-text-secondary mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-text-secondary border-glass-border bg-bg-surface hover:bg-bg-surface-raised"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {status === "Retur" && (
          <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 mb-6 flex gap-4 items-start animate-fade-in-up">
            <div className="bg-danger text-white p-2 rounded-full shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-danger">Pesanan Dibatalkan & Diretur</h3>
              <p className="text-sm text-danger/90 mt-1">Dana sebesar <span className="font-bold">Rp 120.000</span> telah dikembalikan ke Wallet Anda.</p>
            </div>
          </div>
        )}

        <GlassCard variant="solid" className="p-6 mb-6">
          <div className="flex justify-between items-start mb-8 border-b border-border pb-6">
            <div>
              <p className="text-sm text-text-secondary">Order ID</p>
              <p className="font-medium text-text-primary uppercase tracking-wide">ORD-77A9B2</p>
            </div>
            {status !== "Retur" && status !== "Selesai" && (
              <div className="text-right">
                <p className="text-sm text-text-secondary mb-1">Estimasi Tiba</p>
                <SLACountdownBadge 
                  endTime={slaEndTime} 
                  totalDurationSeconds={3 * 60 * 60} 
                  role="buyer" 
                />
              </div>
            )}
          </div>

          <div className="mb-10 px-2">
            <OrderStatusStepper currentStatus={status} />
          </div>

          <div className="bg-bg-surface-raised rounded-xl p-4 space-y-4">
            <div className="flex gap-4">
              <div className="bg-bg-surface p-2 rounded-lg border border-border shrink-0">
                <Package className="w-5 h-5 text-text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary text-sm">Fresh Premium Yellowfin Tuna</p>
                <p className="text-xs text-text-secondary mt-1">1 kg x Rp 120.000</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {status === "Selesai" && (
          <GlassCard variant="glass" className="p-6 text-center animate-fade-in-up">
            <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">Beri Ulasan</h3>
            <p className="text-sm text-text-secondary mb-4">Bagaimana kualitas produk dari Ocean Store #1?</p>
            <textarea 
              className="w-full bg-bg-surface border border-glass-border rounded-xl p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-buyer-500 mb-4 h-24 resize-none"
              placeholder="Ceritakan pengalaman Anda..."
            />
            <Button className="w-full">Kirim Ulasan</Button>
          </GlassCard>
        )}
      </main>
    </div>
  )
}
