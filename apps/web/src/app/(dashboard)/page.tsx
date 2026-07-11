'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardIndex() {
  const router = useRouter();
  const activeRole = useAuthStore((state) => state.activeRole);

  useEffect(() => {
    if (activeRole) {
      router.replace(`/dashboard/${activeRole.toLowerCase()}`);
    } else {
      router.replace('/select-role');
    }
  }, [activeRole, router]);

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-pulse text-xl text-cyan-400">Loading Dashboard...</div>
    </div>
  );
}
