import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi, CarStatus } from '@/lib/api/cars';
import { queryKeys } from '@/lib/query-keys';
import type { CreateCarDto, UpdateCarDto } from '@/lib/api/types';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Mutation hook for creating a new car
 */
export function useCreateCarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCarDto) => carsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم إضافة السيارة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create car', { error });
      toast.error('حدث خطأ أثناء إضافة السيارة');
    },
  });
}

/**
 * Mutation hook for updating a car
 */
export function useUpdateCarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCarDto }) =>
      carsApi.update(id, data),
    onSuccess: (updatedCar, { id }) => {
      // Update the detail cache with the new data
      queryClient.setQueryData(queryKeys.cars.detail(id), updatedCar);
      // Invalidate the list to reflect any changes
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث السيارة بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update car', { id, error });
      toast.error('حدث خطأ أثناء تحديث بيانات السيارة');
    },
  });
}

/**
 * Mutation hook for deleting a car
 */
export function useDeleteCarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم حذف السيارة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete car', { error });
      toast.error('حدث خطأ أثناء حذف السيارة');
    },
  });
}

/**
 * Mutation hook for updating car status
 * Uses optimistic updates for better UX
 */
export function useUpdateCarStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CarStatus }) =>
      carsApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cars.detail(id) });

      // Snapshot the previous value
      const previousCar = queryClient.getQueryData(queryKeys.cars.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.cars.detail(id), (old: unknown) => {
        if (old && typeof old === 'object') {
          return { ...old, status };
        }
        return old;
      });

      // Return context with the snapshot
      return { previousCar };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousCar) {
        queryClient.setQueryData(queryKeys.cars.detail(id), context.previousCar);
      }
      logger.error('Failed to update car status', { id, error });
      toast.error('حدث خطأ أثناء تحديث الحالة');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث الحالة بنجاح');
    },
  });
}

/**
 * Mutation hook for toggling car featured status
 * Uses optimistic updates for better UX
 */
export function useToggleFeaturedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      carsApi.toggleFeatured(id, isFeatured),
    onMutate: async ({ id, isFeatured }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cars.detail(id) });
      const previousCar = queryClient.getQueryData(queryKeys.cars.detail(id));

      queryClient.setQueryData(queryKeys.cars.detail(id), (old: unknown) => {
        if (old && typeof old === 'object') {
          return { ...old, isFeatured, featuredAt: isFeatured ? new Date().toISOString() : null };
        }
        return old;
      });

      return { previousCar };
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousCar) {
        queryClient.setQueryData(queryKeys.cars.detail(id), context.previousCar);
      }
      logger.error('Failed to toggle featured status', { id, error });
      toast.error('حدث خطأ أثناء تحديث حالة التمييز');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.list() });
      toast.success('تم تحديث حالة التمييز بنجاح');
    },
  });
}