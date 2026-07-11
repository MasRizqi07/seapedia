"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { PriceBreakdown } from "@/components/PriceBreakdown"
import { VoucherInputField } from "@/components/VoucherInputField"
import { WalletBalancePill } from "@/components/WalletBalancePill"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MapPin, Truck, ChevronRight } from "lucide-react"

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = React.useState("REGULAR")
  const [discount, setDiscount] = React.useState(0)

  const deliveryFee = deliveryMethod === "INSTANT" ? 50000 : deliveryMethod === "NEXT_DAY" ? 25000 : 10000

  return (
    <div className="min-h-screen flex flex-col bg-bg-void pb-24 lg:pb-0">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <GlassCard variant="solid" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent-buyer-500" /> Alamat Pengiriman
                </h2>
                <Button variant="link" className="h-auto p-0 text-sm">Ubah</Button>
              </div>
              <div className="bg-bg-surface-raised p-4 rounded-xl border border-border">
                <p className="font-medium text-text-primary mb-1">John Doe <span className="font-normal text-text-secondary">| 081234567890</span></p>
                <p className="text-sm text-text-secondary leading-relaxed">Jl. Sudirman No. 123, Senayan, Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta 12190</p>
              </div>
            </GlassCard>

            {/* Delivery Method */}
            <GlassCard variant="solid" className="p-5">
              <h2 className="text-lg font-heading font-semibold text-text-primary flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-accent-buyer-500" /> Metode Pengiriman
              </h2>
              <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="space-y-3">
                <div className="flex items-center space-x-2 border border-border rounded-xl p-4 hover:border-accent-buyer-500/50 transition-colors">
                  <RadioGroupItem value="INSTANT" id="instant" />
                  <Label htmlFor="instant" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-text-primary">Instan (Max 3 Jam)</p>
                        <p className="text-xs text-text-secondary mt-0.5">Disarankan untuk menjaga kesegaran</p>
                      </div>
                      <span className="font-medium">Rp 50.000</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-xl p-4 hover:border-accent-buyer-500/50 transition-colors">
                  <RadioGroupItem value="NEXT_DAY" id="next_day" />
                  <Label htmlFor="next_day" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-text-primary">Next Day</p>
                        <p className="text-xs text-text-secondary mt-0.5">Dikirim esok hari</p>
                      </div>
                      <span className="font-medium">Rp 25.000</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-xl p-4 hover:border-accent-buyer-500/50 transition-colors">
                  <RadioGroupItem value="REGULAR" id="regular" />
                  <Label htmlFor="regular" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-text-primary">Reguler</p>
                        <p className="text-xs text-text-secondary mt-0.5">2-3 hari kerja</p>
                      </div>
                      <span className="font-medium">Rp 10.000</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </GlassCard>

            {/* Voucher */}
            <GlassCard variant="solid" className="p-5">
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Voucher Seapedia</h2>
              <VoucherInputField 
                onApply={async (code) => {
                  if (code === "SEGAR10") {
                    setDiscount(10000)
                    return true
                  }
                  return false
                }}
                onRemove={() => setDiscount(0)}
              />
            </GlassCard>
          </div>

          <div className="lg:col-span-1">
            <GlassCard variant="glass" className="p-5 sticky top-24">
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Ringkasan Belanja</h2>
              <PriceBreakdown 
                subtotal={120000} 
                discount={discount} 
                deliveryFee={deliveryFee}
                className="mb-6"
              />
              <div className="pt-4 border-t border-border mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-text-primary">Saldo Wallet</span>
                  <WalletBalancePill balance={150000} onTopUp={() => {}} />
                </div>
                <p className="text-xs text-text-secondary">Sisa saldo setelah pembayaran: Rp {new Intl.NumberFormat("id-ID").format(150000 - ((120000 - discount + deliveryFee) * 1.11))}</p>
              </div>
              <Button className="w-full shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]">
                Bayar Sekarang
              </Button>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
