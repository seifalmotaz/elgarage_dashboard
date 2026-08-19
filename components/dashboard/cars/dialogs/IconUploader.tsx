'use client';

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { uploadApi } from '../../../../lib/api/upload';

interface IconUploaderProps {
  currentIcon?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  maxSize?: number;
  acceptedFormats?: string[];
  className?: string;
}

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const DEFAULT_ACCEPTED_FORMATS = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];

export default function IconUploader({
  currentIcon,
  onUpload,
  onRemove,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  className = '',
}: IconUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayIcon = previewUrl || currentIcon;

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file size (disabled)
    // if (file.size > maxSize) {
    //   const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    //   setError(`حجم الملف يتجاوز الحد المسموح (${maxSizeMB}MB)`);
    //   toast.error(`حجم الملف يتجاوز الحد المسموح (${maxSizeMB}MB)`);
    //   return false;
    // }

    // Check file format
    if (!acceptedFormats.includes(file.type)) {
      const formatNames = acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
      setError(`صيغة الملف غير مدعومة. الصيغ المدعومة: ${formatNames}`);
      toast.error(`صيغة الملف غير مدعومة. الصيغ المدعومة: ${formatNames}`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    let preview: string | null = null;

    try {
      // Create preview URL
      preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload file
      const response = await uploadApi.uploadFile(file, 'icon');
      onUpload(response.url);
      toast.success('تم رفع الأيقونة بنجاح');
    } catch (err) {
      // Clean up preview URL on error
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreviewUrl(null);

      // Log error for debugging
      console.error('[IconUploader] Upload failed:', err);

      // Show user-friendly error message
      let errorMessage = 'فشل رفع الملف. الرجاء المحاولة مرة أخرى';

      if (err instanceof Error) {
        // Check for specific error types
        if (err.message.includes('timed out')) {
          errorMessage = 'انتهت مهلة الرفع. الرجاء المحاولة مرة أخرى';
        } else if (err.message.includes('Network error') || err.message.includes('HTTPS')) {
          errorMessage = 'خطأ في الاتصال. تأكد من اتصالك بالإنترنت';
        } else if (err.message.includes('File too large') || err.message.includes('حجم')) {
          errorMessage = 'حجم الملف يتجاوز الحد المسموح (2MB)';
        } else if (err.message.includes('Invalid file type') || err.message.includes('صيغة')) {
          errorMessage = 'صيغة الملف غير مدعومة. استخدم SVG, PNG, JPG, أو WebP';
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {displayIcon ? (
        <div className="flex flex-col gap-3">
          {/* Icon Preview */}
          <div className="w-[80px] h-[80px] rounded-full bg-[#f9fafb] border border-[#f2f2f2] flex items-center justify-center overflow-hidden">
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
            ) : (
              <img
                src={displayIcon}
                alt="Icon preview"
                className="w-[48px] h-[48px] object-contain"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={isUploading}
              className="px-3 py-1.5 text-[12px] font-medium text-[#002ec1] bg-[#e9f0fc] rounded-full hover:bg-[#d4e3f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              رفع جديد
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="px-3 py-1.5 text-[12px] font-medium text-[#ef4444] bg-red-50 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                حذف
              </button>
            )}
          </div>

          {error && (
            <span className="text-[12px] text-[#ef4444]">{error}</span>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            w-[80px] h-[80px] rounded-[12px] border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-1
            ${isDragging 
              ? 'border-[#002ec1] bg-[#e9f0fc]' 
              : 'border-[#d1d5db] bg-[#f9fafb] hover:border-[#002ec1] hover:bg-[#e9f0fc]'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {/* Upload Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V8M12 8L9 11M12 8L15 11"
                  stroke="#002ec1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 15V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V15"
                  stroke="#002ec1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[10px] text-[#002ec1] font-medium">اضافة ايقونة</span>
              <span className="text-[8px] text-[#8286ab]">SVG, PNG, JPG</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}