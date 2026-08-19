"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ArticleEditor from "@/components/dashboard/editor/ArticleEditor";
import { useCreateArticleMutation } from "@/hooks/mutations/useArticles";
import { uploadApi } from "@/lib/api/upload";
import toast from "react-hot-toast";

export default function CreateArticlePage() {
  const router = useRouter();
  const createMutation = useCreateArticleMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("أخبار");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [image, setImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !content.trim()) {
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category: category,
        status: status,
        image: image.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.push("/dashboard/articles");
        },
      }
    );
  };

  const handleCancel = () => {
    router.back();
  };

  // Handle file selection
  const handleImageSelect = async (file: File) => {
    // Validate file size limit removed
    // if (file.size > 5 * 1024 * 1024) {
    //   toast.error('حجم الملف يتجاوز الحد المسموح (5MB)');
    //   return;
    // }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('صيغة الملف غير مدعومة. استخدم PNG, JPG, أو WebP');
      return;
    }

    setIsUploadingImage(true);

    try {
      // Create local preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Upload to server
      const result = await uploadApi.uploadFile(file, 'car-image');
      setImage(result.url);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      // Clean up preview on error
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);

      const message = error instanceof Error ? error.message : 'فشل رفع الصورة';
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
    e.target.value = ''; // Reset for re-selection
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Remove image
  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImage("");
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[#000a2a]">
          اضافة مقال
        </h1>
        <Link
          href="/dashboard/articles"
          className="flex items-center gap-2 bg-white border border-[#f2f2f2] px-4 py-2 rounded-full text-[#1a1a1a] text-[14px] hover:bg-gray-50 transition-colors"
        >
          <span className="text-start">عودة</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rotate-0"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* RIGHT Column in RTL: Publish Settings (placed FIRST in DOM) */}
          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-[#002ec1] border-b border-[#f2f2f2] pb-3 text-start">
              اعدادت النشر
            </h2>

            <div className="flex flex-col gap-4">
              <Select
                label="التصنيف"
                value={category}
                onChange={setCategory}
                options={[
                  { label: "أخبار", value: "أخبار" },
                  { label: "نصائح", value: "نصائح" },
                ]}
              />
              <Select
                label="الحالة"
                value={status}
                onChange={(val) => setStatus(val as "DRAFT" | "PUBLISHED")}
                options={[
                  { label: "منشور", value: "PUBLISHED" },
                  { label: "مسودة", value: "DRAFT" },
                ]}
              />

              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                  صورة الغلاف
                </label>
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {image || imagePreview ? (
                  // Preview Mode
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full h-[147px] rounded-[16px] overflow-hidden bg-[#f9fafb] border border-[#f2f2f2]">
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <div className="w-8 h-8 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <img
                        src={imagePreview || image}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={openFileDialog}
                        disabled={isUploadingImage}
                        className="px-4 py-2 text-[12px] font-medium text-[#002ec1] bg-[#e9f0fc] rounded-full hover:bg-[#d4e3f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        استبدال الصورة
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                        className="px-4 py-2 text-[12px] font-medium text-[#ef4444] bg-red-50 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ) : (
                  // Upload Mode
                  <div
                    onClick={openFileDialog}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-[16px] h-[147px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                      ${isUploadingImage 
                        ? 'border-[#002ec1] bg-[#e9f0fc] pointer-events-none' 
                        : 'border-[#e5e7eb] hover:border-[#002ec1] hover:bg-gray-50'
                      }
                    `}
                  >
                    {isUploadingImage ? (
                      <div className="w-8 h-8 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <div className="flex flex-col items-center gap-1 text-center">
                          <p className="text-[12px] text-[#4b5563]">
                            اضغط للتحميل أو السحب والإفلات
                          </p>
                          <p className="text-[10px] text-[#9ca3af]">
                            PNG, JPG, WebP
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* URL Input as Alternative */}
                <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="او الصق رابط الصورة..."
                    className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#f2f2f2] mt-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-[2] h-[44px] rounded-full"
                loading={createMutation.isPending}
                disabled={createMutation.isPending}
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                }
                iconPosition="left"
              >
                {createMutation.isPending ? 'جاري الحفظ...' : 'اضافة مقال'}
              </Button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-[#fff5f5] text-[#ef4444] border border-[#ffe4e4] rounded-full h-[44px] text-[14px] font-medium hover:bg-[#ffeaea] transition-colors"
              >
                الغاء
              </button>
            </div>
          </div>

          {/* LEFT Column in RTL: Main Content (placed SECOND in DOM) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Article Title */}
            <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
              <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                عنوان المقال
              </label>
              <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="أدخل عنوان المقال ..."
                  className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
              <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                وصف قصير
              </label>
              <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ادخل وصفا موجزا للمقال.."
                  className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
                />
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
              <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                محتوى المقال
              </label>
              <ArticleEditor
                value={content}
                onChange={setContent}
                placeholder="اكتب محتوى المقال هنا ..."
                minHeight="250px"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
