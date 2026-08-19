import { useQuery } from '@tanstack/react-query';
import {
  testimonialsApi,
  type TestimonialFilters,
} from '@/lib/api/testimonials';
import { queryKeys } from '@/lib/query-keys';
import { cacheConfig } from '@/config/cache.config';

export function useTestimonials(filters?: TestimonialFilters) {
  return useQuery({
    queryKey: queryKeys.testimonials.list(filters),
    queryFn: () => testimonialsApi.getList(filters),
    staleTime: cacheConfig.staleTime,
  });
}

export function useTestimonial(id: string) {
  return useQuery({
    queryKey: queryKeys.testimonials.detail(id),
    queryFn: () => testimonialsApi.getById(id),
    enabled: !!id,
  });
}
