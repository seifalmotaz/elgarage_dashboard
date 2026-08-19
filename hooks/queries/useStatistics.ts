import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/lib/api/statistics';
import { queryKeys } from '@/lib/query-keys';
import { cacheConfig } from '@/config/cache.config';

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

/**
 * Hook to fetch dashboard statistics
 * @param period - Optional time period filter: 'day' | 'week' | 'month' | 'year'
 */
export function useDashboardStats(period: TimePeriod = 'month') {
  return useQuery({
    queryKey: queryKeys.statistics.dashboard(period),
    queryFn: () => statisticsApi.getDashboardStats(period),
    staleTime: cacheConfig.overrides.statistics.staleTime,
    refetchInterval: cacheConfig.overrides.statistics.refetchInterval,
  });
}