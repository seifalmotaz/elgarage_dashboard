import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carSpecsApi } from '@/lib/api/car-specs.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateSpecTypeDto, CreateSpecOptionDto } from '@/lib/api/types';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Mutation hook for creating a spec type
 */
export function useCreateSpecTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSpecTypeDto) => carSpecsApi.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم اضافة نوع المواصفة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create spec type', { error });
      toast.error('حدث خطأ أثناء إضافة نوع المواصفة');
    },
  });
}

/**
 * Mutation hook for updating a spec type
 */
export function useUpdateSpecTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSpecTypeDto> }) =>
      carSpecsApi.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم تحديث نوع المواصفة بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update spec type', { id, error });
      toast.error('حدث خطأ أثناء تحديث نوع المواصفة');
    },
  });
}

/**
 * Mutation hook for deleting a spec type
 */
export function useDeleteSpecTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carSpecsApi.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم حذف نوع المواصفة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete spec type', { error });
      toast.error('حدث خطأ أثناء حذف نوع المواصفة');
    },
  });
}

/**
 * Mutation hook for reordering spec types
 */
export function useReorderSpecTypesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (typeIds: string[]) => carSpecsApi.reorderTypes(typeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم إعادة ترتيب أنواع المواصفات بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder spec types', { error });
      toast.error('حدث خطأ أثناء إعادة ترتيب أنواع المواصفات');
    },
  });
}

/**
 * Mutation hook for creating a spec option
 */
export function useCreateSpecOptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, data }: { typeId: string; data: CreateSpecOptionDto }) =>
      carSpecsApi.createOption(typeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم اضافة الخيار بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create spec option', { error });
      toast.error('حدث خطأ أثناء إضافة الخيار');
    },
  });
}

/**
 * Mutation hook for updating a spec option
 */
export function useUpdateSpecOptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSpecOptionDto> }) =>
      carSpecsApi.updateOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم تحديث الخيار بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update spec option', { id, error });
      toast.error('حدث خطأ أثناء تحديث الخيار');
    },
  });
}

/**
 * Mutation hook for deleting a spec option
 */
export function useDeleteSpecOptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carSpecsApi.deleteOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم حذف الخيار بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete spec option', { error });
      toast.error('حدث خطأ أثناء حذف الخيار');
    },
  });
}

/**
 * Mutation hook for reordering spec options within a type
 */
export function useReorderSpecOptionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ typeId, optionIds }: { typeId: string; optionIds: string[] }) =>
      carSpecsApi.reorderOptions(typeId, optionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.specs() });
      toast.success('تم إعادة ترتيب الخيارات بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder spec options', { error });
      toast.error('حدث خطأ أثناء إعادة ترتيب الخيارات');
    },
  });
}