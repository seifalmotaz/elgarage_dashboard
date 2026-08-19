import { useMutation, useQueryClient } from '@tanstack/react-query';
import { negotiationsApi, UpdateNegotiationPayload } from '@/lib/api/negotiations';
import { queryKeys } from '@/lib/query-keys';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Mutation hook for updating a negotiation
 */
export function useUpdateNegotiationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNegotiationPayload }) =>
      negotiationsApi.update(id, data),
    onSuccess: (updated, { id }) => {
      // Update the detail cache with the new data
      queryClient.setQueryData(queryKeys.negotiations.detail(id), updated);
      // Invalidate the list and stats to reflect any changes
      queryClient.invalidateQueries({ queryKey: queryKeys.negotiations.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.negotiations.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث التفاوض بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update negotiation', { id, error });
      toast.error('حدث خطأ أثناء تحديث التفاوض');
    },
  });
}

/**
 * Mutation hook for completing a negotiation with final price
 */
export function useCompleteNegotiationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, finalPrice }: { id: string; finalPrice: number }) =>
      negotiationsApi.complete(id, { finalPrice }),
    onSuccess: (updated, { id }) => {
      // Update the detail cache with the new data
      queryClient.setQueryData(queryKeys.negotiations.detail(id), updated);
      // Invalidate the list and stats to reflect any changes
      queryClient.invalidateQueries({ queryKey: queryKeys.negotiations.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.negotiations.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم إتمام المفاوضة بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to complete negotiation', { id, error });
      toast.error('حدث خطأ أثناء إتمام المفاوضة');
    },
  });
}