import { useQuery } from '@tanstack/react-query';
import { bannersApi, BannerFilters } from '@/lib/api/banners';
import { queryKeys } from '@/lib/query-keys';

/**
 * Hook to fetch paginated list of banners with filters
 */
export function useBanners(filters?: BannerFilters) {
  return useQuery({
    queryKey: queryKeys.banners.list(filters),
    queryFn: () => bannersApi.getList(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch a single banner by ID
 */
export function useBanner(id: string) {
  return useQuery({
    queryKey: queryKeys.banners.detail(id),
    queryFn: () => bannersApi.getById(id),
    enabled: !!id,
  });
}