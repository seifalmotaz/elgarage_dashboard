import { useQuery } from '@tanstack/react-query';
import { faqApi } from '@/lib/api/faq';
import { queryKeys } from '@/lib/query-keys';
import { cacheConfig } from '@/config/cache.config';

/**
 * Hook to fetch list of FAQs with optional category, search, and pagination
 */
export function useFAQs(category?: string, search?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.faq.list(category, search, page, limit),
    queryFn: () => faqApi.getList(category, search, page, limit),
    staleTime: cacheConfig.staleTime,
  });
}

/**
 * Hook to fetch a single FAQ by ID
 */
export function useFAQ(id: string) {
  return useQuery({
    queryKey: queryKeys.faq.detail(id),
    queryFn: () => faqApi.getById(id),
    enabled: !!id,
  });
}