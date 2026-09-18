'use client';

import React from 'react';
import Link from 'next/link';
import { SEMANTIC_COLORS } from '@/lib/api-client';
import type {
  InspectionReportItem,
  InspectionPhotoItem,
  InspectionResponseItem,
  InspectionVersionItem,
} from '@/lib/api/listing-requests';

interface InspectionReportProps {
  report: InspectionReportItem | null;
  editUrl?: string;
  onEdit?: () => void;
}

interface ReportSection {
  title: string;
  icon: string | null;
  order: number;
  photos: InspectionPhotoItem[];
  sectionNote: {
    id: string;
    reportId: string;
    sectionId: string;
    notes: string | null;
    createdAt: string;
  } | null;
  questions: {
    id: string;
    questionText: string;
    questionKey: string;
    order: number;
    options: { label: string; value: string; semanticType: 'GOOD' | 'WARN' | 'BAD'; order: number }[];
    response: {
      answerValue: string;
      answerText: string | null;
      notes: string | null;
    } | null;
    photos: InspectionPhotoItem[];
  }[];
}

function buildReportSections(report: InspectionReportItem | null): ReportSection[] {
  if (!report || !report.version) return [];

  const responses = report.responses || [];
  const photos = report.photos || [];

  return (report.version.sections || [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const sectionPhotos = photos.filter((p) => p.sectionId === section.id && p.questionId == null);
      const sectionNote = (report?.sectionNotes || []).find((n) => n.sectionId === section.id) || null;
      return {
        title: section.title,
        icon: section.icon,
        order: section.order,
        photos: sectionPhotos,
        sectionNote,
        questions: (section.questions || [])
        .filter((q) => q.isActive)
        .sort((a, b) => a.order - b.order)
        .map((q) => {
          const resp = responses.find((r) => r.questionId === q.id) || null;
          const qPhotos = photos.filter((p) => p.questionId === q.id);
          return {
            id: q.id,
            questionText: q.questionText,
            questionKey: q.questionKey,
            order: q.order,
            options: (q.answerOptions || [])
              .sort((a, b) => a.order - b.order)
              .map((o) => ({
                label: o.label,
                value: o.value,
                semanticType: o.semanticType || 'GOOD',
                order: o.order,
              })),
            response: resp
              ? { answerValue: resp.answerValue, answerText: resp.answerText, notes: resp.notes }
              : null,
            photos: qPhotos,
          };
        }),
      };
    });
}

export function InspectionReport({ report, editUrl, onEdit }: InspectionReportProps) {
  const sections = buildReportSections(report);

  if (sections.length === 0) return null;

  return (
    <div className="bg-white rounded-[16px] px-4 py-5 flex flex-col gap-4 border border-[#F2F2F2]">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#002EC1] text-right">
          نتائج الفحص
          <span className="text-[12px] text-[#8286ab] font-light mr-2">
            (الإصدار {report?.version?.versionNumber || "--"})
          </span>
        </h3>

        {editUrl ? (
          <Link
            href={editUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[200px] bg-[#002ec1]/10 text-[#002ec1] hover:bg-[#002ec1]/20 text-[12px] font-semibold transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>تعديل تقرير الفحص</span>
          </Link>
        ) : onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[200px] bg-[#002ec1]/10 text-[#002ec1] hover:bg-[#002ec1]/20 text-[12px] font-semibold transition-all cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>تعديل تقرير الفحص</span>
          </button>
        ) : null}
      </div>

      {/* General Report Photos */}
      {(() => {
        const generalPhotos = (report?.photos || []).filter((p) => p.sectionId == null && p.questionId == null);
        if (generalPhotos.length === 0) return null;
        return (
          <div className="border border-[#f2f2f2] rounded-[12px] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#f2f2f2]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-[14px] font-semibold text-[#002ec1]">الصور العامة</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {generalPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative w-[72px] h-[72px] rounded-[8px] overflow-hidden border border-[#f2f2f2] bg-[#f9fafb]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url || ''}
                    alt={photo.description || "صورة فحص"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {sections.map((section) => (
        <div
          key={section.title}
          className="border border-[#f2f2f2] rounded-[12px] p-4 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#f2f2f2]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-[14px] font-semibold text-[#002ec1]">{section.title}</span>
            <span className="text-[12px] text-[#9ca3af] mr-auto">
              {section.questions.filter((q) => q.response).length}/{section.questions.length} مجاب
            </span>
          </div>

          {section.sectionNote?.notes && (
            <p className="text-[12px] text-[#6b7280] pr-2 border-r-2 border-[#e5e7eb]">
              {section.sectionNote.notes}
            </p>
          )}

          {section.photos.length > 0 && (
            <div className="flex gap-2 flex-wrap px-4 pt-2">
              {section.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative w-[72px] h-[72px] rounded-[8px] overflow-hidden border border-[#f2f2f2] bg-[#f9fafb]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url || ''}
                    alt={photo.description || "صورة فحص"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {section.questions.map((q) => {
              const option = q.options.find((o) => o.value === q.response?.answerValue);
              const colors = option ? SEMANTIC_COLORS[option.semanticType] : null;
              return (
                <div
                  key={q.id}
                  className={`rounded-[8px] p-3 flex flex-col gap-2 ${
                    q.response && colors ? `${colors.bg} border ${colors.border}` : "bg-[#f9fafb] border border-[#f2f2f2]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#1a1a1a]">
                        {q.questionText}
                      </span>
                    </div>
                    {q.response && option && colors ? (
                      <span className={`text-[12px] font-medium ${colors.text}`}>
                        {option.label}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#d1d5db]">غير مجاب</span>
                    )}
                  </div>

                  {q.response?.notes && (
                    <p className="text-[12px] text-[#6b7280] pr-2 border-r-2 border-[#e5e7eb]">
                      {q.response.notes}
                    </p>
                  )}

                  {q.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {q.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative w-[72px] h-[72px] rounded-[8px] overflow-hidden border border-[#f2f2f2] bg-[#f9fafb]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url || ''}
                            alt={photo.description || "صورة فحص"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}