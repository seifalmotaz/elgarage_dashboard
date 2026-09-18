import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { adminInspectionsApi } from '@/lib/api/admin-inspections';
import { queryKeys } from '@/lib/query-keys';
import type { InspectionReportItem } from '@/lib/api/listing-requests';

/**
 * Get inspection report by car ID
 */
export function useInspectionByCarId(carId: string | undefined) {
  return useQuery<InspectionReportItem>({
    queryKey: queryKeys.adminInspections.byCar(carId!),
    queryFn: () => adminInspectionsApi.getByCarId(carId!),
    enabled: !!carId,
    retry: false, // Don't retry on 404 (no inspection exists)
  });
}

/**
 * Get inspection report by ID
 */
export function useInspectionById(id: string | undefined) {
  return useQuery<InspectionReportItem>({
    queryKey: queryKeys.adminInspections.detail(id!),
    queryFn: () => adminInspectionsApi.getById(id!),
    enabled: !!id,
  });
}