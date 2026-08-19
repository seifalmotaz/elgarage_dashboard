 'use client';

import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, AdminUser } from '../api/auth';
import { AuthMiddleware } from '../api/generated/auth-middleware';
import { queryKeys } from '@/lib/query-keys';
import { AUTH_KEYS } from '@/lib/constants/auth';
import type { paths } from '../api/generated/types.gen';

type AdminLoginDto = paths['/api/v1/admin/auth/login']['post']['requestBody']['content']['application/json'];
type AuthResponse = paths['/api/v1/auth/login']['post']['responses']['200']['content']['application/json'];

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** @deprecated User state is derived from React Query cache. Calling this has no effect. */
  setUser: (user: AdminUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we have a token in localStorage (SSR-safe) - now state for proper reactivity
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(AUTH_KEYS.TOKEN);
  });

  // Sync token state with localStorage and handle multi-tab sync
  useEffect(() => {
    const syncToken = () => {
      const token = localStorage.getItem(AUTH_KEYS.TOKEN);
      setHasToken(!!token);
    };

    // Initial sync
    syncToken();

    // Listen to token updates from AuthMiddleware in the same tab
    const handleMiddlewareTokenChange = (hasTokenVal: boolean) => {
      setHasToken(hasTokenVal);
    };
    AuthMiddleware.addTokenListener(handleMiddlewareTokenChange);

    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', syncToken);
    
    return () => {
      AuthMiddleware.removeTokenListener(handleMiddlewareTokenChange);
      window.removeEventListener('storage', syncToken);
    };
  }, []);

  // Query to fetch and cache user profile
  const {
    data: userFromQuery,
    isLoading: profileLoading,
    isError: isProfileError,
    error: profileError,
    status: profileStatus,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authApi.getAdminProfile(),
    enabled: hasToken, // Only fetch if we have a token
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // User state derived from React Query cache
  const user = userFromQuery ?? null;

  // Loading state: true during initial mount check or when profile is loading
  const [initializing, setInitializing] = useState(true);
  const loading = initializing || (hasToken && profileLoading);

  const handleUnauthorized = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEYS.TOKEN);
      localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_KEYS.USER);
    }
    queryClient.removeQueries({ queryKey: queryKeys.auth.user() });
    if (pathname && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [pathname, router, queryClient]);

  // Handle profile fetch failure (Issue #4)
  useEffect(() => {
    if (isProfileError && profileError instanceof Error) {
      console.error('Profile fetch failed:', profileError);
      // Check if it's a 401 error to trigger unauthorized handling
      if (profileError.message.includes('401') || profileError.message.includes('unauthorized')) {
        handleUnauthorized();
      }
    }
  }, [isProfileError, profileError, handleUnauthorized]);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const refreshToken = AuthMiddleware.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response: AuthResponse = await authApi.adminRefresh(refreshToken);
      AuthMiddleware.setTokens(response.accessToken, response.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleUnauthorized();
      return false;
    }
  }, [handleUnauthorized]);

  const startRefreshTimer = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    refreshIntervalRef.current = setInterval(refreshTokens, TOKEN_REFRESH_INTERVAL);
  }, [refreshTokens]);

  const stopRefreshTimer = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    AuthMiddleware.setUnauthorizedCallback(handleUnauthorized);
    return () => {
      AuthMiddleware.setUnauthorizedCallback(() => {});
    };
  }, [handleUnauthorized]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshTokens();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshTokens]);

  // Initialize auth state - check for token and start refresh timer if needed
  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_KEYS.TOKEN) : null;

      if (token) {
        // Token exists - profile query will auto-fetch due to enabled: hasToken
        startRefreshTimer();
      } else {
        setInitializing(false);
      }
    };

    initAuth();
    return () => stopRefreshTimer();
  }, [startRefreshTimer, stopRefreshTimer]);

  // Set initializing to false only after the profile query settles (success or error)
  useEffect(() => {
    if (hasToken) {
      if (profileStatus === 'success' || profileStatus === 'error') {
        setInitializing(false);
      }
    }
  }, [hasToken, profileStatus]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authApi.adminLogin({ email, password } as AdminLoginDto);

      AuthMiddleware.setTokens(response.accessToken, response.refreshToken);

      const profile = await authApi.getAdminProfile();
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(profile));
      queryClient.setQueryData(queryKeys.auth.user(), profile);
      startRefreshTimer();

      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [router, startRefreshTimer, queryClient]);

  const logout = useCallback(async () => {
    stopRefreshTimer();
    try {
      await authApi.adminLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthMiddleware.clearTokens();
      queryClient.clear();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEYS.USER);
      }
      router.push('/login');
    }
  }, [router, stopRefreshTimer, queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}