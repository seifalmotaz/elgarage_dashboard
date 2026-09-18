import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carFeaturesApi } from '@/lib/api/car-features.api';
import { queryKeys } from '@/lib/query-keys';
import type { CreateFeatureSectionDto, CreateFeatureItemDto } from '@/lib/api/types';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Mutation hook for creating a feature section
 */
export function useCreateSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeatureSectionDto) => carFeaturesApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم اضافة القسم بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create section', { error });
      toast.error('فشل في انشاء القسم');
    },
  });
}

/**
 * Mutation hook for updating a feature section
 */
export function useUpdateSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFeatureSectionDto> }) =>
      carFeaturesApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم تحديث القسم بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update section', { id, error });
      toast.error('فشل في تحديث القسم');
    },
  });
}

/**
 * Mutation hook for deleting a feature section
 */
export function useDeleteSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carFeaturesApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم حذف القسم بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete section', { error });
      toast.error('فشل في حذف القسم');
    },
  });
}

/**
 * Mutation hook for reordering feature sections
 */
export function useReorderSectionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionIds: string[]) => carFeaturesApi.reorderSections(sectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم إعادة ترتيب الأقسام بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder sections', { error });
      toast.error('فشل في اعادة ترتيب الأقسام');
    },
  });
}

/**
 * Mutation hook for creating a feature item
 */
export function useCreateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: CreateFeatureItemDto }) =>
      carFeaturesApi.createItem(sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم اضافة الميزة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create feature item', { error });
      toast.error('فشل في اضافة الميزة');
    },
  });
}

/**
 * Mutation hook for updating a feature item
 */
export function useUpdateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFeatureItemDto> }) =>
      carFeaturesApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم تحديث الميزة بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update feature item', { id, error });
      toast.error('فشل في تحديث الميزة');
    },
  });
}

/**
 * Mutation hook for deleting a feature item
 */
export function useDeleteItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carFeaturesApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم حذف الميزة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete feature item', { error });
      toast.error('فشل في حذف الميزة');
    },
  });
}

/**
 * Mutation hook for reordering feature items within a section
 */
export function useReorderItemsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, itemIds }: { sectionId: string; itemIds: string[] }) =>
      carFeaturesApi.reorderItems(sectionId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.features() });
      toast.success('تم إعادة ترتيب الميزات بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder items', { error });
      toast.error('فشل في اعادة ترتيب الميزات');
    },
  });
}

/**
 * Mutation hook for uploading a feature icon
 */
export function useUploadIconMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => carFeaturesApi.uploadIcon(file),
    onSuccess: () => {
      // Icon upload doesn't invalidate features, just returns URL
      toast.success('تم رفع الأيقونة بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to upload icon', { error });
      toast.error('فشل في رفع الأيقونة');
    },
  });
}