import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { queryKeys } from '@/lib/query-keys';
import { AUTH_KEYS } from '@/lib/constants/auth';

/**
 * @deprecated Use `useAuth()` from AuthContext instead.
 * AuthContext now uses React Query cache as the single source of truth.
 * This hook is kept for backward compatibility but will be removed in a future version.
 */
export function useAuthUser() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authApi.getAdminProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem(AUTH_KEYS.TOKEN),
  });
}