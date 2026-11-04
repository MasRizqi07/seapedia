'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleBadge, Role as BadgeRole } from '@/components/RoleBadge';
import { useAuthStore, User, Role } from '@/stores/auth-store';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface SelectRoleResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = React.useState('admin@seapedia.com');
  const [password, setPassword] = React.useState('password123');
  const [isLoading, setIsLoading] = React.useState(false);
  const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
  const [tokens, setTokens] = React.useState<{ accessToken: string; refreshToken: string } | null>(
    null,
  );
  const [step, setStep] = React.useState<'login' | 'role-select'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });

      setAuth(data.user, data.accessToken, data.refreshToken);

      // If user has multiple roles, let them choose or confirm their active role
      if (data.user.roles && data.user.roles.length > 1) {
        setLoggedInUser(data.user);
        setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        setStep('role-select');
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.name}. Please select your active role.`,
        });
      } else {
        const primaryRole = (data.user.roles?.[0] || 'BUYER').toLowerCase();
        toast({
          title: 'Welcome Back',
          description: `Logged in as ${data.user.name}`,
        });
        router.push(`/${primaryRole}`);
      }
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Invalid email or password';
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (role: BadgeRole) => {
    if (!loggedInUser || !tokens) return;
    setIsLoading(true);

    try {
      const targetRole = role.toUpperCase() as Role;
      const data = await api.post<SelectRoleResponse>('/api/auth/select-role', {
        role: targetRole,
      });

      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push(`/${role}`);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Failed to switch role';
      toast({
        title: 'Role Selection Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableRoles: BadgeRole[] =
    loggedInUser?.roles && loggedInUser.roles.length > 0
      ? loggedInUser.roles.map((r) => r.toLowerCase() as BadgeRole)
      : ['buyer'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-void relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-buyer-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-admin-500/20 rounded-full blur-[120px] pointer-events-none" />

      <GlassCard variant="glass-strong" className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            SEAPEDIA
          </h1>
          <p className="text-text-secondary mt-2">Welcome back to the deep sea.</p>
        </div>

        {step === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@seapedia.com"
                className="bg-bg-surface border-glass-border focus-visible:ring-accent-buyer-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-bg-surface border-glass-border focus-visible:ring-accent-buyer-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Diving In...
                </>
              ) : (
                'Dive In'
              )}
            </Button>

            <div className="text-center text-xs text-text-tertiary mt-4">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-cyan-400 hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-xl font-heading font-semibold text-text-primary">Select Portal</h2>
              <p className="text-sm text-text-secondary mt-1">
                Your account ({loggedInUser?.email}) has multiple active roles.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  disabled={isLoading}
                  onClick={() => handleRoleSelect(role)}
                  className="flex flex-col items-center justify-center p-4 gap-3 rounded-2xl border border-glass-border bg-bg-surface hover:bg-bg-surface-raised hover:border-accent-buyer-500/50 transition-all active:scale-[0.97]"
                >
                  <RoleBadge role={role} />
                  <span className="text-sm font-medium text-text-primary capitalize">
                    {role} Dashboard
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
