'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Waves, LogIn, UserPlus } from 'lucide-react';

export function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Waves className="h-6 w-6 text-cyan-400" />
            <span className="inline-block font-bold text-lg tracking-tight">SEAPEDIA</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/products"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
            >
              Catalog
            </Link>
            <Link
              href="/reviews"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-cyan-400 transition-colors"
            >
              Reviews
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-white">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-cyan-600 text-white hover:bg-cyan-500">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
