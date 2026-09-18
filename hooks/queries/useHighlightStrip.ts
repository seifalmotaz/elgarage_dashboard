import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
import { queryKeys } from '@/lib/query-keys';

export function useHighlightStrip() {
  return useQuery({
    queryKey: queryKeys.carHighlightStrip(),
    queryFn: () => settingsApi.getHighlightStrip(),
    staleTime: 60_000,
  });
}
