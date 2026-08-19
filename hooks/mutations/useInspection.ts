import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inspectionApi,
  CreateSectionPayload,
  UpdateSectionPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from '@/lib/api/inspection.api';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';
import { generateKeyFromText } from '@/lib/utils/string';

/**
 * Mutation hook for creating a new inspection section
 */
export function useCreateSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSectionPayload) => inspectionApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      toast.success('تم إضافة القسم بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create section', { error });
      toast.error('حدث خطأ أثناء إضافة القسم');
    },
  });
}

/**
 * Mutation hook for updating an inspection section
 */
export function useUpdateSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSectionPayload }) =>
      inspectionApi.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      toast.success('تم تحديث القسم بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to update section', { error });
      toast.error('حدث خطأ أثناء تحديث القسم');
    },
  });
}

/**
 * Mutation hook for deleting an inspection section
 */
export function useDeleteSectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inspectionApi.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      toast.success('تم حذف القسم');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete section', { error });
      toast.error('حدث خطأ أثناء حذف القسم');
    },
  });
}

/**
 * Mutation hook for updating section options
 */
export function useUpdateSectionOptionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionId,
      options,
    }: {
      sectionId: string;
      options: { label: string; value: string; semanticType: 'GOOD' | 'WARN' | 'BAD' }[];
    }) => inspectionApi.updateSectionOptions(sectionId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      toast.success('تم تحديث الخيارات بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to update section options', { error });
      toast.error('حدث خطأ أثناء تحديث الخيارات');
    },
  });
}

/**
 * Mutation hook for creating a new inspection question
 */
export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionPayload) => inspectionApi.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      toast.success('تم إضافة السؤال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create question', { error });
      toast.error('حدث خطأ أثناء إضافة السؤال');
    },
  });
}

/**
 * Mutation hook for updating an inspection question
 */
export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionPayload }) =>
      inspectionApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      toast.success('تم تحديث السؤال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to update question', { error });
      toast.error('حدث خطأ أثناء تحديث السؤال');
    },
  });
}

/**
 * Mutation hook for deleting an inspection question
 */
export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inspectionApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      toast.success('تم حذف السؤال');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete question', { error });
      toast.error('حدث خطأ أثناء حذف السؤال');
    },
  });
}

/**
 * Mutation hook for reordering sections
 */
export function useReorderSectionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, newOrder }: { sectionId: string; newOrder: number }) =>
      inspectionApi.reorderSections(sectionId, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder sections', { error });
      toast.error('حدث خطأ أثناء إعادة الترتيب');
    },
  });
}

/**
 * Mutation hook for reordering questions
 */
export function useReorderQuestionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionId,
      questionId,
      newOrder,
    }: {
      sectionId: string;
      questionId: string;
      newOrder: number;
    }) => inspectionApi.reorderQuestions(sectionId, questionId, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
    },
    onError: (error: Error) => {
      logger.error('Failed to reorder questions', { error });
      toast.error('حدث خطأ أثناء إعادة الترتيب');
    },
  });
}

/**
 * Mutation hook for publishing a new version
 */
export function usePublishVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      inspectionApi.publishVersion(name, description),
    onSuccess: (version) => {
      queryClient.setQueryData(
        queryKeys.listingRequests.inspectionPublishStatus(),
        (current: unknown) => {
          if (!current || typeof current !== 'object') return current;
          const status = current as {
            draft?: { sectionCount: number; questionCount: number };
            unpublishedSummary?: {
              addedSections: string[];
              removedSections: string[];
              changedSections: string[];
            };
          };
          return {
            ...status,
            hasUnpublishedChanges: false,
            unpublishedSummary: {
              addedSections: [],
              removedSections: [],
              changedSections: [],
            },
            activeVersion: version
              ? {
                  id: version.id,
                  versionNumber: version.versionNumber,
                  name: version.name,
                  description: null,
                  createdAt: new Date().toISOString(),
                  sectionCount: status.draft?.sectionCount ?? 0,
                  questionCount: status.draft?.questionCount ?? 0,
                }
              : undefined,
            draft: status.draft,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionSections() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listingRequests.inspectionPublishStatus() });
      if (version?.alreadyPublished) {
        toast.success('المسودة مطابقة لما يراه المفتشون. لم يتم إنشاء نسخة جديدة.');
        return;
      }
      toast.success('تم نشر أسئلة الفحص للمفتشين');
    },
    onError: (error: Error) => {
      logger.error('Failed to publish version', { error });
      toast.error('حدث خطأ أثناء النشر');
    },
  });
}

/**
 * Mutation hook for creating a section with questions
 * This is a convenience mutation that handles creating a section
 * and then creating all its questions in one transaction
 */
export function useCreateSectionWithQuestionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      titleEn,
      icon,
      options,
      questions,
      enablePhotos,
      enableNotes,
    }: {
      title: string;
      titleEn?: string;
      icon?: string;
      options: { label: string; value: string; semanticType: 'GOOD' | 'WARN' | 'BAD' }[];
      questions: { text: string; textEn?: string }[];
      enablePhotos: boolean;
      enableNotes: boolean;
    }) => {
      // Create the section first
      const section = await inspectionApi.createSection({
        title,
        titleEn,
        icon,
        enablePhotos,
        enableNotes,
      });

      if (questions.length > 0) {
        await Promise.all(
          questions.map((q, index) =>
            inspectionApi.createQuestion({
              sectionId: section.id,
              questionText: q.text,
              questionTextEn: q.textEn,
              questionKey: `${generateKeyFromText(q.text)}_${index}`,
              options,
            })
          )
        );
      }

      return section;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingRequests.inspectionSections(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingRequests.inspectionPublishStatus(),
      });
      toast.success('تم حفظ القسم كمسودة. انشر التغييرات ليظهر للمفتشين.');
    },
    onError: (error: Error) => {
      logger.error('Failed to create section with questions', { error });
      
      const message = error.message || '';
      if (message.includes('questionKey') || message.includes('unique') || message.includes('Unique constraint')) {
        toast.error('يوجد سؤال بنفس النص في المسودة. غيّر النص أو احذف المكرر.');
      } else if (message.includes('not found')) {
        toast.error('خطأ: القسم غير موجود');
      } else {
        toast.error('حدث خطأ أثناء إضافة القسم');
      }
    },
  });
}

/**
 * Mutation hook for updating a section with questions
 * Handles creating, updating, and deleting questions to match the provided data
 */
export function useUpdateSectionWithQuestionsMutation() {
  const queryClient = useQueryClient();

  type QuestionEntry = {
    id?: string;
    text: string;
    textEn?: string;
  };

  return useMutation({
    mutationFn: async ({
      sectionId,
      title,
      titleEn,
      icon,
      options,
      questions,
      enablePhotos,
      enableNotes,
      existingQuestions,
    }: {
      sectionId: string;
      title: string;
      titleEn?: string | null;
      icon?: string;
      options: { label: string; value: string; semanticType: 'GOOD' | 'WARN' | 'BAD' }[];
      questions: QuestionEntry[];
      enablePhotos: boolean;
      enableNotes: boolean;
      existingQuestions: { id: string; questionText: string; questionTextEn?: string | null }[];
    }) => {
      // Update the section
      await inspectionApi.updateSection(sectionId, {
        title,
        titleEn: titleEn ?? null,
        icon,
        enablePhotos,
        enableNotes,
      });

      // Update options for all questions in section
      if (options.length > 0) {
        await inspectionApi.updateSectionOptions(sectionId, options);
      }

      const submittedIds = new Set(
        questions.filter((q): q is Required<QuestionEntry> => !!q.id).map((q) => q.id)
      );

      // Delete removed questions
      await Promise.all(
        existingQuestions
          .filter((existing) => !submittedIds.has(existing.id))
          .map((existing) => inspectionApi.deleteQuestion(existing.id))
      );

      // Update or create questions in parallel
      await Promise.all(
        questions.map((q) => {
          if (q.id) {
            const original = existingQuestions.find((dq) => dq.id === q.id);
            const nextTextEn = q.textEn?.trim() || null;
            const originalTextEn = original?.questionTextEn?.trim() || null;
            if (
              original &&
              (original.questionText !== q.text || originalTextEn !== nextTextEn)
            ) {
              return inspectionApi.updateQuestion(q.id, {
                questionText: q.text,
                questionTextEn: nextTextEn,
              });
            }
            return Promise.resolve();
          } else {
            return inspectionApi.createQuestion({
              sectionId,
              questionText: q.text,
              questionTextEn: q.textEn,
              questionKey: `${generateKeyFromText(q.text)}_${Date.now().toString(36)}`,
              options,
            });
          }
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingRequests.inspectionSections(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.listingRequests.inspectionPublishStatus(),
      });
      toast.success('تم حفظ التعديل كمسودة. انشر التغييرات ليظهر للمفتشين.');
    },
    onError: (error: Error) => {
      logger.error('Failed to update section with questions', { error });
      
      const message = error.message || '';
      if (message.includes('questionKey') || message.includes('unique') || message.includes('Unique constraint')) {
        toast.error('يوجد سؤال بنفس النص في المسودة. غيّر النص أو احذف المكرر.');
      } else if (message.includes('not found')) {
        toast.error('خطأ: القسم غير موجود');
      } else {
        toast.error('حدث خطأ أثناء تحديث القسم');
      }
    },
  });
}
