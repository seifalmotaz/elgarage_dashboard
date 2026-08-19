import { useQuery } from '@tanstack/react-query';
import { generalSettingsApi } from '@/lib/api/general-settings';
import { queryKeys } from '@/lib/query-keys';

export function useGeneralSettings() {
  return useQuery({
    queryKey: queryKeys.settings.category('general'),
    queryFn: () => generalSettingsApi.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
}