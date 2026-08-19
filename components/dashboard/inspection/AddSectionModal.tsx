'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import IconUploader from '@/components/dashboard/cars/dialogs/IconUploader';
import { type OptionSemanticType, type InspectionOption } from '@/lib/api-client';
import { generateStableValue } from '@/lib/utils/id';

interface QuestionEntry {
  id?: string;
  text: string;
  textEn?: string;
}

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    titleEn?: string;
    icon?: string;
    options: { label: string; value: string; semanticType: OptionSemanticType }[];
    questions: QuestionEntry[];
    enablePhotos: boolean;
    enableNotes: boolean;
  }) => Promise<void | boolean>;
  editSection?: {
    id: string;
    title: string;
    titleEn?: string | null;
    icon?: string;
    enablePhotos: boolean;
    enableNotes: boolean;
    options: InspectionOption[];
    questions: { id: string; text: string; textEn?: string }[];
  } | null;
}

const DEFAULT_OPTIONS: { label: string; semanticType: OptionSemanticType }[] = [
  { label: 'بدون خدوش', semanticType: 'GOOD' },
  { label: 'خفيفة', semanticType: 'WARN' },
  { label: 'واضحة', semanticType: 'WARN' },
  { label: 'عميقة', semanticType: 'BAD' },
];

function createDefaultQuestions(): QuestionEntry[] {
  return [{ text: '', textEn: '' }];
}

