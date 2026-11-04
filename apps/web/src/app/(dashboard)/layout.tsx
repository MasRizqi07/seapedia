'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { WalletBalancePill } from '@/components/WalletBalancePill';
import { Button } from '@/components/ui/button';
import {
  Waves,
  LogOut,
  LayoutDashboard,
  Store,
  Package,
  Wallet,
  ShoppingCart,
  ShoppingBag,
  MapPin,
  Truck,
  Ticket,
  Tag,
  AlertCircle,
  Bell,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const ROLE_NAV: Record<string, NavItem[]> = {
  buyer: [
    { label: 'Catalog', href: '/buyer', icon: <Package className="h-5 w-5" /> },
    { label: 'Cart', href: '/buyer/cart', icon: <ShoppingCart className="h-5 w-5" /> },
    { label: 'My Orders', href: '/buyer/orders', icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'Addresses', href: '/buyer/addresses', icon: <MapPin className="h-5 w-5" /> },
    { label: 'My Wallet', href: '/buyer/wallet', icon: <Wallet className="h-5 w-5" /> },
    { label: 'Reports', href: '/buyer/reports', icon: <FileText className="h-5 w-5" /> },
  ],
  seller: [
    { label: 'Dashboard', href: '/seller', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Store', href: '/seller/store', icon: <Store className="h-5 w-5" /> },
    { label: 'Products', href: '/seller/products', icon: <Package className="h-5 w-5" /> },
    { label: 'Orders', href: '/seller/orders', icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'Reports', href: '/seller/reports', icon: <FileText className="h-5 w-5" /> },
  ],
  driver: [
    { label: 'Dashboard', href: '/driver', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Available Jobs', href: '/driver/jobs', icon: <Truck className="h-5 w-5" /> },
    { label: 'Active Job', href: '/driver/active', icon: <MapPin className="h-5 w-5" /> },
    { label: 'History & Earnings', href: '/driver/history', icon: <Wallet className="h-5 w-5" /> },
  ],
  admin: [
    { label: 'Overview', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Vouchers', href: '/admin/vouchers', icon: <Ticket className="h-5 w-5" /> },
    { label: 'Promos', href: '/admin/promos', icon: <Tag className="h-5 w-5" /> },
    { label: 'Overdue Orders', href: '/admin/overdue', icon: <AlertCircle className="h-5 w-5" /> },
  ],
};

interface WalletData {
  balance: number;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState<number>(0);

  let activeRole = 'buyer';
  if (pathname.startsWith('/seller')) activeRole = 'seller';
  else if (pathname.startsWith('/driver')) activeRole = 'driver';
  else if (pathname.startsWith('/admin')) activeRole = 'admin';

  useEffect(() => {
    if (user) {
      api
        .get<WalletData>('/api/wallet')
        .then((res) => {
          if (res && typeof res.balance === 'number') {
            setWalletBalance(res.balance);
          }
        })
        .catch(() => {
          // Non-blocking fallback
        });
    }
  }, [user, pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignored
    } finally {
      logout();
      router.push('/login');
    }
  };

  const navItems = ROLE_NAV[activeRole] || [];

  return (
    <div className="min-h-screen bg-bg-void flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-glass-border bg-bg-surface flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-glass-border">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-accent-buyer-500/20 p-1.5 rounded-lg text-accent-buyer-500">
              <Waves className="h-5 w-5" />
            </div>
            <span className="font-heading font-bold tracking-tight text-lg text-text-primary">
              SEAPEDIA
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                  isActive
                    ? 'bg-bg-surface-raised text-text-primary border border-glass-border'
                    : 'text-text-secondary hover:bg-bg-surface-raised/50 hover:text-text-primary border border-transparent',
                )}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-text-secondary hover:text-text-primary"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-glass-border bg-glass-fill backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
          <div>
            <h1 className="text-lg font-heading font-semibold text-text-primary hidden md:block capitalize">
              {activeRole} Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <WalletBalancePill
              balance={walletBalance}
              onTopUp={() => router.push('/buyer/wallet')}
              className="hidden sm:flex"
            />

            <button
              aria-label="Notifications"
              className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
            </button>

            <div className="pl-4 border-l border-glass-border">
              <RoleSwitcher />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-bg-void to-bg-surface">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
