/**
 * @deprecated This hook uses manual state management and deprecated API imports.
 *
 * Use React Query hooks instead:
 * - For data fetching: `useInspectionSections` from `@/hooks/queries/useInspection`
 * - For mutations: `useCreateSectionWithQuestionsMutation`, `useUpdateSectionWithQuestionsMutation`,
 *   `useDeleteSectionMutation`, `useUpdateSectionMutation`, `usePublishVersionMutation`
 *   from `@/hooks/mutations/useInspection`
 *
 * This file will be removed in a future version.
 *
 * @example
 * // OLD (deprecated):
 * const { sections, loading } = useInspectionSections();
 *
 * // NEW (recommended):
 * import { useInspectionSections } from '@/hooks/queries/useInspection';
 * const { data: sections = [], isLoading } = useInspectionSections();
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateSectionOptions,
  publishVersion,
} from '@/lib/api/inspection';
import type { InspectionSection, InspectionQuestion, OptionSemanticType } from '@/lib/api-client';
import { showError, showSuccess } from '@/lib/notifications';
import { logger } from '@/lib/logger';
import { generateKeyFromText } from '@/lib/utils/string';

export interface QuestionEntry {
  id?: string;
  text: string;
}

export function useInspectionSections() {
  const [sections, setSections] = useState<(InspectionSection & { draftQuestions?: InspectionQuestion[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSection, setTogglingSection] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSections();
      const sectionsWithQuestions = await Promise.all(
        data.map((section) => getSection(section.id))
      );
      setSections(sectionsWithQuestions);
    } catch (error) {
      logger.error('Failed to fetch sections', { error });
      showError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const createSectionWithQuestions = useCallback(
    async (data: {
      title: string;
      options: { label: string; value: string; semanticType: OptionSemanticType }[];
      questions: QuestionEntry[];
      enablePhotos: boolean;
      enableNotes: boolean;
    }): Promise<boolean> => {
      try {
        const section = await createSection({
          title: data.title,
          enablePhotos: data.enablePhotos,
          enableNotes: data.enableNotes,
        });

        await Promise.all(
          data.questions.map((q) =>
            createQuestion({
              sectionId: section.id,
              questionText: q.text,
              questionKey: generateKeyFromText(q.text),
              options: data.options,
            })
          )
        );

        await fetchSections();
        showSuccess('تم إضافة قسم الفحص بنجاح');
        return true;
      } catch (error) {
        logger.error('Failed to create section', { error, data });
        showError('حدث خطأ أثناء إضافة قسم الفحص');
        return false;
      }
    },
    [fetchSections]
  );

  const updateSectionWithDetails = useCallback(
    async (
      sectionId: string,
      data: {
        title: string;
        options: { label: string; value: string; semanticType: OptionSemanticType }[];
        questions: QuestionEntry[];
        enablePhotos: boolean;
        enableNotes: boolean;
      },
      existingQuestions: InspectionQuestion[]
    ): Promise<boolean> => {
      try {
        await updateSection(sectionId, {
          title: data.title,
          enablePhotos: data.enablePhotos,
          enableNotes: data.enableNotes,
        });

        if (data.options.length > 0) {
          await updateSectionOptions(sectionId, data.options);
        }

        const submittedIds = new Set(
          data.questions.filter((q): q is Required<QuestionEntry> => !!q.id).map((q) => q.id)
        );

        // Delete removed questions
        await Promise.all(
          existingQuestions
            .filter((existing) => !submittedIds.has(existing.id))
            .map((existing) => deleteQuestion(existing.id))
        );

        // Update or create questions in parallel
        await Promise.all(
          data.questions.map((q) => {
            if (q.id) {
              const original = existingQuestions.find((dq) => dq.id === q.id);
              if (original && original.questionText !== q.text) {
                return updateQuestion(q.id, { questionText: q.text });
              }
              return Promise.resolve();
            } else {
              return createQuestion({
                sectionId,
                questionText: q.text,
                questionKey: generateKeyFromText(q.text),
                options: data.options,
              });
            }
          })
        );

        await fetchSections();
        showSuccess('تم تحديث قسم الفحص بنجاح');
        return true;
      } catch (error) {
        logger.error('Failed to update section', { error, sectionId, data });
        showError('حدث خطأ أثناء تحديث قسم الفحص');
        return false;
      }
    },
    [fetchSections]
  );

  const handleDeleteSection = useCallback(
    async (sectionId: string): Promise<boolean> => {
      try {
        await deleteSection(sectionId);
        setSections(sections.filter((s) => s.id !== sectionId));
        showSuccess('تم حذف قسم الفحص');
        return true;
      } catch (error) {
        logger.error('Failed to delete section', { error, sectionId });
        showError('حدث خطأ أثناء حذف قسم الفحص');
        return false;
      }
    },
    [sections]
  );

  const handleTogglePhotos = useCallback(
    async (sectionId: string, enabled: boolean): Promise<boolean> => {
      setTogglingSection(sectionId);
      try {
        await updateSection(sectionId, { enablePhotos: enabled });
        setSections(
          sections.map((s) => (s.id === sectionId ? { ...s, enablePhotos: enabled } : s))
        );
        return true;
      } catch (error) {
        logger.error('Failed to toggle photos', { error, sectionId, enabled });
        showError('حدث خطأ أثناء تحديث الإعدادات');
        return false;
      } finally {
        setTogglingSection(null);
      }
    },
    [sections]
  );

  const handleToggleNotes = useCallback(
    async (sectionId: string, enabled: boolean): Promise<boolean> => {
      setTogglingSection(sectionId);
      try {
        await updateSection(sectionId, { enableNotes: enabled });
        setSections(
          sections.map((s) => (s.id === sectionId ? { ...s, enableNotes: enabled } : s))
        );
        return true;
      } catch (error) {
        logger.error('Failed to toggle notes', { error, sectionId, enabled });
        showError('حدث خطأ أثناء تحديث الإعدادات');
        return false;
      } finally {
        setTogglingSection(null);
      }
    },
    [sections]
  );

  const handlePublish = useCallback(async (): Promise<boolean> => {
    try {
      const versionName = new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      await publishVersion(`إصدار ${versionName}`);
      showSuccess('تم نشر الإصدار بنجاح!');
      return true;
    } catch (error) {
      logger.error('Failed to publish version', { error });
      showError('حدث خطأ أثناء النشر');
      return false;
    }
  }, []);

  return {
    sections,
    loading,
    togglingSection,
    fetchSections,
    createSectionWithQuestions,
    updateSectionWithDetails,
    handleDeleteSection,
    handleTogglePhotos,
    handleToggleNotes,
    handlePublish,
  };
}