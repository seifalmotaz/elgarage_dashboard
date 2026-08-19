'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import { CreateSpecOptionDto } from '../../../../lib/api-client';

interface AddSpecOptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  specTypeId: string;
  specTypeName: string;
  editingOption?: { id: string; label: string; labelEn?: string | null; value: string } | null;
  onSave: (data: CreateSpecOptionDto) => Promise<void>;
}

export default function AddSpecOptionDialog({ 
  isOpen, 
  onClose, 
  specTypeId,
  specTypeName,
  editingOption, 
  onSave 
}: AddSpecOptionDialogProps) {
  const [formData, setFormData] = useState<CreateSpecOptionDto>({
    label: '',
    labelEn: '',
    value: '',
  });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or editingOption changes
  useEffect(() => {
    if (isOpen) {
      if (editingOption) {
        setFormData({
          label: editingOption.label,
          labelEn: editingOption.labelEn || '',
          value: editingOption.value,
        });
      } else {
        setFormData({
          label: '',
          labelEn: '',
          value: '',
        });
      }
    }
  }, [isOpen, editingOption]);

  // Auto-generate value from Arabic label (optional convenience)
  const generateValueFromLabel = (arabicLabel: string): string => {
    // Simple transliteration map for common Arabic to English
    const arabicToEnglish: Record<string, string> = {
      'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a',
      'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
      'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th',
      'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
      'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
      'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
      'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
      'ه': 'h', 'و': 'w', 'ي': 'y', 'ء': '',
      'ى': 'a', 'ة': 't', 'ئ': 'e',
    };

    let value = '';
    for (const char of arabicLabel) {
      if (arabicToEnglish[char]) {
        value += arabicToEnglish[char];
      } else if (/[a-zA-Z0-9]/.test(char)) {
        value += char.toLowerCase();
      }
    }
    return value.toLowerCase();
  };

  const handleLabelChange = (label: string) => {
    setFormData({
      ...formData,
      label,
      value: editingOption ? formData.value : generateValueFromLabel(label),
    });
  };

  const handleSubmit = async () => {
    if (!formData.label.trim() || !formData.value.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        labelEn: formData.labelEn?.trim() || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 text-[14px] font-medium text-[#6b7280] bg-[#f8fafc] border border-[#f2f2f2] rounded-full hover:bg-gray-100 transition-colors"
      >
        الغاء
      </button>
      <button
        onClick={handleSubmit}
        disabled={!formData.label.trim() || !formData.value.trim() || loading}
        className="px-6 py-2 text-[14px] font-medium text-white bg-[#002ec1] rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'جاري الحفظ...' : 'حفظ'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingOption ? 'تعديل الخيار' : `اضافة خيار لـ "${specTypeName}"`}
      maxWidth="500px"
      footer={footer}
    >
      <div className="flex flex-col gap-4" dir="rtl">
        {/* Label (Arabic) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الاسم (عربي) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="مثال: أسود"
            maxLength={50}
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
          />
          <span className="text-[10px] text-[#8286ab]">
            الحد الأقصى 50 حرف
          </span>
        </div>

        {/* Label (English) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الاسم (انجليزي)
          </label>
          <input
            type="text"
            value={formData.labelEn || ''}
            onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
            placeholder="Example: Black"
            maxLength={50}
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
        </div>

        {/* Value (API key) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            القيمة (انجليزي) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
            placeholder="مثال: black"
            maxLength={50}
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
          <span className="text-[10px] text-[#8286ab]">
            يُستخدم في النظام ويجب أن يكون باللغة الإنجليزية فقط
          </span>
        </div>
      </div>
    </Modal>
  );
}