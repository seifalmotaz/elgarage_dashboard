'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal';
import { CarBrandModel, CreateModelDto } from '../../../../lib/api-client';

interface AddModelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  editingModel?: CarBrandModel | null;
  onSave: (data: CreateModelDto) => Promise<void>;
}

export default function AddModelDialog({ 
  isOpen, 
  onClose, 
  brandId, 
  editingModel, 
  onSave 
}: AddModelDialogProps) {
  const [formData, setFormData] = useState<CreateModelDto>({
    name: '',
    nameEn: '',
  });
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or editingModel changes
  useEffect(() => {
    if (isOpen) {
      if (editingModel) {
        setFormData({
          name: editingModel.name,
          nameEn: editingModel.nameEn || '',
        });
      } else {
        setFormData({
          name: '',
          nameEn: '',
        });
      }
    }
  }, [isOpen, editingModel]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
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
        disabled={!formData.name.trim() || loading}
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
      title={editingModel ? 'تعديل الموديل' : 'اضافة موديل جديد'}
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: كامري"
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
          />
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
            placeholder="Example: Camry"
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
        </div>
      </div>
    </Modal>
  );
}