"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadApi } from "@/lib/api/upload";
import type { BannerImageSpec } from "@/lib/banner-specs";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const RATIO_WARN_TOLERANCE = 0.12;

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid-image"));
    };
    img.src = url;
  });
}

type BannerImageUploadProps = {
  spec: BannerImageSpec;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export default function BannerImageUpload({
  spec,
  value,
  onChange,
  disabled = false,
}: BannerImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ratioNote, setRatioNote] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setRatioNote(null);
    onChange("");
  };

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("صيغة الملف غير مدعومة. استخدم PNG أو JPG أو WebP");
      return;
    }

    try {
      const { width, height } = await readImageSize(file);
      if (width < 1 || height < 1) {
        toast.error("تعذر قراءة أبعاد الصورة");
        return;
      }

      const actualRatio = width / height;
      const delta = Math.abs(actualRatio - spec.ratio) / spec.ratio;
      if (delta > RATIO_WARN_TOLERANCE) {
        setRatioNote(
          `أبعاد الملف ${width}×${height} (النسبة ${actualRatio.toFixed(2)}∶1). المستحسن ${spec.width}×${spec.height} (${spec.ratioLabel}). سيتم القص لعرض النسبة الصحيحة.`,
        );
      } else {
        setRatioNote(null);
      }
    } catch {
      toast.error("تعذر قراءة الصورة");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const result = await uploadApi.uploadFile(file, "banner");
      onChange(result.url);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      URL.revokeObjectURL(localPreview);
      setPreview(null);
      const message = error instanceof Error ? error.message : "فشل رفع الصورة";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const displaySrc = preview || value;
  const busy = uploading || disabled;

  return (
    <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-3 shadow-sm">
      <div className="flex flex-col gap-1 text-start">
        <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
          {spec.title}
        </label>
        <p className="text-[12px] text-[#6b7280] leading-relaxed">{spec.hint}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {displaySrc ? (
        <div className="flex flex-col gap-3">
          <div
            className={`relative w-full ${spec.aspectClass} rounded-[12px] overflow-hidden bg-[#f9fafb] border border-[#f2f2f2]`}
          >
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={displaySrc}
              alt={spec.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={busy}
              className="px-4 py-2 text-[12px] font-medium text-[#002ec1] bg-[#e9f0fc] rounded-full hover:bg-[#d4e3f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              استبدال الصورة
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="px-4 py-2 text-[12px] font-medium text-[#ef4444] bg-red-50 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFileDialog}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          disabled={busy}
          className={`
            border-2 border-dashed rounded-[16px] ${spec.aspectClass} min-h-[120px]
            flex flex-col items-center justify-center gap-2 cursor-pointer transition-all w-full
            ${uploading ? "border-[#002ec1] bg-[#e9f0fc]" : "border-[#e5e7eb] hover:border-[#002ec1] hover:bg-gray-50"}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {uploading ? (
            <div className="w-8 h-8 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#002ec1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-[13px] font-medium text-[#002ec1]">رفع الصورة</span>
              <span className="text-[11px] text-[#9ca3af]">
                {spec.width} × {spec.height}px · {spec.ratioLabel}
              </span>
            </>
          )}
        </button>
      )}

      {ratioNote && (
        <p className="text-[11px] text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-[10px] px-3 py-2 text-start leading-relaxed">
          {ratioNote}
        </p>
      )}
    </div>
  );
}
