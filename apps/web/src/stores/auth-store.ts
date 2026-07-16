'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Role } from '@seapedia/types';
export { Role };

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  activeRole: Role | null;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// ── Store ─────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      activeRole: null,

      setAuth: (user, accessToken, refreshToken) => {
        let activeRole = null;
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          activeRole = payload.activeRole || null;
        } catch { /* JWT decode failed — activeRole stays null */ }

        set({ user, accessToken, refreshToken, activeRole });

        if (typeof document !== 'undefined') {
          document.cookie = `seapedia-auth=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          document.cookie = `seapedia-active-role=${activeRole || ''}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      },

      setTokens: (accessToken, refreshToken) => {
        let activeRole = null;
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          activeRole = payload.activeRole || null;
        } catch { /* JWT decode failed — activeRole stays null */ }

        set({ accessToken, refreshToken, activeRole });

        if (typeof document !== 'undefined') {
          document.cookie = `seapedia-active-role=${activeRole || ''}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeRole: null,
        });

        if (typeof document !== 'undefined') {
          document.cookie = 'seapedia-auth=; path=/; max-age=0';
          document.cookie = 'seapedia-active-role=; path=/; max-age=0';
        }
      },
    }),
    {
      name: 'seapedia-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // SSR fallback — no-op storage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        activeRole: state.activeRole,
      }),
    },
  ),
);
