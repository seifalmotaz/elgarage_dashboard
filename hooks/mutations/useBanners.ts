import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bannersApi,
  CreateBannerPayload,
  UpdateBannerPayload,
  BannerStatus,
} from '@/lib/api/banners';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Hook to create a new banner
 */
export function useCreateBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerPayload) => bannersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم إنشاء البانر بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create banner', { error });
      toast.error('حدث خطأ أثناء إنشاء البانر');
    },
  });
}

/**
 * Hook to update an existing banner
 */
export function useUpdateBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerPayload }) =>
      bannersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث البانر بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to update banner', { error });
      toast.error('حدث خطأ أثناء تحديث البانر');
    },
  });
}

/**
 * Hook to delete a banner
 */
export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم حذف البانر بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete banner', { error });
      toast.error('حدث خطأ أثناء حذف البانر');
    },
  });
}

/**
 * Hook to toggle banner status
 */
export function useToggleBannerStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BannerStatus }) =>
      bannersApi.toggleStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.banners.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث حالة البانر بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to toggle banner status', { error });
      toast.error('حدث خطأ أثناء تحديث حالة البانر');
    },
  });
}