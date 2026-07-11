export default function DesignSystemPage() {
  return (
    <div className="min-h-screen p-8 space-y-12 bg-bg-void text-text-primary">
      <div>
        <h1 className="text-4xl font-heading mb-4 text-text-primary">Typography (Space Grotesk)</h1>
        <p className="text-base text-text-secondary">Body Text (Inter) - The quick brown fox jumps over the lazy dog.</p>
        <p className="text-sm text-text-tertiary">Small Text - The quick brown fox jumps over the lazy dog.</p>
      </div>

      <div>
        <h1 className="text-3xl font-heading mb-4">Roles & Accents</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-bg-surface-raised border border-accent-buyer-500/20">
            <div className="w-8 h-8 rounded-full bg-accent-buyer-500 mb-2"></div>
            <p className="font-heading">Buyer</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-surface-raised border border-accent-seller-500/20">
            <div className="w-8 h-8 rounded-full bg-accent-seller-500 mb-2"></div>
            <p className="font-heading">Seller</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-surface-raised border border-accent-driver-500/20">
            <div className="w-8 h-8 rounded-full bg-accent-driver-500 mb-2"></div>
            <p className="font-heading">Driver</p>
          </div>
          <div className="p-4 rounded-xl bg-bg-surface-raised border border-accent-admin-500/20">
            <div className="w-8 h-8 rounded-full bg-accent-admin-500 mb-2"></div>
            <p className="font-heading">Admin</p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-heading mb-4">Surfaces & Glass</h1>
        <div className="relative p-8 rounded-2xl overflow-hidden bg-gradient-to-br from-accent-buyer-500/20 to-bg-void">
          <div className="absolute inset-0 bg-bg-void/50 backdrop-blur-md"></div>
          <div className="relative z-10 p-6 rounded-2xl bg-glass-fill border border-glass-border shadow-[0_0_24px_-4px_rgba(34,211,238,0.15)]">
            <h2 className="text-xl font-heading mb-2">Glass Card</h2>
            <p className="text-text-secondary">This surface uses the --glass-fill token with 62% opacity over a complex background to test contrast.</p>
          </div>
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-heading mb-4">Urgency States</h1>
        <div className="flex gap-4">
          <span className="px-3 py-1 rounded-lg bg-success/10 text-success border border-success/20 font-medium tabular-nums">12:45:00</span>
          <span className="px-3 py-1 rounded-lg bg-warning/10 text-warning border border-warning/20 font-medium tabular-nums">04:20:00</span>
          <span className="px-3 py-1 rounded-lg bg-danger/10 text-danger border border-danger/20 font-medium tabular-nums">00:15:00</span>
        </div>
      </div>
    </div>
  );
}
