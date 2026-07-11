"use client"

import * as React from "react"
import { Navbar } from "@/components/navbar"
import { GlassCard } from "@/components/ui/glass-card"
import { WalletBalancePill } from "@/components/WalletBalancePill"
import { ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react"

export default function WalletPage() {
  const [balance, setBalance] = React.useState(150000)

  const transactions = [
    { id: "TRX-1", type: "topup", amount: 200000, date: "2023-10-27 14:30" },
    { id: "TRX-2", type: "payment", amount: 50000, date: "2023-10-26 09:15" },
    { id: "TRX-3", type: "refund", amount: 120000, date: "2023-10-25 18:45" },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(amount)
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-void pb-24 lg:pb-0">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto w-full p-4 lg:p-8">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">Wallet</h1>
        
        <GlassCard variant="glass-strong" className="p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-buyer-500/20 rounded-full blur-[80px]" />
          <p className="text-text-secondary text-sm font-medium mb-2">Available Balance</p>
          <p className="text-4xl font-heading font-bold text-text-primary mb-6 tabular-nums">
            {formatCurrency(balance)}
          </p>
          <button className="inline-flex items-center gap-2 bg-accent-buyer-500 text-bg-void px-6 py-3 rounded-xl font-medium shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)] hover:bg-accent-buyer-400 transition-colors active:scale-95">
            <Plus className="w-5 h-5" /> Top Up Balance
          </button>
        </GlassCard>

        <div>
          <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">Transaction History</h2>
          <div className="space-y-3">
            {transactions.map((trx) => (
              <GlassCard key={trx.id} variant="solid" className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    trx.type === 'payment' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                  }`}>
                    {trx.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary capitalize">{trx.type}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{trx.date}</p>
                  </div>
                </div>
                <div className={`font-semibold tabular-nums ${trx.type === 'payment' ? 'text-text-primary' : 'text-success'}`}>
                  {trx.type === 'payment' ? '-' : '+'}{formatCurrency(trx.amount)}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
