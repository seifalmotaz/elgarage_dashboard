import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carBrandsApi } from '@/lib/api/car-brands.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateBrandDto, CreateModelDto } from '@/lib/api/types';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Mutation hook for creating a new brand
 */
export function useCreateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrandDto) => carBrandsApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم اضافة الماركة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create brand', { error });
      toast.error('حدث خطأ أثناء إضافة الماركة');
    },
  });
}

/**
 * Mutation hook for updating a brand
 */
export function useUpdateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBrandDto> }) =>
      carBrandsApi.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم تحديث الماركة بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update brand', { id, error });
      toast.error('حدث خطأ أثناء تحديث الماركة');
    },
  });
}

/**
 * Mutation hook for deleting a brand
 */
export function useDeleteBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carBrandsApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم حذف الماركة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete brand', { error });
      toast.error('حدث خطأ أثناء حذف الماركة');
    },
  });
}

/**
 * Mutation hook for creating a model
 */
export function useCreateModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ brandId, data }: { brandId: string; data: CreateModelDto }) =>
      carBrandsApi.createModel(brandId, data),
    onSuccess: () => {
      // Invalidate brands to refresh models
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم اضافة الموديل بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create model', { error });
      toast.error('حدث خطأ أثناء إضافة الموديل');
    },
  });
}

/**
 * Mutation hook for updating a model
 */
export function useUpdateModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateModelDto> }) =>
      carBrandsApi.updateModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم تحديث الموديل بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update model', { id, error });
      toast.error('حدث خطأ أثناء تحديث الموديل');
    },
  });
}

/**
 * Mutation hook for deleting a model
 */
export function useDeleteModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carBrandsApi.deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم حذف الموديل بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete model', { error });
      toast.error('حدث خطأ أثناء حذف الموديل');
    },
  });
}

/**
 * Mutation hook for reordering brands
 */
export function useReorderBrandsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (brandIds: string[]) => carBrandsApi.reorderBrands(brandIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم إعادة ترتيب الماركات بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder brands', { error });
      toast.error('حدث خطأ أثناء إعادة ترتيب الماركات');
    },
  });
}

/**
 * Mutation hook for reordering models
 */
export function useReorderModelsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ brandId, modelIds }: { brandId: string; modelIds: string[] }) =>
      carBrandsApi.reorderModels(brandId, modelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.brands() });
      toast.success('تم إعادة ترتيب الموديلات بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder models', { error });
      toast.error('حدث خطأ أثناء إعادة ترتيب الموديلات');
    },
  });
}