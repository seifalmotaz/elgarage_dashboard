import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listingRequestsApi,
  ListingRequestStatus,
} from '@/lib/api/listing-requests';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Mutation hook for assigning an inspector to a listing request
 */
export function useAssignInspectorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, inspectorId }: { requestId: string; inspectorId: string }) =>
      listingRequestsApi.assignInspector(requestId, inspectorId),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inspectors.stats() });
      toast.success('تم تعيين المفتش بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to assign inspector', { error });
      toast.error('حدث خطأ أثناء تعيين المفتش');
    },
  });
}

/**
 * Mutation hook for approving a listing request
 */
export function useApproveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, idempotencyKey }: { requestId: string; idempotencyKey?: string }) =>
      listingRequestsApi.approve(requestId, idempotencyKey),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم اعتماد طلب الفحص بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to approve request', { error });
      toast.error('حدث خطأ أثناء الاعتماد');
    },
  });
}

/**
 * Mutation hook for rejecting a listing request
 */
export function useRejectRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      reason,
      idempotencyKey,
    }: {
      requestId: string;
      reason: string;
      idempotencyKey?: string;
    }) => listingRequestsApi.reject(requestId, reason, idempotencyKey),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم رفض طلب الفحص');
    },
    onError: (error: Error) => {
      logger.error('Failed to reject request', { error });
      toast.error('حدث خطأ أثناء الرفض');
    },
  });
}

/**
 * Mutation hook for updating listing request status
 */
export function useUpdateRequestStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: ListingRequestStatus }) =>
      listingRequestsApi.updateStatus(requestId, status),
    onMutate: async ({ requestId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.listingRequests.detail(requestId) });
      const previous = queryClient.getQueryData(queryKeys.listingRequests.detail(requestId));
      queryClient.setQueryData(queryKeys.listingRequests.detail(requestId), (old: any) => ({
        ...old,
        status,
      }));
      return { previous };
    },
    onError: (error: Error, { requestId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.listingRequests.detail(requestId), context.previous);
      }
      logger.error('Failed to update request status', { error });
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث الحالة بنجاح');
    },
  });
}

/**
 * Mutation hook for cancelling a listing request (admin)
 */
export function useCancelRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId }: { requestId: string }) =>
      listingRequestsApi.cancel(requestId),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم إلغاء الطلب بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to cancel request', { error });
      toast.error('حدث خطأ أثناء إلغاء الطلب');
    },
  });
}

/**
 * Mutation hook for uploading inspection photos
 */
export function useUploadInspectionPhotosMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      photos,
    }: {
      requestId: string;
      photos: { sectionId?: string; questionId?: string; url: string; description?: string }[];
    }) => listingRequestsApi.uploadInspectionPhotos(requestId, photos),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingRequests.detail(requestId),
      });
      toast.success('تم رفع الصور بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to upload inspection photos', { error });
      toast.error('حدث خطأ أثناء رفع الصور');
    },
  });
}

/**
 * Mutation hook for starting or creating an inspection report on a listing request (admin)
 */
export function useStartInspectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => listingRequestsApi.startInspection(requestId),
    onSuccess: (data, requestId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingRequests.detail(requestId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingRequests.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminInspections.all(),
      });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.adminInspections.detail(data.id),
        });
      }
    },
    onError: (error: Error) => {
      logger.error('Failed to start inspection', { error });
      toast.error('حدث خطأ أثناء بدء تقرير الفحص');
    },
  });
}
