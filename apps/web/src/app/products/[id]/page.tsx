"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/RoleBadge"
import { CartSingleStoreGuardModal } from "@/components/CartSingleStoreGuardModal"
import { Star, ShieldCheck, Truck, ShoppingCart } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

export default function ProductDetailPage() {
  const [showGuardModal, setShowGuardModal] = React.useState(false)

  const handleAddToCart = () => {
    // Simulate detecting a different store in cart
    setShowGuardModal(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-void pb-24 lg:pb-0">
      <Navbar />
      
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-bg-surface-raised rounded-3xl overflow-hidden relative border border-border">
              <div className="absolute inset-0 flex items-center justify-center text-text-tertiary">
                Product Image (Main)
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`aspect-square rounded-xl border flex items-center justify-center text-xs text-text-tertiary ${i === 1 ? 'border-accent-buyer-500 bg-bg-surface-raised/50' : 'border-border bg-bg-surface'}`}>
                  Thumb {i}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <RoleBadge role="seller" />
              <span className="text-sm text-text-secondary font-medium">Ocean Store #1</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-text-primary mb-4">
              Fresh Premium Yellowfin Tuna
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-warning">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 font-medium tabular-nums">4.8</span>
                <span className="text-text-secondary ml-1">(124 reviews)</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="text-text-secondary text-sm">
                Terjual <span className="font-medium text-text-primary">500+</span>
              </div>
            </div>

            <p className="text-3xl font-heading font-bold text-accent-buyer-500 mb-8 tabular-nums">
              Rp 120.000<span className="text-base text-text-tertiary font-sans font-normal">/kg</span>
            </p>

            <GlassCard variant="glass" className="p-5 mb-8 space-y-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-success shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Jaminan Kualitas</h4>
                  <p className="text-xs text-text-secondary mt-1">Produk dijamin segar. Garansi uang kembali jika produk tidak sesuai standar.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Truck className="w-5 h-5 text-accent-buyer-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-text-primary">Pengiriman Instan</h4>
                  <p className="text-xs text-text-secondary mt-1">Tersedia pengiriman instan untuk menjaga kesegaran produk.</p>
                </div>
              </div>
            </GlassCard>

            <div className="mt-auto pt-6 border-t border-border flex gap-4">
              <div className="flex items-center border border-border rounded-xl bg-bg-surface overflow-hidden">
                <button className="px-4 py-3 text-text-primary hover:bg-bg-surface-raised transition-colors">-</button>
                <span className="px-4 py-3 text-text-primary font-medium border-x border-border min-w-[3rem] text-center tabular-nums">1</span>
                <button className="px-4 py-3 text-text-primary hover:bg-bg-surface-raised transition-colors">+</button>
              </div>
              <Button size="lg" className="flex-1 shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Keranjang
              </Button>
            </div>
          </div>
        </div>
      </main>

      <CartSingleStoreGuardModal 
        isOpen={showGuardModal} 
        onClose={() => setShowGuardModal(false)}
        onConfirm={() => setShowGuardModal(false)}
        newStoreName="Ocean Store #1"
      />
    </div>
  )
}
