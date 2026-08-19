import { useQuery, useQueryClient } from '@tanstack/react-query';
import { inspectorsApi, InspectorFilters, InspectorAppointmentFilters } from '@/lib/api/inspectors';
import { queryKeys } from '@/lib/query-keys';

/**
 * Get paginated list of inspectors with optional filters
 */
export function useInspectors(filters?: InspectorFilters) {
  return useQuery({
    queryKey: queryKeys.inspectors.list(filters as Record<string, unknown>),
    queryFn: () => inspectorsApi.getList(filters),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Get inspector dashboard statistics
 */
export function useInspectorStats() {
  return useQuery({
    queryKey: queryKeys.inspectors.stats(),
    queryFn: () => inspectorsApi.getStats(),
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get inspector details by ID
 */
export function useInspectorDetail(inspectorId: string) {
  return useQuery({
    queryKey: queryKeys.inspectors.detail(inspectorId),
    queryFn: () => inspectorsApi.getById(inspectorId),
    enabled: !!inspectorId,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get appointments for a specific inspector
 */
export function useInspectorAppointments(inspectorId: string, filters?: InspectorAppointmentFilters) {
  return useQuery({
    queryKey: queryKeys.inspectors.appointments(inspectorId, filters as Record<string, unknown>),
    queryFn: () => inspectorsApi.getAppointments(inspectorId, filters),
    enabled: !!inspectorId,
    staleTime: 15_000, // 15 seconds - appointments change frequently
  });
}

/**
 * Get weekly appointments calendar
 */
export function useWeeklyAppointments(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: queryKeys.inspectors.weeklyAppointments(),
    queryFn: () => inspectorsApi.getWeeklyAppointments(startDate, endDate),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Helper hook for prefetching inspector detail
 */
export function usePrefetchInspectorDetail() {
  const queryClient = useQueryClient();

  const prefetchInspector = (inspectorId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.inspectors.detail(inspectorId),
      queryFn: () => inspectorsApi.getById(inspectorId),
      staleTime: 60_000,
    });
  };

  return { prefetchInspector };
}