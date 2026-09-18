'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import { FeatureItem, CreateFeatureItemDto } from '../../../../lib/api-client';
import IconUploader from './IconUploader';

interface AddFeatureItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionName: string;
  editingItem?: FeatureItem | null;
  onSave: (data: CreateFeatureItemDto) => Promise<void>;
}

export default function AddFeatureItemDialog({
  isOpen,
  onClose,
  sectionId,
  sectionName,
  editingItem,
  onSave,
}: AddFeatureItemDialogProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens/closes or editingItem changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setName(editingItem.name);
        setNameEn(editingItem.nameEn || '');
        setIconUrl(editingItem.iconUrl);
      } else {
        setName('');
        setNameEn('');
        setIconUrl(null);
      }
    }
  }, [isOpen, editingItem]);

  const handleIconUpload = (url: string) => {
    setIconUrl(url);
  };

  const handleIconRemove = () => {
    setIconUrl(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        nameEn: nameEn.trim() || undefined,
        iconUrl: iconUrl || '',
      });
      onClose();
    } finally {
      setIsSaving(false);
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
        disabled={!name.trim() || isSaving}
        className="px-6 py-2 text-[14px] font-medium text-white bg-[#002ec1] rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'تعديل الميزة' : `اضافة ميزة لـ "${sectionName}"`}
      maxWidth="500px"
      footer={footer}
    >
      <div className="flex flex-col gap-4" dir="rtl">
        {/* Icon Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الايقونة
          </label>
          <IconUploader
            currentIcon={editingItem?.iconUrl}
            onUpload={handleIconUpload}
            onRemove={handleIconRemove}
            maxSize={2 * 1024 * 1024}
            acceptedFormats={['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']}
          />
          <span className="text-[10px] text-[#8286ab]">
            صيغ مدعومة: SVG, PNG, JPG, WebP
          </span>
        </div>

        {/* Name (Arabic) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            اسم الميزة (عربي) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: شاشة عرض"
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
            اسم الميزة (انجليزي)
          </label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Example: Display screen"
            maxLength={50}
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
        </div>
      </div>
    </Modal>
  );
}