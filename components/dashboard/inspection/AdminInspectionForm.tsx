'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInspectionById } from '@/hooks/queries/useAdminInspections';
import {
  useSubmitResponseMutation,
  useSubmitSectionNoteMutation,
  useUploadPhotoMutation,
  useDeletePhotoMutation,
  useCompleteInspectionMutation,
} from '@/hooks/mutations/useAdminInspections';
import { SEMANTIC_COLORS } from '@/lib/api-client';

interface AdminInspectionFormProps {
  reportId: string;
  carId: string;
}

export function AdminInspectionForm({ reportId, carId }: AdminInspectionFormProps) {
  const router = useRouter();
  const { data: report, isLoading, isError, error } = useInspectionById(reportId);
  const submitResponse = useSubmitResponseMutation(reportId);
  const submitSectionNote = useSubmitSectionNoteMutation(reportId);
  const uploadPhoto = useUploadPhotoMutation(reportId);
  const deletePhoto = useDeletePhotoMutation(reportId);
  const completeInspection = useCompleteInspectionMutation();

  // Track active section in sidebar
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Track comments/photos expanded overrides
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [expandedPhotos, setExpandedPhotos] = useState<Record<string, boolean>>({});

  // Track pending state per action
  const [savingResponse, setSavingResponse] = useState<Record<string, boolean>>({});
  const [completing, setCompleting] = useState(false);

  // Calculate sections list
  const sections = report?.version?.sections
    ? report.version.sections.filter((s) => s.isActive).sort((a, b) => a.order - b.order)
    : [];

  // Initialize active section
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002ec1]" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[14px] text-[#dc2626]">
          {error instanceof Error ? error.message : 'فشل في تحميل تقرير الفحص'}
        </p>
        <button
          onClick={() => router.push(`/dashboard/cars/${carId}`)}
          className="text-[#002ec1] text-[14px] underline cursor-pointer"
        >
          العودة لصفحة السيارة
        </button>
      </div>
    );
  }

  if (!report.version?.sections) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[14px] text-[#6b7280]">لم يتم العثور على إصدار فحص نشط</p>
        <button
          onClick={() => router.push(`/dashboard/cars/${carId}`)}
          className="text-[#002ec1] text-[14px] underline cursor-pointer"
        >
          العودة لصفحة السيارة
        </button>
      </div>
    );
  }

  const isCompleted = report.status === 'COMPLETED';

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.filter((q) => q.isActive).length, 0);
  const answeredQuestions = (report.responses || []).length;
  const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const getResponse = (questionId: string) => {
    return (report.responses || []).find((r) => r.questionId === questionId);
  };

  const handleResponseChange = (questionId: string, answerValue: string) => {
    setSavingResponse((prev) => ({ ...prev, [questionId]: true }));
    const currentResponse = getResponse(questionId);
    submitResponse.mutate(
      { 
        questionId, 
        answerValue,
        notes: currentResponse?.notes || undefined 
      },
      {
        onSettled: () => {
          setSavingResponse((prev) => ({ ...prev, [questionId]: false }));
        },
      },
    );
  };

  const handleNoteChange = (questionId: string, notes: string) => {
    const response = getResponse(questionId);
    submitResponse.mutate({
      questionId,
      answerValue: response?.answerValue || '',
      notes: notes || undefined,
    });
  };

  const handleSectionNoteChange = (sectionId: string, notes: string) => {
    submitSectionNote.mutate({ sectionId, notes: notes || undefined });
  };

  const handlePhotoUpload = (sectionId?: string, questionId?: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      uploadPhoto.mutate({ file, sectionId, questionId });
    };
    input.click();
  };

  const handleComplete = async () => {
    setCompleting(true);
    completeInspection.mutate(reportId, {
      onSuccess: () => {
        router.push(`/dashboard/cars/${carId}`);
      },
      onSettled: () => {
        setCompleting(false);
      },
    });
  };

  const sectionNotes = report.sectionNotes || [];
  const activeSection = sections.find((s) => s.id === activeSectionId) || (sections.length > 0 ? sections[0] : null);

  const activeSectionNote = activeSection ? sectionNotes.find((n) => n.sectionId === activeSection.id) : null;
  const activeSectionPhotos = activeSection
    ? (report.photos || []).filter((p) => p.sectionId === activeSection.id && p.questionId == null)
    : [];
  const activeQuestions = activeSection
    ? activeSection.questions.filter((q) => q.isActive).sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 gap-6 items-start">
        
        {/* Right Sidebar (Navigation & Progress) */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto no-scrollbar">
          
          {/* Progress Card */}
          <div className="bg-white rounded-[16px] p-5 border border-[#f2f2f2] flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[#1a1a1a]">تقدم الفحص</span>
              <span className="text-[13px] font-semibold text-[#002ec1]">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-[#f2f2f2] rounded-full h-2">
              <div
                className="bg-[#002ec1] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
              <span>{answeredQuestions} من {totalQuestions} سؤال مجاب</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${isCompleted ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {isCompleted ? 'مكتمل' : 'قيد التنفيذ'}
              </span>
            </div>
          </div>

          {/* Section list for desktop */}
          <div className="hidden lg:flex flex-col gap-1.5 bg-white rounded-[16px] p-4 border border-[#f2f2f2] shadow-sm">
            <span className="text-[11px] font-bold text-[#8286ab] px-2 mb-2 uppercase tracking-wider">أقسام الفحص</span>
            
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[350px] no-scrollbar">
              {sections.map((section) => {
                const isActive = activeSectionId === section.id;
                const activeQuestionsCount = section.questions.filter((q) => q.isActive).length;
                const answeredInSection = section.questions.filter((q) => q.isActive && getResponse(q.id)).length;
                const isSectionDone = answeredInSection === activeQuestionsCount && activeQuestionsCount > 0;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-all text-start cursor-pointer group ${
                      isActive 
                        ? 'bg-[#002ec1] text-white shadow-md font-semibold' 
                        : 'bg-white text-[#4b5563] hover:bg-[#f9fafb] hover:text-[#111]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke={isActive ? 'currentColor' : '#002ec1'} 
                        strokeWidth="2"
                        className="shrink-0"
                      >
                        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      <span className="text-[13px] truncate">
                        {section.title}
                      </span>
                    </div>
                    
                    <span className={`text-[11px] px-2 py-0.5 rounded-[200px] shrink-0 font-medium ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : isSectionDone 
                          ? 'bg-green-50 text-green-700 font-bold' 
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {answeredInSection}/{activeQuestionsCount}
                    </span>
                  </button>
                );
              })}

              {/* General Photos pseudo-section */}
              <button
                onClick={() => setActiveSectionId('general_photos')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-[12px] transition-all text-start cursor-pointer mt-1 ${
                  activeSectionId === 'general_photos'
                    ? 'bg-[#002ec1] text-white shadow-md font-semibold'
                    : 'bg-white text-[#4b5563] hover:bg-[#f9fafb] hover:text-[#111]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={activeSectionId === 'general_photos' ? 'currentColor' : '#002ec1'} 
                    strokeWidth="2"
                    className="shrink-0"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="text-[13px] truncate">
                    الصور العامة
                  </span>
                </div>
                {(() => {
                  const count = (report.photos || []).filter((p) => p.sectionId == null && p.questionId == null).length;
                  return (
                    <span className={`text-[11px] px-2 py-0.5 rounded-[200px] shrink-0 font-medium ${
                      activeSectionId === 'general_photos'
                        ? 'bg-white/20 text-white'
                        : count > 0 
                          ? 'bg-green-50 text-green-700 font-bold' 
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  );
                })()}
              </button>
            </div>
          </div>

          {/* Sticky complete buttons on desktop sidebar */}
          <div className="hidden lg:flex flex-col gap-2">
            {!isCompleted && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full h-[48px] bg-green-600 hover:bg-green-700 text-white rounded-[200px] text-[13px] font-bold shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                {completing ? 'جاري الإكمال...' : 'إكمال تقرير الفحص'}
              </button>
            )}
            <button
              onClick={() => router.push(`/dashboard/cars/${carId}`)}
              className="w-full h-[48px] bg-white border border-[#e5e7eb] hover:bg-gray-50 text-[#6b7280] rounded-[200px] text-[13px] font-medium transition-all duration-150 cursor-pointer"
            >
              العودة للسيارة
            </button>
          </div>
        </aside>

        {/* Mobile Section Tabs switcher (Horizontal scrollable) */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2.5 mb-4 -mx-4 px-4 no-scrollbar">
          {sections.map((section) => {
            const isActive = activeSectionId === section.id;
            const activeQuestionsCount = section.questions.filter((q) => q.isActive).length;
            const answeredInSection = section.questions.filter((q) => q.isActive && getResponse(q.id)).length;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[200px] whitespace-nowrap text-[12px] font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#002ec1] text-white shadow-sm' 
                    : 'bg-white text-[#4b5563] border border-[#f2f2f2]'
                }`}
              >
                <span>{section.title}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {answeredInSection}/{activeQuestionsCount}
                </span>
              </button>
            );
          })}
          
          {/* Mobile General Photos Tab */}
          <button
            onClick={() => setActiveSectionId('general_photos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[200px] whitespace-nowrap text-[12px] font-medium transition-all cursor-pointer ${
              activeSectionId === 'general_photos' 
                ? 'bg-[#002ec1] text-white shadow-sm' 
                : 'bg-white text-[#4b5563] border border-[#f2f2f2]'
            }`}
          >
            <span>الصور العامة</span>
            {(() => {
              const count = (report.photos || []).filter((p) => p.sectionId == null && p.questionId == null).length;
              return (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSectionId === 'general_photos' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              );
            })()}
          </button>
        </div>

        {/* Main Content Area (Selected Section content or general photos) */}
        <main className="flex-1 flex flex-col gap-6">
          
          {activeSectionId === 'general_photos' ? (
            /* General Photos panel */
            <div className="bg-white rounded-[16px] p-6 border border-[#f2f2f2] flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#f2f2f2]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#002ec1]/5 rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1a1a1a]">الصور العامة للمركبة</h2>
                    <p className="text-[12px] text-[#8286ab] font-light mt-0.5">صور فحص عامة لا ترتبط بجزء معين في السيارة</p>
                  </div>
                </div>
                
                {!isCompleted && (
                  <button
                    onClick={() => handlePhotoUpload()}
                    disabled={uploadPhoto.isPending}
                    className="px-4 h-[36px] bg-[#002ec1]/10 text-[#002ec1] rounded-[200px] text-[12px] font-semibold hover:bg-[#002ec1]/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>{uploadPhoto.isPending ? 'جاري الرفع...' : 'إضافة صورة عامة'}</span>
                  </button>
                )}
              </div>
              
              {(() => {
                const generalPhotos = (report.photos || []).filter(
                  (p) => p.sectionId == null && p.questionId == null,
                );
                
                return generalPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {generalPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-[12px] overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] group"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {!isCompleted && (
                          <button
                            onClick={() => deletePhoto.mutate(photo.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M6 6l12 12M18 6l-12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center gap-2 border-2 border-dashed border-[#e5e7eb] rounded-[12px]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <p className="text-[13px] text-[#9ca3af]">لا توجد صور عامة مرفوعة حالياً</p>
                  </div>
                );
              })()}
            </div>
          ) : activeSection ? (
            /* Active Section Panel */
            <div className="flex flex-col gap-5">
              
              {/* Section general configuration card */}
              <div className="bg-white rounded-[16px] p-6 border border-[#f2f2f2] flex flex-col gap-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#002ec1]/5 rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-[16px] font-bold text-[#1a1a1a]">{activeSection.title}</h2>
                      <p className="text-[12px] text-[#8286ab] font-light mt-0.5">يرجى تقييم الأجزاء التالية وتوثيق الملاحظات أو الصور</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-[#002ec1] px-3.5 py-1 rounded-[200px] text-[12px] font-bold">
                    {activeQuestions.filter((q) => getResponse(q.id)).length} من {activeQuestions.length} مكتمل
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 pt-1">
                  {/* Section general notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#4b5563]">ملاحظات عامة للقسم</label>
                    <textarea
                      key={`${activeSection.id}-note`}
                      defaultValue={activeSectionNote?.notes || ''}
                      onBlur={(e) => handleSectionNoteChange(activeSection.id, e.target.value)}
                      placeholder="ملاحظات حول حالة هذا القسم ككل..."
                      className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-[12px] p-3 text-[12px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:bg-white transition-all resize-none flex-1 min-h-[90px]"
                      rows={3}
                    />
                  </div>

                  {/* Section general photos */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-semibold text-[#4b5563]">صور عامة للقسم</label>
                      <button
                        onClick={() => handlePhotoUpload(activeSection.id)}
                        disabled={uploadPhoto.isPending}
                        className="text-[12px] text-[#002ec1] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {uploadPhoto.isPending ? 'جاري الرفع...' : '+ إضافة صورة'}
                      </button>
                    </div>
                    
                    <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-[12px] p-3 flex-1 min-h-[90px] flex items-center justify-start">
                      {activeSectionPhotos.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {activeSectionPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              className="relative w-[56px] h-[56px] rounded-[8px] overflow-hidden border border-[#e5e7eb] bg-white group"
                            >
                              <img
                                src={photo.url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => deletePhoto.mutate(photo.id)}
                                className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                              >
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M6 6l12 12M18 6l-12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#9ca3af] italic text-center w-full">لا توجد صور لهذا القسم حالياً</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Section Questions List */}
              <div className="flex flex-col gap-4">
                {activeQuestions.map((q) => {
                  const response = getResponse(q.id);
                  const selectedOption = q.answerOptions.find((o) => o.value === response?.answerValue);
                  
                  // Clean design using white background and colored right border accent
                  const borderAccentClass = response && selectedOption
                    ? selectedOption.semanticType === 'GOOD'
                      ? 'border-r-4 border-r-[#16A34A]'
                      : selectedOption.semanticType === 'WARN'
                        ? 'border-r-4 border-r-[#CA8A04]'
                        : 'border-r-4 border-r-[#AF1208]'
                    : 'border-r-4 border-r-transparent';

                  const qPhotos = (report.photos || []).filter((p) => p.questionId === q.id);
                  const hasNotes = !!response?.notes;
                  const hasPhotos = qPhotos.length > 0;
                  const isWarnOrBad = selectedOption?.semanticType === 'WARN' || selectedOption?.semanticType === 'BAD';
                  
                  const isCommentOpen = expandedComments[q.id] !== undefined 
                    ? expandedComments[q.id] 
                    : (hasNotes || isWarnOrBad);
                    
                  const isPhotosOpen = expandedPhotos[q.id] !== undefined 
                    ? expandedPhotos[q.id] 
                    : (hasPhotos || isWarnOrBad);

                  return (
                    <div
                      key={q.id}
                      className={`bg-white rounded-[16px] p-5 border border-[#e5e7eb] transition-all duration-200 flex flex-col gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-md ${borderAccentClass} relative`}
                    >
                      {/* Question Row (Horizontal on desktop) */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Right side: Question Text */}
                        <span className="text-[14px] font-bold text-[#1a1a1a] leading-relaxed max-w-xl">
                          {q.questionText}
                          {q.isRequired && <span className="text-red-500 mr-1">*</span>}
                        </span>

                        {/* Left side: Options and status badge */}
                        <div className="flex items-center gap-3 shrink-0 justify-start md:justify-end mr-auto md:mr-0">
                          {/* Options pills selector */}
                          <div className="flex flex-wrap gap-2.5">
                            {q.answerOptions
                              .sort((a, b) => a.order - b.order)
                              .map((option) => {
                                const isSelected = option.value === response?.answerValue;
                                
                                // Selected pills use white background with colored border and text
                                let pillStyle = '';
                                if (isSelected) {
                                  if (option.semanticType === 'GOOD') {
                                    pillStyle = 'bg-white text-[#16A34A] border-2 border-[#16A34A] font-bold shadow-sm';
                                  } else if (option.semanticType === 'WARN') {
                                    pillStyle = 'bg-white text-[#CA8A04] border-2 border-[#CA8A04] font-bold shadow-sm';
                                  } else {
                                    pillStyle = 'bg-white text-[#AF1208] border-2 border-[#AF1208] font-bold shadow-sm';
                                  }
                                } else {
                                  pillStyle = 'bg-[#f9fafb] border border-[#e5e7eb] text-[#6b7280] hover:bg-white hover:border-[#002ec1] hover:text-[#002ec1]';
                                }

                                return (
                                  <button
                                    key={option.value}
                                    onClick={() => handleResponseChange(q.id, option.value)}
                                    disabled={isCompleted}
                                    className={`px-4 py-1.5 rounded-[200px] text-[13px] font-semibold transition-all duration-150 cursor-pointer ${pillStyle} ${savingResponse[q.id] ? 'opacity-50' : ''}`}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                          </div>

                          {/* Selected Option Badge */}
                          {selectedOption && (
                            <span className={`text-[11px] px-2.5 py-1 rounded-[8px] font-bold border shrink-0 ${
                              selectedOption.semanticType === 'GOOD'
                                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20'
                                : selectedOption.semanticType === 'WARN'
                                  ? 'bg-[#FEF3C7] text-[#CA8A04] border-[#CA8A04]/20'
                                  : 'bg-[#FFE0DE] text-[#AF1208] border-[#AF1208]/20'
                            }`}>
                              {selectedOption.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Toggles Bar */}
                      <div className="flex items-center justify-end gap-4 border-t border-[#f2f2f2] pt-3 mt-1">
                        {/* Note toggle */}
                        <button
                          onClick={() => setExpandedComments(prev => ({ ...prev, [q.id]: !isCommentOpen }))}
                          disabled={isCompleted}
                          className={`flex items-center gap-1.5 text-[12px] font-semibold transition-colors py-1 px-3 rounded-[200px] cursor-pointer ${
                            isCommentOpen
                              ? 'bg-blue-50 text-[#002ec1] border border-blue-100/30'
                              : 'text-[#6b7280] hover:text-[#002ec1] hover:bg-gray-50'
                          }`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          <span>ملاحظة</span>
                          {hasNotes && <span className="w-1.5 h-1.5 bg-[#002ec1] rounded-full"></span>}
                        </button>

                        {/* Photo toggle */}
                        <button
                          onClick={() => setExpandedPhotos(prev => ({ ...prev, [q.id]: !isPhotosOpen }))}
                          disabled={isCompleted}
                          className={`flex items-center gap-1.5 text-[12px] font-semibold transition-colors py-1 px-3 rounded-[200px] cursor-pointer ${
                            isPhotosOpen
                              ? 'bg-blue-50 text-[#002ec1] border border-blue-100/30'
                              : 'text-[#6b7280] hover:text-[#002ec1] hover:bg-gray-50'
                          }`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <span>صور</span>
                          {hasPhotos && (
                            <span className="bg-[#002ec1] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                              {qPhotos.length}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Comment textarea */}
                      {isCommentOpen && (
                        <div className="flex flex-col gap-1.5 mt-1 animate-fadeIn">
                          <textarea
                            key={`${q.id}-notes-input`}
                            defaultValue={response?.notes || ''}
                            onBlur={(e) => handleNoteChange(q.id, e.target.value)}
                            placeholder="تفاصيل الملاحظات وعيوب الجزء..."
                            disabled={isCompleted}
                            className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-[12px] px-4 py-2.5 text-[12px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:bg-white transition-all resize-none"
                            rows={2}
                          />
                        </div>
                      )}

                      {/* Question photos upload/list */}
                      {isPhotosOpen && (
                        <div className="flex flex-col gap-2.5 mt-1 border-t border-[#f2f2f2] pt-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-semibold text-[#4b5563]">الصور المرفقة بالجزء</span>
                            {!isCompleted && (
                              <button
                                onClick={() => handlePhotoUpload(activeSection.id, q.id)}
                                disabled={uploadPhoto.isPending}
                                className="text-[12px] text-[#002ec1] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                {uploadPhoto.isPending ? 'جاري الرفع...' : '+ إضافة صورة'}
                              </button>
                            )}
                          </div>
                          
                          {qPhotos.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                              {qPhotos.map((photo) => (
                                <div
                                  key={photo.id}
                                  className="relative w-[64px] h-[64px] rounded-[10px] overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] group"
                                >
                                  <img
                                    src={photo.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                  {!isCompleted && (
                                    <button
                                      onClick={() => deletePhoto.mutate(photo.id)}
                                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                                    >
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M6 6l12 12M18 6l-12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-[#9ca3af] italic">لا توجد صور مرفقة بالجزء حالياً</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Mobile Footer Sticky Action Panel */}
          <div className="lg:hidden flex flex-col gap-2 mt-4 bg-white border border-[#f2f2f2] p-4 rounded-[16px] shadow-sm">
            {!isCompleted && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full h-[46px] bg-green-600 hover:bg-green-700 text-white rounded-[200px] text-[13px] font-bold shadow-md transition-all duration-150 cursor-pointer"
              >
                {completing ? 'جاري الإكمال...' : 'إكمال تقرير الفحص'}
              </button>
            )}
            <button
              onClick={() => router.push(`/dashboard/cars/${carId}`)}
              className="w-full h-[46px] bg-white border border-[#e5e7eb] text-[#6b7280] rounded-[200px] text-[13px] font-medium cursor-pointer"
            >
              العودة للسيارة
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}