import { useQuery } from '@tanstack/react-query';
import { contactApi, ContactFilters } from '@/lib/api/contact';
import { queryKeys } from '@/lib/query-keys';
import { cacheConfig } from '@/config/cache.config';

/**
 * Hook to fetch list of contact submissions with optional filters
 */
export function useContactSubmissions(filters?: ContactFilters) {
  return useQuery({
    queryKey: queryKeys.contact.list(filters),
    queryFn: () => contactApi.getList(filters),
    staleTime: cacheConfig.staleTime,
  });
}

/**
 * Hook to fetch a single contact submission by ID
 */
export function useContactSubmission(id: string) {
  return useQuery({
    queryKey: queryKeys.contact.detail(id),
    queryFn: () => contactApi.getById(id),
    enabled: !!id,
  });
}