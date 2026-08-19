import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook to fetch all settings
 */
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all(),
    queryFn: () => settingsApi.getAll(),
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to fetch settings by category
 */
export function useSettingsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.settings.category(category),
    queryFn: () => settingsApi.getByCategory(category),
    enabled: !!category,
  });
}