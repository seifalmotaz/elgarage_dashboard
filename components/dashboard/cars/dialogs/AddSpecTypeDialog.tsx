'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import { SpecType, CreateSpecTypeDto } from '../../../../lib/api-client';
import IconUploader from './IconUploader';

interface AddSpecTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingType?: SpecType | null;
  onSave: (data: CreateSpecTypeDto) => Promise<void>;
}

export default function AddSpecTypeDialog({ 
  isOpen, 
  onClose, 
  editingType, 
  onSave 
}: AddSpecTypeDialogProps) {
  const [formData, setFormData] = useState<CreateSpecTypeDto>({
    name: '',
    nameEn: '',
    key: '',
    fieldType: 'DROPDOWN',
    iconUrl: null,
  });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or editingType changes
  useEffect(() => {
    if (isOpen) {
      if (editingType) {
        setFormData({
          name: editingType.name,
          nameEn: editingType.nameEn || '',
          key: editingType.key,
          fieldType: editingType.fieldType || 'DROPDOWN',
          iconUrl: editingType.iconUrl || null,
        });
      } else {
        setFormData({
          name: '',
          nameEn: '',
          key: '',
          fieldType: 'DROPDOWN',
          iconUrl: null,
        });
      }
    }
  }, [isOpen, editingType]);

  // Auto-generate key from Arabic name (optional convenience)
  const generateKeyFromName = (arabicName: string): string => {
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

    let key = '';
    for (const char of arabicName) {
      if (arabicToEnglish[char]) {
        key += arabicToEnglish[char];
      } else if (/[a-zA-Z0-9]/.test(char)) {
        key += char.toLowerCase();
      }
    }
    return key.toLowerCase();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      key: editingType ? formData.key : generateKeyFromName(name),
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.key.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        nameEn: formData.nameEn?.trim() || undefined,
        iconUrl: formData.iconUrl || null,
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
        disabled={!formData.name.trim() || !formData.key.trim() || loading}
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
      title={editingType ? 'تعديل نوع المواصفة' : 'اضافة نوع مواصفة جديد'}
      maxWidth="500px"
      footer={footer}
    >
      <div className="flex flex-col gap-4" dir="rtl">
        {/* Name (Arabic) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الاسم (عربي) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="مثال: اللون"
            maxLength={50}
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
          />
          <span className="text-[10px] text-[#8286ab]">
            الحد الأقصى 50 حرف
          </span>
        </div>

        {/* Name (English) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الاسم (انجليزي)
          </label>
          <input
            type="text"
            value={formData.nameEn || ''}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            placeholder="Example: Color"
            maxLength={50}
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
        </div>

        {/* Key (English) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            المفتاح (انجليزي) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
            placeholder="مثال: color"
            maxLength={50}
            disabled={!!editingType}
            className={`h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors ${
              editingType ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' : ''
            }`}
            dir="ltr"
          />
          <span className="text-[10px] text-[#8286ab]">
            {editingType 
              ? 'لا يمكن تعديل المفتاح بعد إنشاء المواصفة لأنه معرّف فريد في قاعدة البيانات.' 
              : 'يُستخدم في النظام ويجب أن يكون باللغة الإنجليزية فقط. يُنصح باستخدام أحرف إنجليزية وأرقام و _ فقط'}
          </span>
        </div>

        {/* Field Type (DROPDOWN, TEXT, NUMBER) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            نوع الحقل <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.fieldType || 'DROPDOWN'}
            onChange={(e) => setFormData({ ...formData, fieldType: e.target.value as any })}
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors cursor-pointer"
          >
            <option value="DROPDOWN">قائمة منسدلة (خيارات محددة)</option>
            <option value="TEXT">نص حر (إدخال يدوي)</option>
            <option value="NUMBER">رقم (إدخال يدوي)</option>
          </select>
          <span className="text-[10px] text-[#8286ab]">
            حدد طريقة إدخال هذه المواصفة عند تسجيل أو تعديل بيانات السيارة
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الشعار
          </label>
          <IconUploader
            currentIcon={formData.iconUrl}
            onUpload={(url) => setFormData({ ...formData, iconUrl: url })}
            onRemove={() => setFormData({ ...formData, iconUrl: null })}
            acceptedFormats={['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']}
          />
          <span className="text-[10px] text-[#8286ab]">
            PNG أو WebP مربع بحجم 64–128px مفضّل للتطبيق. SVG مناسب للموقع.
          </span>
        </div>
      </div>
    </Modal>
  );
}