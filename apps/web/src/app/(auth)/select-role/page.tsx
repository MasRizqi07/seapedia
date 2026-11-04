'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore, Role, User } from '@/stores/auth-store';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldAlert, Store, User as UserIcon, Truck } from 'lucide-react';

const roleMeta: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  ADMIN: { icon: ShieldAlert, label: 'System Admin' },
  SELLER: { icon: Store, label: 'Seller' },
  BUYER: { icon: UserIcon, label: 'Buyer' },
  DRIVER: { icon: Truck, label: 'Driver' },
};

interface SelectRoleResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export default function SelectRolePage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [loading, setLoading] = useState(false);

  const roles = user?.roles || [];

  const handleSelectRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    try {
      const data = await api.post<SelectRoleResponse>('/api/auth/select-role', {
        role: selectedRole,
      });

      if (data?.user) {
        setAuth(data.user, data.accessToken, data.refreshToken);
      }
      router.push(`/${selectedRole.toLowerCase()}`);
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.message : 'Selection Failed';
      toast({
        title: 'Selection Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || roles.length === 0) {
    return (
      <Card className="glass w-full max-w-md">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass w-full max-w-md animate-in fade-in zoom-in duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Choose Account Type
        </CardTitle>
        <CardDescription className="text-slate-300">
          You have multiple roles. Select how you want to log in for this session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSelectRole} className="space-y-6">
          <RadioGroup
            value={selectedRole}
            onValueChange={(val) => setSelectedRole(val as Role)}
            className="grid grid-cols-1 gap-4"
          >
            {roles.map((role) => {
              const meta = roleMeta[role] || { icon: UserIcon, label: role };
              const Icon = meta.icon;
              return (
                <div key={role} className="flex items-center space-x-2">
                  <RadioGroupItem value={role} id={role} className="peer sr-only" />
                  <Label
                    htmlFor={role}
                    className="flex flex-1 items-center space-x-4 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 peer-data-[state=checked]:border-cyan-400 peer-data-[state=checked]:bg-cyan-950/40 peer-data-[state=checked]:text-cyan-400 cursor-pointer transition-all"
                  >
                    <Icon className="h-6 w-6" />
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">{meta.label}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        Continue as {meta.label.toLowerCase()}
                      </span>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <Button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
            disabled={!selectedRole || loading}
          >
            {loading ? 'Entering...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
