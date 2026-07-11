import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';

export default function LandingPage() {
  const categories = ["All", "Fresh Fish", "Shellfish", "Frozen", "Ready to Cook", "Specialty"];
  
  return (
    <div className="min-h-screen flex flex-col bg-bg-void">
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-8">
        {/* Hero Section */}
        <section className="relative pt-16 pb-12 px-4 md:pt-24 md:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-buyer-500/10 to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-text-primary mb-6 animate-fade-in-up">
              Deep Sea Freshness,<br />
              <span className="gradient-text">Delivered Nightly</span>
            </h1>
            <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              The premium marketplace for certified seafood. Browse fresh catches from local sellers.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <Input 
                placeholder="Search for tuna, shrimp, squid..." 
                className="w-full pl-12 h-14 rounded-2xl bg-bg-surface border-glass-border text-lg focus-visible:ring-accent-buyer-500"
              />
              <Button className="absolute right-2 top-2 h-10 rounded-xl px-6 bg-accent-buyer-500 text-bg-void hover:bg-accent-buyer-400">
                Search
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 max-w-7xl mx-auto mb-8">
          <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
            {categories.map((cat, i) => (
              <button 
                key={cat}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border
                  ${i === 0 
                    ? 'bg-accent-buyer-500 text-bg-void border-accent-buyer-500' 
                    : 'bg-bg-surface-raised border-glass-border text-text-secondary hover:text-text-primary hover:border-accent-buyer-500/50'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="px-4 max-w-7xl mx-auto mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-heading font-semibold text-text-primary">Featured Catches</h2>
            <Link href="/products" className="text-sm font-medium text-accent-buyer-500 hover:underline">
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <GlassCard key={i} variant="solid" className="overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="aspect-[4/3] bg-bg-surface-raised relative">
                  {/* Image placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center text-text-tertiary">
                    <span className="text-xs">Product Image</span>
                  </div>
                  {i === 0 && (
                    <div className="absolute top-2 left-2 bg-success text-bg-void text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      FRESH TODAY
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-text-tertiary mb-1">Ocean Store #{i + 1}</p>
                  <h3 className="font-medium text-text-primary mb-2 line-clamp-1">Fresh Premium Tuna</h3>
                  <div className="flex justify-between items-end">
                    <p className="font-heading font-semibold text-lg text-accent-buyer-500">
                      Rp 120.000<span className="text-xs text-text-tertiary font-sans font-normal">/kg</span>
                    </p>
                    <Button size="icon" className="w-8 h-8 rounded-lg bg-bg-surface-raised text-text-primary hover:bg-accent-buyer-500 hover:text-bg-void">
                      <span className="text-lg leading-none">+</span>
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
