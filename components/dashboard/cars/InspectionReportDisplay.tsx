'use client';

import React, { useState } from 'react';
import { SEMANTIC_COLORS } from '@/lib/api/types';
import type { InspectionReportUI } from '@/lib/utils/inspection-transformers';
import { DownloadInspectionPdfButton } from '@/components/dashboard/inspection/DownloadInspectionPdfButton';

interface InspectionReportDisplayProps {
  report: InspectionReportUI | null;
  completedAt?: string | null;
  reportId?: string | null;
}

function formatInspectionDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return '';
  }
}

export function InspectionReportDisplay({
  report,
  completedAt,
  reportId,
}: InspectionReportDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  if (!report || !report.sections || report.sections.length === 0) {
    return null;
  }

  const displayDate = completedAt || report.completedAt;

  return (
    <div className="bg-white rounded-[16px] border border-[#f2f2f2] flex flex-col gap-3 pb-3 overflow-hidden shadow-sm">
      <div className="bg-[#e9f0fc] p-3 flex items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2">
          <img
            src="/assets/dashboard/cars/verify.svg"
            alt="Verify"
            width={20}
            height={20}
          />
          <h3 className="text-[16px] font-bold text-[#1a1a1a]">تقرير الفحص</h3>
        </div>
        <span className="text-[12px] text-[#374151] font-normal mt-1">
          ({formatInspectionDate(displayDate)})
        </span>
      </div>

      <div className="flex items-center gap-9 justify-center py-2 border-b border-gray-50 mx-2">
        <div className="flex items-center gap-2 text-[#22c55e]">
          <div className="w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center">
            <img
              src="/assets/dashboard/cars/stats-tick.svg"
              alt="Success"
              width={12}
              height={12}
              className="brightness-0 invert"
            />
          </div>
          <span className="text-[14px] font-light leading-[1.9]">فحص ناجح</span>
        </div>
        <div className="flex items-center gap-2 text-[#f97316]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/icons/vuesax/linear/info-circle.png" 
            alt="Error" 
            width={20} 
            height={20} 
            className="opacity-70"
          />
          <span className="text-[14px] font-light leading-[1.9]">عيب او خلل</span>
        </div>
      </div>

      {report.sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        
        return (
          <div key={section.id} className="flex flex-col gap-3 px-3">
            <div 
              className={`rounded-xl p-4 border border-[#f2f2f2] flex flex-col gap-3 ${isExpanded ? "bg-[#f9fafb]/40" : "bg-white"}`}
            >
              <button 
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between border-b border-[#f2f2f2] pb-2 mb-1 w-full"
              >
                <div className="flex items-center gap-2">
                  {section.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={section.icon} 
                      alt={section.title} 
                      width={20} 
                      height={20} 
                      className="opacity-40"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-5 h-5 bg-[#e5e7eb] rounded opacity-40" />
                  )}
                  <span className="text-[14px] font-normal text-[#4b5563]">{section.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!isExpanded && (
                    <>
                      <div className="flex items-center gap-1.5 text-[#22c55e]">
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          <img
                            src="/assets/dashboard/cars/stats-tick.svg"
                            alt="Check"
                            width={14}
                            height={14}
                            className="opacity-40"
                          />
                        </div>
                        <span className="text-[12px] font-normal">{section.goodCount}</span>
                      </div>
                      {(section.warnCount > 0 || section.badCount > 0) && (
                        <div className="flex items-center gap-1.5 text-[#f97316]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src="/icons/vuesax/linear/info-circle.png" 
                            alt="Info" 
                            width={14} 
                            height={14} 
                            className="opacity-40 shrink-0"
                          />
                          <span className="text-[12px] font-normal">{section.warnCount + section.badCount}</span>
                        </div>
                      )}
                    </>
                  )}
                  <img
                    src="/assets/arrow-down.png"
                    alt="Arrow"
                    width={14}
                    height={14}
                    className={`opacity-40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              
              {isExpanded && (
                <div className="flex flex-col gap-3">
                  {section.questions.map((question) => {
                    const semanticType = question.response?.semanticType || 'GOOD';
                    const colors = SEMANTIC_COLORS[semanticType];
                    
                    return (
                      <div key={question.id} className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg ${colors.bg}`}>
                        <span className="text-[12px] text-[#6b7280] font-normal text-right leading-[1.5]">
                          {question.questionText}
                        </span>
                        <span className={`text-[12px] font-medium ${colors.text}`}>
                          {question.response?.label || 'غير محدد'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {reportId ? (
        <div className="px-3 pt-1 pb-1 border-t border-gray-50 mx-2">
          <DownloadInspectionPdfButton reportId={reportId} variant="button" />
        </div>
      ) : null}
    </div>
  );
}