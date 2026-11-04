'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge, Role as BadgeRole } from './RoleBadge';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { useAuthStore, User } from '@/stores/auth-store';
import { Role as SharedRole } from '@seapedia/types';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface SelectRoleResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, activeRole, setAuth } = useAuthStore();
  const [isSwitching, setIsSwitching] = React.useState(false);

  // Infer current role from pathname, fallback to activeRole or 'buyer'
  let currentRole: BadgeRole = 'buyer';
  if (pathname.startsWith('/seller')) currentRole = 'seller';
  else if (pathname.startsWith('/driver')) currentRole = 'driver';
  else if (pathname.startsWith('/admin')) currentRole = 'admin';
  else if (activeRole) currentRole = activeRole.toLowerCase() as BadgeRole;

  React.useEffect(() => {
    // Apply theme data attribute for role-based coloring
    document.documentElement.setAttribute('data-role', currentRole);

    // Trigger crossfade animation on body
    const body = document.body;
    body.classList.remove('animate-crossfade');
    void body.offsetWidth; // trigger reflow
    body.classList.add('animate-crossfade');
  }, [currentRole]);

  // Roles available for this user from profile, fallback to currentRole
  const userRoles: BadgeRole[] =
    user?.roles && user.roles.length > 0
      ? user.roles.map((r) => r.toLowerCase() as BadgeRole)
      : [currentRole];

  const handleRoleSwitch = async (role: BadgeRole) => {
    if (role === currentRole || isSwitching) return;

    setIsSwitching(true);
    const targetRole = role.toUpperCase() as SharedRole;

    try {
      const data = await api.post<SelectRoleResponse>('/api/auth/select-role', {
        role: targetRole,
      });

      if (data && data.user) {
        setAuth(data.user, data.accessToken, data.refreshToken);
      }

      router.push(`/${role}`);
      toast({
        title: 'Role Switched',
        description: `Now active as ${role.toUpperCase()}`,
      });
    } catch (error: unknown) {
      const message = error instanceof ApiError ? error.message : 'Failed to switch role';
      toast({
        title: 'Error Switching Role',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const displayName = user?.name || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isSwitching}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-bg-surface-raised transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="w-8 h-8 border border-glass-border">
          <AvatarImage src={user?.avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-bg-surface text-text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-sm font-medium leading-none text-text-primary">{displayName}</span>
          <RoleBadge role={currentRole} className="mt-1 transform scale-90 origin-left" />
        </div>
        {isSwitching ? (
          <Loader2 className="w-4 h-4 text-text-secondary ml-1 animate-spin" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary ml-1" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-glass-fill-strong backdrop-blur-xl border-glass-border"
      >
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {userRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            className="cursor-pointer focus:bg-bg-surface-raised flex items-center justify-between"
            onClick={() => handleRoleSwitch(role)}
          >
            <span className="capitalize">{role}</span>
            {currentRole === role && <Check className="w-4 h-4 text-accent-buyer-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
