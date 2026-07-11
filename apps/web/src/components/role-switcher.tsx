'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { ROLE_META } from '@seapedia/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Check } from 'lucide-react';
import { Role } from '@seapedia/types';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export function RoleSwitcher() {
  const { user, activeRole, setAuth } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!user || !activeRole) return null;

  const currentMeta = ROLE_META[activeRole];

  const handleSwitchRole = async (role: Role) => {
    if (role === activeRole) return;
    setLoading(true);
    try {
      const data = await api.post<{
        user: typeof user;
        accessToken: string;
        refreshToken: string;
      }>('/api/auth/select-role', { role });

      setAuth(data.user!, data.accessToken, data.refreshToken);
      router.push(`/dashboard/${role.toLowerCase()}`);
      toast({ title: `Switched to ${ROLE_META[role].label}` });
    } catch (e: any) {
      toast({ title: 'Failed to switch role', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} className="gap-2 bg-black/20 border-white/10 hover:bg-white/10">
          <Badge variant={activeRole.toLowerCase() as any} className="h-5 px-1.5 rounded-sm">
            {currentMeta?.label}
          </Badge>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.roles.map((role: Role) => {
          const meta = ROLE_META[role];
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleSwitchRole(role)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{meta.icon}</span>
                <span>{meta.label}</span>
              </div>
              {activeRole === role && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
