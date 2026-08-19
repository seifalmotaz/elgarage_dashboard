import { useQuery } from '@tanstack/react-query';
import { supportApi } from '@/lib/api/support';
import { queryKeys } from '@/lib/query-keys';

export function useSupportContent() {
  return useQuery({
    queryKey: queryKeys.settings.category('support'),
    queryFn: () => supportApi.getContent(),
    staleTime: 5 * 60 * 1000,
  });
}