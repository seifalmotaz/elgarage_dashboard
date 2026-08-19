'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import SectionCard from './SectionCard';
import AddSectionModal from './AddSectionModal';
import InspectionPublishPanel from './InspectionPublishPanel';
import { useInspectionPublishStatus, useInspectionSections } from '@/hooks/queries/useInspection';
import {
  useCreateSectionWithQuestionsMutation,
  useUpdateSectionWithQuestionsMutation,
  useDeleteSectionMutation,
  useUpdateSectionMutation,
  usePublishVersionMutation,
} from '@/hooks/mutations/useInspection';
import type { InspectionSection, OptionSemanticType } from '@/lib/api/types';

export default function InspectionSettingsManager() {
  const { data: sections = [], isLoading } = useInspectionSections();
  const {
    data: publishStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchPublishStatus,
  } = useInspectionPublishStatus();
  const createSectionMutation = useCreateSectionWithQuestionsMutation();
  const updateSectionMutation = useUpdateSectionWithQuestionsMutation();
  const deleteSectionMutation = useDeleteSectionMutation();
  const updateSectionBasicMutation = useUpdateSectionMutation();
  const publishMutation = usePublishVersionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<InspectionSection | null>(null);
  const [togglingSection, setTogglingSection] = useState<string | null>(null);

  const handleAddSection = async (data: {
    title: string;
    titleEn?: string;
    icon?: string;
    options: { label: string; value: string; semanticType: OptionSemanticType }[];
    questions: { id?: string; text: string; textEn?: string }[];
    enablePhotos: boolean;
    enableNotes: boolean;
  }) => {
    try {
      await createSectionMutation.mutateAsync(data);
      setIsModalOpen(false);
      return true;
    } catch {
      return false;
    }
  };

  const handleEditSection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      setEditingSection(section);
      setIsModalOpen(true);
    }
  };

  const handleUpdateSection = async (data: {
    title: string;
    titleEn?: string;
    icon?: string;
    options: { label: string; value: string; semanticType: OptionSemanticType }[];
    questions: { id?: string; text: string; textEn?: string }[];
    enablePhotos: boolean;
    enableNotes: boolean;
  }) => {
    if (!editingSection) return false;
    try {
      await updateSectionMutation.mutateAsync({
        sectionId: editingSection.id,
        title: data.title,
        titleEn: data.titleEn ?? null,
        icon: data.icon,
        options: data.options,
        questions: data.questions,
        enablePhotos: data.enablePhotos,
        enableNotes: data.enableNotes,
        existingQuestions: (editingSection.draftQuestions || []).map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionTextEn: q.questionTextEn,
        })),
      });
      setEditingSection(null);
      setIsModalOpen(false);
      return true;
    } catch {
      return false;
    }
  };

  const onDeleteSection = async (sectionId: string) => {
    if (
      !confirm(
        'حذف هذا القسم من المسودة فقط. المفتشون يستمرون برؤية النسخة المنشورة حتى تضغط «نشر للمفتشين». متابعة؟',
      )
    ) {
      return;
    }
    try {
      await deleteSectionMutation.mutateAsync(sectionId);
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleTogglePhotos = async (sectionId: string, enabled: boolean) => {
    setTogglingSection(sectionId);
    try {
      await updateSectionBasicMutation.mutateAsync({
        id: sectionId,
        data: { enablePhotos: enabled },
      });
    } catch {
      // Error handled by mutation hook
    } finally {
      setTogglingSection(null);
    }
  };

  const handleToggleNotes = async (sectionId: string, enabled: boolean) => {
    setTogglingSection(sectionId);
    try {
      await updateSectionBasicMutation.mutateAsync({
        id: sectionId,
        data: { enableNotes: enabled },
      });
    } catch {
      // Error handled by mutation hook
    } finally {
      setTogglingSection(null);
    }
  };

  const handlePublish = async () => {
    const versionName = `الإصدار ${new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
    await publishMutation.mutateAsync({
      name: versionName,
      description: 'نشر يدوي من لوحة التحكم',
    });
  };

  const sectionChangeKind = (title: string): 'added' | 'changed' | undefined => {
    if (publishStatus?.unpublishedSummary.addedSections.includes(title)) return 'added';
    if (publishStatus?.unpublishedSummary.changedSections.includes(title)) return 'changed';
    return undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[14px] text-[#6b7280]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <InspectionPublishPanel
        status={publishStatus}
        isLoading={isStatusLoading}
        isError={isStatusError}
        isPublishing={publishMutation.isPending}
        onPublish={handlePublish}
        onRetry={() => {
          void refetchPublishStatus();
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#f2f2f2] pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-semibold text-[#1a1a1a]">أقسام المسودة</h3>
          <p className="text-[13px] text-[#6b7280] leading-[1.6]">
            التعديل هنا لا يصل للمفتش إلا بعد «نشر للمفتشين».
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEditingSection(null);
            setIsModalOpen(true);
          }}
          className="h-11 px-5"
          icon={
            <img
              src="/assets/dashboard/cars/add.svg"
              alt=""
              width={18}
              height={18}
              style={{
                filter:
                  'invert(16%) sepia(85%) saturate(3860%) hue-rotate(224deg) brightness(84%) contrast(106%)',
              }}
            />
          }
        >
          إضافة قسم فحص
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f9fafb] flex items-center justify-center mb-4">
            <img src="/assets/dashboard/cars/stats-car.svg" alt="" width={32} height={32} className="opacity-40" />
          </div>
          <p className="text-[14px] text-[#8286ab] mb-2">لا توجد أقسام في المسودة</p>
          <p className="text-[13px] text-[#9ca3af]">أضف قسماً ثم انشره ليظهر في تطبيق المفتش</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              changeKind={sectionChangeKind(section.title)}
              isToggling={togglingSection === section.id}
              onEdit={() => handleEditSection(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              onTogglePhotos={(enabled) => handleTogglePhotos(section.id, enabled)}
              onToggleNotes={(enabled) => handleToggleNotes(section.id, enabled)}
            />
          ))}
        </div>
      )}

      <AddSectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSection(null);
        }}
        onSubmit={editingSection ? handleUpdateSection : handleAddSection}
        editSection={
          editingSection
            ? {
                id: editingSection.id,
                title: editingSection.title,
                titleEn: editingSection.titleEn,
                icon: editingSection.icon,
                enablePhotos: editingSection.enablePhotos,
                enableNotes: editingSection.enableNotes,
                options: editingSection.draftQuestions?.[0]?.draftOptions || [],
                questions:
                  editingSection.draftQuestions?.map((q) => ({
                    id: q.id,
                    text: q.questionText,
                    textEn: q.questionTextEn || '',
                  })) || [],
              }
            : null
        }
      />
    </div>
  );
}
