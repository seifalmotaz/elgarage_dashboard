import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminInspectionsApi } from '@/lib/api/admin-inspections';
import { queryKeys } from '@/lib/query-keys';
import type {
  SubmitResponsePayload,
  SubmitSectionNotePayload,
  BulkSavePayload,
} from '@/lib/api/admin-inspections';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';


/**
 * Create a new inspection report for a car
 */
export function useCreateInspectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carId: string) => adminInspectionsApi.create(carId),
    onSuccess: (data, carId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.byCar(carId) });
      toast.success('تم إنشاء تقرير الفحص بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create inspection', { error });
      toast.error('حدث خطأ أثناء إنشاء تقرير الفحص');
    },
  });
}

/**
 * Submit or update a single response with optimistic update
 */
export function useSubmitResponseMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitResponsePayload) =>
      adminInspectionsApi.submitResponse(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.all() });
    },
    onError: (error: Error) => {
      logger.error('Failed to submit response', { error });
      toast.error('حدث خطأ أثناء حفظ الإجابة');
    },
  });
}

/**
 * Submit or update section notes
 */
export function useSubmitSectionNoteMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitSectionNotePayload) =>
      adminInspectionsApi.submitSectionNote(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.all() });
    },
    onError: (error: Error) => {
      logger.error('Failed to submit section note', { error });
    },
  });
}

/**
 * Bulk save all responses and section notes
 */
export function useBulkSaveInspectionMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkSavePayload) =>
      adminInspectionsApi.bulkSave(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.all() });
      toast.success('تم حفظ تعديلات تقرير الفحص بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to save inspection changes', { error });
      toast.error('حدث خطأ أثناء حفظ التعديلات');
    },
  });
}


/**
 * Upload a photo to the inspection report
 */
export function useUploadPhotoMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      sectionId,
      questionId,
      description,
    }: {
      file: File;
      sectionId?: string;
      questionId?: string;
      description?: string;
    }) => adminInspectionsApi.uploadPhoto(reportId, file, sectionId, questionId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.all() });
    },
    onError: (error: Error) => {
      logger.error('Failed to upload photo', { error });
      toast.error('حدث خطأ أثناء رفع الصورة');
    },
  });
}

/**
 * Delete a photo from the inspection report
 */
export function useDeletePhotoMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => adminInspectionsApi.deletePhoto(reportId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.all() });
    },
    onError: (error: Error) => {
      logger.error('Failed to delete photo', { error });
      toast.error('حدث خطأ أثناء حذف الصورة');
    },
  });
}

/**
 * Mark inspection as completed
 */
export function useCompleteInspectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => adminInspectionsApi.complete(reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.detail(reportId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminInspections.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.all() });
      toast.success('تم إكمال تقرير الفحص بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to complete inspection', { error });
      toast.error('حدث خطأ أثناء إكمال تقرير الفحص');
    },
  });
}