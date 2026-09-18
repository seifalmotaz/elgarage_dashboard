import { useMutation, useQueryClient } from '@tanstack/react-query';
import { faqApi, CreateFAQPayload, UpdateFAQPayload } from '@/lib/api/faq';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Hook to create a new FAQ
 */
export function useCreateFAQMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFAQPayload) => faqApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faq.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم إنشاء السؤال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create FAQ', { error });
      toast.error('حدث خطأ أثناء إنشاء السؤال');
    },
  });
}

/**
 * Hook to update an existing FAQ
 */
export function useUpdateFAQMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFAQPayload }) =>
      faqApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faq.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.faq.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث السؤال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to update FAQ', { error });
      toast.error('حدث خطأ أثناء تحديث السؤال');
    },
  });
}

/**
 * Hook to delete a FAQ
 */
export function useDeleteFAQMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => faqApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faq.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم حذف السؤال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete FAQ', { error });
      toast.error('حدث خطأ أثناء حذف السؤال');
    },
  });
}

/**
 * Hook to reorder FAQs
 */
export function useReorderFAQMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => faqApi.reorder(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faq.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم إعادة ترتيب الأسئلة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder FAQs', { error });
      toast.error('حدث خطأ أثناء إعادة ترتيب الأسئلة');
    },
  });
}