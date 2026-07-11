"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/RoleBadge"
import { Store, Trash2 } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-void pb-24 lg:pb-0">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">Keranjang Belanja</h1>
        
        {/* Single-store indicator persistent at top */}
        <div className="bg-accent-buyer-500/10 border border-accent-buyer-500/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent-buyer-500/20 p-2 rounded-lg text-accent-buyer-500">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Belanja dari toko</p>
              <div className="flex items-center gap-2 mt-0.5">
                <RoleBadge role="seller" className="scale-75 origin-left" />
                <p className="font-semibold text-text-primary">Ocean Store #1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {[1, 2].map((i) => (
            <GlassCard key={i} variant="solid" className="p-4 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-bg-surface-raised border border-border shrink-0 flex items-center justify-center text-[10px] text-text-tertiary">
                Image
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-text-primary">Fresh Premium Yellowfin Tuna</h3>
                    <p className="text-lg font-heading font-bold text-accent-buyer-500 mt-1 tabular-nums">Rp 120.000</p>
                  </div>
                  <button className="text-text-tertiary hover:text-danger transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-border rounded-lg bg-bg-surface overflow-hidden h-8">
                    <button className="px-3 hover:bg-bg-surface-raised transition-colors text-text-primary">-</button>
                    <span className="px-3 text-sm border-x border-border font-medium tabular-nums">1</span>
                    <button className="px-3 hover:bg-bg-surface-raised transition-colors text-text-primary">+</button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
        
        <GlassCard variant="glass" className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 lg:static">
          <div>
            <p className="text-sm text-text-secondary">Total Harga (2 barang)</p>
            <p className="text-2xl font-heading font-bold text-text-primary tabular-nums">Rp 240.000</p>
          </div>
          <Link href="/checkout" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]">
              Lanjut Checkout
            </Button>
          </Link>
        </GlassCard>
      </main>
    </div>
  )
}
