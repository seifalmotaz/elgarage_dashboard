import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectorsApi, CreateInspectorPayload, UpdateInspectorPayload } from '@/lib/api/inspectors';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Mutation hook for creating a new inspector
 */
export function useCreateInspectorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInspectorPayload) => inspectorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.stats() });
      toast.success('تم إضافة المفتش بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create inspector', { error });
      toast.error('حدث خطأ أثناء إضافة المفتش');
    },
  });
}

/**
 * Mutation hook for updating an inspector
 */
export function useUpdateInspectorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInspectorPayload }) =>
      inspectorsApi.update(id, data),
    onSuccess: (updatedInspector, { id }) => {
      // Update the detail cache with the new data
      queryClient.setQueryData(queryKeys.inspectors.detail(id), updatedInspector);
      // Invalidate the list and stats to reflect any changes
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.stats() });
      toast.success('تم تحديث بيانات المفتش بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update inspector', { id, error });
      toast.error('حدث خطأ أثناء تحديث بيانات المفتش');
    },
  });
}

/**
 * Mutation hook for appointing an inspector to a listing request
 */
export function useAppointInspectorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inspectorId, requestId }: { inspectorId: string; requestId: string }) =>
      inspectorsApi.appointToRequest(inspectorId, requestId),
    onSuccess: () => {
      // Invalidate multiple queries that may be affected
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.list() });
      toast.success('تم تعيين المفتش للطلب بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to appoint inspector', { error });
      toast.error('حدث خطأ أثناء تعيين المفتش');
    },
  });
}