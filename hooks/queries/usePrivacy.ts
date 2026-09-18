import { useQuery } from '@tanstack/react-query';
import { privacyApi } from '@/lib/api/privacy';
import { queryKeys } from '@/lib/query-keys';

export function usePrivacyContent() {
  return useQuery({
    queryKey: queryKeys.settings.category('privacy'),
    queryFn: () => privacyApi.getContent(),
    staleTime: 5 * 60 * 1000,
  });
}