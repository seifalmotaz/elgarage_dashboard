'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../ui/Modal';
import { CarBrand, CreateBrandDto } from '../../../../lib/api-client';
import { carBrandsApi } from '../../../../lib/api/car-brands.api';

interface AddBrandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingBrand?: CarBrand | null;
  onSave: (data: CreateBrandDto) => Promise<void>;
}

export default function AddBrandDialog({ 
  isOpen, 
  onClose, 
  editingBrand, 
  onSave 
}: AddBrandDialogProps) {
  const [formData, setFormData] = useState<CreateBrandDto & { website?: string }>({
    name: '',
    nameEn: '',
    website: '',
    logo: '',
  });
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes or editingBrand changes
  useEffect(() => {
    if (isOpen) {
      setLogoFile(null);
      if (editingBrand) {
        setFormData({
          name: editingBrand.name,
          nameEn: editingBrand.nameEn || '',
          website: (editingBrand as any).website || '',
          logo: editingBrand.logo || '',
        });
        setLogoPreview(editingBrand.logo || null);
      } else {
        setFormData({
          name: '',
          nameEn: '',
          website: '',
          logo: '',
        });
        setLogoPreview(null);
      }
    }
  }, [isOpen, editingBrand]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/svg+xml', 'image/webp', 'image/png', 'image/jpeg'];
      const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
      if (!allowedTypes.includes(file.type) && !isSvg) {
        alert('الملف غير صالح. يرجى رفع صورة بصيغة SVG, WebP, PNG أو JPEG');
        return;
      }
      // File size limit removed
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const clearLogoFile = () => {
    setLogoFile(null);
    setLogoPreview(editingBrand?.logo || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      let logoUrl = formData.logo;

      // If file selected, upload it first
      if (logoFile) {
        if (editingBrand) {
          // Update existing brand's logo
          const result = await carBrandsApi.uploadLogo(editingBrand.id, logoFile);
          logoUrl = result.logo;
        } else {
          // For new brand, upload and pass URL
          const { uploadApi } = await import('../../../../lib/api/upload');
          const uploadResult = await uploadApi.uploadFile(logoFile, 'brand-logo');
          logoUrl = uploadResult.url;
        }
      }

      await onSave({
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        website: formData.website || undefined,
        logo: logoUrl || undefined,
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
      title={editingBrand ? 'تعديل الماركة' : 'اضافة ماركة جديدة'}
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
            placeholder="مثال: تويوتا"
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
            placeholder="Example: Toyota"
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
        </div>

        {/* Website (for logo auto-fetch) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الموقع الإلكتروني (لجلب الشعار تلقائياً)
          </label>
          <input
            type="text"
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="مثال: toyota.com"
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
          <span className="text-[10px] text-[#8286ab]">
            سيتم جلب الشعار تلقائياً من logo.dev عند إدخال النطاق
          </span>
        </div>

        {/* Logo Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            الشعار (اختياري)
          </label>
          
          {logoPreview && (
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                className="w-16 h-16 object-contain rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={clearLogoFile}
                className="text-[12px] text-red-500 hover:text-red-700"
              >
                إزالة
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/webp,image/png,image/jpeg,.svg"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-[14px] font-medium text-[#002ec1] bg-blue-50 border border-[#002ec1]/20 rounded-full hover:bg-blue-100 transition-colors"
            >
              رفع شعار
            </button>
            {logoFile && (
              <span className="text-[12px] text-[#6b7280]">{logoFile.name}</span>
            )}
          </div>
          <span className="text-[10px] text-[#8286ab]">
            SVG, WebP, PNG أو JPEG
          </span>
        </div>

        {/* Manual Logo URL (fallback) */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
            رابط الشعار الخارجي (اختياري)
          </label>
          <input
            type="text"
            value={formData.logo || ''}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="h-[48px] px-4 bg-white border border-[#f2f2f2] rounded-[12px] text-[14px] text-[#1a1a1a] outline-none focus:border-[#002ec1] focus:ring-1 focus:ring-[#002ec1]/20 transition-colors"
            dir="ltr"
          />
          <span className="text-[10px] text-[#8286ab]">
            استخدم هذا الحقل إذا كان الشعار غير متوفر في logo.dev
          </span>
        </div>
      </div>
    </Modal>
  );
}