export default function AddSectionModal({ isOpen, onClose, onSubmit, editSection }: AddSectionModalProps) {
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [options, setOptions] = useState<{ label: string; semanticType: OptionSemanticType }[]>(DEFAULT_OPTIONS);
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [enablePhotos, setEnablePhotos] = useState(true);
  const [enableNotes, setEnableNotes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initializedKey, setInitializedKey] = useState<string | null>(null);

  const isEdit = !!editSection;

  useEffect(() => {
    if (!isOpen) {
      setInitializedKey(null);
      return;
    }
    // Only seed state when the modal transitions from closed -> open, keyed by
    // the section id (or 'new' for create). This prevents the freshly uploaded
    // icon from being clobbered when the parent re-renders with a new
    // editSection object literal.
    const seedKey = editSection ? editSection.id : 'new';
    if (initializedKey === seedKey) return;

    if (editSection) {
      setTitle(editSection.title || '');
      setTitleEn(editSection.titleEn || '');
      setIcon(editSection.icon || null);
      setOptions(
        editSection.options?.length > 0
          ? editSection.options.map((o) => ({ label: o.label, semanticType: o.semanticType }))
          : DEFAULT_OPTIONS
      );
      setQuestions(editSection.questions || []);
      setEnablePhotos(editSection.enablePhotos ?? true);
      setEnableNotes(editSection.enableNotes ?? true);
    } else {
      setTitle('');
      setTitleEn('');
      setIcon(null);
      setOptions(DEFAULT_OPTIONS);
      setQuestions(createDefaultQuestions());
      setEnablePhotos(true);
      setEnableNotes(true);
    }
    setInitializedKey(seedKey);
  }, [isOpen, editSection, initializedKey]);

  const handleAddOption = () => {
    setOptions([...options, { label: '', semanticType: 'GOOD' }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionLabelChange = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], label };
    setOptions(newOptions);
  };

  const handleSemanticTypeChange = (index: number, semanticType: OptionSemanticType) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], semanticType };
    setOptions(newOptions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', textEn: '' }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], text };
    setQuestions(newQuestions);
  };

  const handleQuestionTextEnChange = (index: number, textEn: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], textEn };
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const validQuestions = questions.filter((q) => q.text.trim().length > 0);

    const formattedOptions = options
      .filter((o) => o.label.trim())
      .map((o) => ({
        label: o.label.trim(),
        value: generateStableValue(o.label.trim()),
        semanticType: o.semanticType,
      }));

    setLoading(true);
    try {
      const saved = await onSubmit({
        title: title.trim(),
        titleEn: titleEn.trim() || undefined,
        icon: icon ?? undefined,
        options: formattedOptions,
        questions: validQuestions.map((q) => ({
          id: q.id,
          text: q.text.trim(),
          textEn: q.textEn?.trim() || undefined,
        })),
        enablePhotos,
        enableNotes,
      });
      if (saved !== false) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'تعديل قسم الفحص' : 'إضافة قسم فحص'}
      maxWidth="740px"
      footer={
        <div className="flex items-center gap-4 justify-start">
          <Button
            variant="primary"
            size="lg"
            className="w-[232px] h-[44px] rounded-full text-[12px] font-semibold leading-[1.5]"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
          >
            {loading ? 'جاري الحفظ...' : isEdit ? 'حفظ المسودة' : 'حفظ القسم في المسودة'}
          </Button>
          <button
            onClick={onClose}
            className="w-[140px] h-[44px] bg-[#fef2f2] text-[#dc2626] rounded-full text-[12px] font-semibold leading-[1.5] hover:bg-red-100 transition-all"
          >
            إلغاء
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-8" dir="rtl">
        {/* Row 1: Part Name & Icon */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-normal text-start leading-[1.5]">
              الايقونة
            </label>
            <IconUploader
              currentIcon={icon}
              onUpload={(url) => setIcon(url)}
              onRemove={() => setIcon(null)}
              maxSize={2 * 1024 * 1024}
              acceptedFormats={['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']}
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-normal text-start leading-[1.5]">
              اسم القسم (عربي)
            </label>
            <div className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center justify-start">
              <input
                type="text"
                placeholder="مثال: المحرك والفتيس"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-full bg-transparent text-[12px] text-[#1a1a1a] font-light outline-none leading-[1.7] text-right"
              />
            </div>
            <label className="text-[14px] text-[#1a1a1a] font-normal text-start leading-[1.5]">
              اسم القسم (انجليزي)
            </label>
            <div className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center justify-start">
              <input
                type="text"
                placeholder="Example: Engine and transmission"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                dir="ltr"
                className="w-full h-full bg-transparent text-[12px] text-[#1a1a1a] font-light outline-none leading-[1.7] text-left"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Evaluation Options */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[14px] text-[#1a1a1a] font-normal leading-[1.5]">
              عناصر التقييم
            </label>
            <button
              onClick={handleAddOption}
              className="text-[12px] text-[#002ec1] font-medium hover:underline"
            >
              + اضافة خيار
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="اسم الخيار"
                    value={option.label}
                    onChange={(e) => handleOptionLabelChange(index, e.target.value)}
                    className="flex-1 bg-white border border-[#f2f2f2] h-[40px] rounded-[8px] px-3 text-[12px] text-[#1a1a1a] outline-none focus:border-[#002ec1]"
                  />
                  <select
                    value={option.semanticType}
                    onChange={(e) => handleSemanticTypeChange(index, e.target.value as OptionSemanticType)}
                    className="h-[40px] rounded-[8px] px-3 text-[12px] border border-[#f2f2f2] outline-none focus:border-[#002ec1] bg-white"
                  >
                    <option value="GOOD">جيد (أخضر)</option>
                    <option value="WARN">تحذير (أصفر)</option>
                    <option value="BAD">سيء (أحمر)</option>
                  </select>
                </div>
                {options.length > 1 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Questions (Sub-parts) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[14px] text-[#1a1a1a] font-normal leading-[1.5]">
              أسئلة هذا القسم
            </label>
            <button
              onClick={handleAddQuestion}
              className="text-[12px] text-[#002ec1] font-medium hover:underline min-h-11 px-2"
            >
              + إضافة سؤال
            </button>
          </div>
          <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
            {questions.length === 0 ? (
              <div className="text-[12px] text-[#d1d5db] text-center py-6">
                لا توجد أسئلة. اضغط «+ إضافة سؤال».
              </div>
            ) : (
              questions.map((q, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="نص السؤال (عربي)"
                    value={q.text}
                    onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                    className="flex-1 bg-white border border-[#f2f2f2] h-[40px] rounded-[8px] px-3 text-[12px] text-[#1a1a1a] outline-none focus:border-[#002ec1]"
                  />
                  <input
                    type="text"
                    placeholder="Question (English)"
                    value={q.textEn || ''}
                    onChange={(e) => handleQuestionTextEnChange(index, e.target.value)}
                    dir="ltr"
                    className="flex-1 bg-white border border-[#f2f2f2] h-[40px] rounded-[8px] px-3 text-[12px] text-[#1a1a1a] outline-none focus:border-[#002ec1] text-left"
                  />
                  <button
                    onClick={() => handleRemoveQuestion(index)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Row 4: Toggles */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-start gap-3">
            <div className="bg-white border border-[#f2f2f2] rounded-[16px] px-5 py-4 flex items-center gap-3">
              <span className="text-[14px] text-[#0a0a0a] font-normal leading-[1.5]">تفعيل الصور</span>
              <Switch checked={enablePhotos} onChange={setEnablePhotos} />
            </div>
            <div className="bg-white border border-[#f2f2f2] rounded-[16px] px-5 py-4 flex items-center gap-3">
              <span className="text-[14px] text-[#0a0a0a] font-normal leading-[1.5]">تفعيل الملاحظات</span>
              <Switch checked={enableNotes} onChange={setEnableNotes} />
            </div>
          </div>
          <p className="text-[12px] text-[#6b7280] leading-[1.6]">
            هذان الخياران يُحفظان في المسودة فقط. تطبيق المفتش يعرض الصور والملاحظات لكل قسم حالياً بغض النظر عن هذا الإعداد.
          </p>
        </div>
      </div>
    </Modal>
  );
}