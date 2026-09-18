import { useQuery } from '@tanstack/react-query';
import { listingRequestsApi, ListingRequestFilters } from '@/lib/api/listing-requests';
import { queryKeys } from '@/lib/query-keys';

/**
 * Get paginated list of listing requests with optional filters
 */
export function useListingRequests(filters?: ListingRequestFilters) {
  return useQuery({
    queryKey: queryKeys.listingRequests.list(filters as Record<string, unknown>),
    queryFn: () => listingRequestsApi.getList(filters),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Get listing request statistics
 */
export function useListingRequestsStats() {
  return useQuery({
    queryKey: queryKeys.listingRequests.all(),
    queryFn: () => listingRequestsApi.getStats(),
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get listing request details by ID
 */
export function useListingRequestDetail(requestId: string) {
  return useQuery({
    queryKey: queryKeys.listingRequests.detail(requestId),
    queryFn: () => listingRequestsApi.getById(requestId),
    enabled: !!requestId, // Only run if requestId is provided
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get list of inspectors for assignment dropdown
 */
export function useInspectorsForAssignment(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['listingRequests', 'inspectors', page, limit],
    queryFn: () => listingRequestsApi.getInspectors(page, limit),
    staleTime: 60_000, // 1 minute
  });
}
