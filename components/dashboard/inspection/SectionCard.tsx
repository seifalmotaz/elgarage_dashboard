'use client';

import React from 'react';
import Switch from '@/components/ui/Switch';
import { SEMANTIC_COLORS, type InspectionSection, type InspectionQuestion } from '@/lib/api-client';

interface SectionCardProps {
  section: InspectionSection & { draftQuestions?: InspectionQuestion[] };
  isToggling?: boolean;
  changeKind?: 'added' | 'changed';
  onEdit: () => void;
  onDelete: () => void;
  onTogglePhotos: (enabled: boolean) => void;
  onToggleNotes: (enabled: boolean) => void;
}

function getUniqueOptions(questions: InspectionQuestion[] | undefined): { label: string; semanticType: 'GOOD' | 'WARN' | 'BAD' }[] {
  if (!questions || questions.length === 0) return [];

  const firstQuestion = questions[0];
  if (!firstQuestion.draftOptions || firstQuestion.draftOptions.length === 0) return [];

  return firstQuestion.draftOptions.map((opt) => ({
    label: opt.label,
    semanticType: opt.semanticType || 'GOOD',
  }));
}

export default function SectionCard({
  section,
  isToggling,
  changeKind,
  onEdit,
  onDelete,
  onTogglePhotos,
  onToggleNotes,
}: SectionCardProps) {
  const questions = section.draftQuestions || [];
  const options = getUniqueOptions(questions);
  const questionCount = questions.length;

  return (
    <div className="bg-white border border-[#f2f2f2] rounded-[12px] p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="border-b border-[#f2f2f2] pb-3 flex items-center justify-between">
        {/* Title and Icon */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            {section.icon ? (
              <img
                src={section.icon}
                alt={section.title}
                width={24}
                height={24}
                className="object-contain"
              />
            ) : (
              <img
                src="/assets/dashboard/cars/stats-car.svg"
                alt=""
                width={24}
                height={24}
                className="opacity-60"
              />
            )}
          </div>
          <span className="text-[14px] font-medium text-[#002ec1]">{section.title}</span>
          {changeKind === 'added' ? (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#ecfdf3] text-[#067647] border border-[#abefc6]">
              غير منشور
            </span>
          ) : null}
          {changeKind === 'changed' ? (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#fffaeb] text-[#b54708] border border-[#fedf89]">
              معدّل
            </span>
          ) : null}
        </div>
        {/* Count and Menu */}
        <div className="flex items-center gap-3">
          <div className="bg-[#f2f2f2] px-3 py-1 rounded-[14px]">
            <span className="text-[12px] text-[#6b7280] font-light">{questionCount} سؤال</span>
          </div>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`تعديل قسم ${section.title}`}
            className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M11.586 2.586a2 2 0 112.828 2.828L6.343 13.485a1 1 0 01-.39.242l-3.535 1.178a.5.5 0 01-.632-.632l1.178-3.535a1 1 0 01.242-.39l8.07-8.07z"
                stroke="#6b7280"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`حذف قسم ${section.title}`}
            className="w-11 h-11 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Evaluation Options */}
      <div className="flex flex-col gap-3">
        <p className="text-[14px] text-[#1f2937] text-start font-normal leading-[1.5]">
          خيارات الإجابة
        </p>
        <div className="flex flex-wrap gap-2 justify-start">
          {options.map((opt, i) => {
            const colors = SEMANTIC_COLORS[opt.semanticType];
            return (
              <div
                key={i}
                className={`${colors.bg} ${colors.text} border ${colors.border} px-4 h-[36px] flex items-center justify-center rounded-[8px] text-[12px] font-normal`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions (Sub-parts) */}
      <div className="flex flex-col gap-3">
        <p className="text-[14px] text-[#1f2937] text-start font-normal leading-[1.5]">
          الأسئلة
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border border-[#f2f2f2] rounded-[8px] min-h-11 px-3 py-2 flex items-start justify-start gap-2"
            >
              <div className="w-4 h-4 mt-0.5 flex items-center justify-center shrink-0">
                <img
                  src="/assets/dashboard/sales-requests/tick-circle-linear.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              </div>
              <span className="text-[12px] text-[#4b5563] font-light leading-[1.7] flex-1 text-start break-words">
                {q.questionText || q.questionKey}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Toggles */}
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-[#f2f2f2] rounded-full px-5 py-3 flex items-center gap-3">
            <span className="text-[14px] text-[#0a0a0a] font-normal leading-[1.5]">تفعيل الصور</span>
            <Switch checked={section.enablePhotos} onChange={onTogglePhotos} disabled={isToggling} />
          </div>
          <div className="bg-white border border-[#f2f2f2] rounded-full px-5 py-3 flex items-center gap-3">
            <span className="text-[14px] text-[#0a0a0a] font-normal leading-[1.5]">تفعيل الملاحظات</span>
            <Switch checked={section.enableNotes} onChange={onToggleNotes} disabled={isToggling} />
          </div>
        </div>
        <p className="text-[12px] text-[#6b7280] leading-[1.5]">
          لا يغيّر نموذج المفتش حالياً. الصور والملاحظات تظهر هناك دائماً.
        </p>
      </div>
    </div>
  );
}