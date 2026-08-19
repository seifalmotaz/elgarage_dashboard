import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  testimonialsApi,
  type CreateTestimonialPayload,
  type UpdateTestimonialPayload,
} from '@/lib/api/testimonials';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

export function useCreateTestimonialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestimonialPayload) =>
      testimonialsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all() });
      toast.success('تم إنشاء الرأي بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create testimonial', { error });
      toast.error('حدث خطأ أثناء إنشاء الرأي');
    },
  });
}

export function useUpdateTestimonialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTestimonialPayload;
    }) => testimonialsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.testimonials.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all() });
      toast.success('تم تحديث الرأي بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to update testimonial', { error });
      toast.error('حدث خطأ أثناء تحديث الرأي');
    },
  });
}

export function useDeleteTestimonialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testimonialsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all() });
      toast.success('تم حذف الرأي بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete testimonial', { error });
      toast.error('حدث خطأ أثناء حذف الرأي');
    },
  });
}

export function useToggleTestimonialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      testimonialsApi.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all() });
      toast.success('تم تحديث حالة الرأي');
    },
    onError: (error: Error) => {
      logger.error('Failed to toggle testimonial', { error });
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
  });
}
