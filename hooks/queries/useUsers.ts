import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, UserFilters } from '@/lib/api/users';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook to fetch paginated list of users with filters
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.getList(filters),
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
  });
}

/**
 * Hook to fetch user statistics
 */
export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.users.stats(),
    queryFn: () => usersApi.getStats(),
    staleTime: 60_000, // 1 minute (stats change less frequently)
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId, // Only run if userId is provided
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to prefetch user detail (useful for hover effects)
 */
export function usePrefetchUserDetail() {
  const queryClient = useQueryClient();

  const prefetchUser = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(userId),
      queryFn: () => usersApi.getById(userId),
      staleTime: 60_000,
    });
  };

  return { prefetchUser };
}