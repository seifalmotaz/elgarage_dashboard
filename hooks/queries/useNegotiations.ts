import { useQuery } from '@tanstack/react-query';
import { negotiationsApi } from '@/lib/api/negotiations';
import { queryKeys } from '@/lib/query-keys';
import type { NegotiationFilters } from '@/lib/api/negotiations';

/**
 * Hook for fetching paginated negotiations list with filters
 */
export function useNegotiations(filters?: NegotiationFilters) {
  return useQuery({
    queryKey: queryKeys.negotiations.list(filters as Record<string, unknown>),
    queryFn: () => negotiationsApi.getList(filters),
    staleTime: 30_000,
  });
}

/**
 * Hook for fetching a single negotiation's details
 */
export function useNegotiationDetail(negotiationId: string) {
  return useQuery({
    queryKey: queryKeys.negotiations.detail(negotiationId),
    queryFn: () => negotiationsApi.getById(negotiationId),
    enabled: !!negotiationId,
    staleTime: 60_000,
  });
}

/**
 * Hook for fetching negotiations statistics
 */
export function useNegotiationStats() {
  return useQuery({
    queryKey: queryKeys.negotiations.stats(),
    queryFn: () => negotiationsApi.getStats(),
    staleTime: 30_000,
  });
}