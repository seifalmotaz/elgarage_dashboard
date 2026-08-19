"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import CitySelect from "@/components/dashboard/CitySelect";
import toast from "react-hot-toast";

import { useCarForm } from "@/hooks/useCarForm";
import { useCarDetail, useCarSpecs, useCarFeatures, useCarBrands } from "@/hooks/queries/useCars";
import { uploadApi } from "@/lib/api/upload";
import { ImageReorderGrid } from "@/components/dashboard/cars/ImageReorderGrid";

// Dialogs for management
import SpecOptionsDialog from "@/components/dashboard/cars/dialogs/SpecOptionsDialog";
import FeaturesManagerDialog from "@/components/dashboard/cars/dialogs/FeaturesManagerDialog";
import BrandModelDialog from "@/components/dashboard/cars/dialogs/BrandModelDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCarPage({ params }: PageProps) {
  const router = useRouter();
  const [id, setId] = useState<string>("");

  // Unwrap params
  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  // Initialize form hook with carId for edit mode
  const {
    form,
    isSubmitting,
    submit,
    addImage,
    removeImage,
    updateBrandName,
    updateModelName,
    reorderImages,
    populateForm,
    isEditMode,
    carId,
  } = useCarForm(id);

  // Fetch car data
  const { data: carData, isLoading, isError, error } = useCarDetail(id);

  // Dynamic data hooks (same as create page)
  const { data: specTypesData, isLoading: specsLoading, refetch: refetchSpecs } = useCarSpecs();
  const { data: featureSectionsData, isLoading: featuresLoading, refetch: refetchFeatures } = useCarFeatures();
  const { data: brandsData, isLoading: brandsLoading } = useCarBrands();

  // Extract arrays from query data
  const specTypes = specTypesData || [];
  const featureSections = featureSectionsData || [];
  const brands = brandsData || [];

  // Dialog states
  const [specDialogOpen, setSpecDialogOpen] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);

  // Image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Track if form has been populated to prevent reset on data refetch
  const [hasPopulatedForm, setHasPopulatedForm] = useState(false);

  // Get category from spec types (for Car Specs section)
  const categoryType = specTypes.find((s) => s.key === "category");

  // Get car spec types - all specs EXCEPT category
  const carSpecTypes = specTypes.filter((s) => s.key !== "category");

  // Loading state (includes car data loading)
  const isLoadingData = isLoading || specsLoading || featuresLoading || brandsLoading;

  // Get category options (use id instead of value for backend)
  const categoryOptions = categoryType?.options.map((o) => ({
    label: o.label,
    value: o.id,
  })) || [];

  // Brand options
  const brandOptions = brands.map((b) => ({ label: b.name, value: b.id }));

  // Model options based on selected brand
  const selectedBrandId = form.watch("brandId");
  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const modelOptions = selectedBrand?.models.map((m) => ({ label: m.name, value: m.id })) || [];

  // Sync brand name when brand selection changes
  useEffect(() => {
    if (selectedBrandId) {
      const brand = brands.find((b) => b.id === selectedBrandId);
      updateBrandName(brand?.name || '');
    }
  }, [selectedBrandId, brands, updateBrandName]);

  // Sync model name when model selection changes
  useEffect(() => {
    const modelId = form.watch("modelId");
    if (modelId && selectedBrand) {
      const model = selectedBrand.models.find((m) => m.id === modelId);
      updateModelName(model?.name || '');
    }
  }, [form.watch("modelId"), selectedBrand, updateModelName, form]);

  // Populate form when car data loads (only once)
  useEffect(() => {
    // Only populate once, when we have car data and haven't populated yet
    if (carData && id && !hasPopulatedForm) {
      populateForm(carData);
      setHasPopulatedForm(true);
      toast.success('تم تحميل بيانات السيارة');
    }
  }, [carData, id, hasPopulatedForm, populateForm]);

  // Check selected features for count display
  const selectedFeatures = form.watch("featureIds") || [];

  // Get uploaded images
  const uploadedImages = form.watch("images") || [];

  // Loading state
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002ec1]"></div>
      </div>
    );
  }

  // Error state
  if (isError || !carData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" dir="rtl">
        <p className="text-[#8286ab] text-[16px]">حدث خطأ في تحميل البيانات</p>
        {error && <p className="text-red-500 text-[14px]">{error.message}</p>}
        <Button variant="primary" onClick={() => router.push('/dashboard/cars')}>
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20 w-full" dir="rtl">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[14px]">
          <Link href="/dashboard" className="text-[#8286ab] font-light">الرئيسية</Link>
          <div className="opacity-40">
            <img src="/assets/dashboard/cars/car-arrow-left.svg" alt="arrow" width={10} height={10} />
          </div>
          <Link href="/dashboard/cars" className="text-[#8286ab] font-light">السيارات و المعروضات</Link>
          <div className="opacity-40">
            <img src="/assets/dashboard/cars/car-arrow-left.svg" alt="arrow" width={10} height={10} />
          </div>
          <span className="text-[#111] font-semibold">تعديل السيارة</span>
        </div>
        <h1 className="text-[32px] font-bold text-[#111] text-start">تعديل بيانات السيارة</h1>
      </div>

      {/* 1. Media & General Info Section */}
      <div className="bg-white rounded-[16px] p-4 shadow-sm border border-[#f2f2f2] flex flex-col gap-5">
        <div className="border-b border-[#f2f2f2] pb-3 flex items-center justify-between">
          <p className="text-[16px] font-semibold text-[#002ec1] text-start">تعديل بيانات السيارة</p>
          {/* Three-dot button for managing Brand/Model config */}
          <button
            onClick={() => setBrandDialogOpen(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="إدارة الماركات والموديلات"
          >
            <img src="/assets/dashboard/cars/more.svg" alt="more" width={18} height={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-8 items-start">
          {/* Form Column */}
          <div className="flex flex-col gap-5">
            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="الماركة"
                value={form.watch("brandId") || ""}
                options={brandOptions}
                placeholder="اختر"
                onChange={(v) => {
                  form.setValue("brandId", v);
                  form.setValue("modelId", "");
                }}
              />
              <Select
                label="الموديل"
                value={form.watch("modelId") || ""}
                options={modelOptions}
                placeholder="اختر"
                onChange={(v) => form.setValue("modelId", v)}
              />
            </div>

            {/* Year & Mileage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 text-start">
                <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">سنة الصنع</label>
                <input
                  type="number"
                  value={form.watch("year") || new Date().getFullYear()}
                  onChange={(e) => form.setValue("year", parseInt(e.target.value) || new Date().getFullYear())}
                  className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[12px] text-[#1a1a1a] font-light leading-[1.7] outline-none focus:border-[#002ec1] transition-colors w-full"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="flex flex-col gap-2 text-start">
                <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">عدد الكيلومترات</label>
                <input
                  type="number"
                  value={form.watch("mileage") || 0}
                  onChange={(e) => form.setValue("mileage", parseInt(e.target.value) || 0)}
                  className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[12px] text-[#1a1a1a] font-light leading-[1.7] outline-none focus:border-[#002ec1] transition-colors w-full"
                  min={0}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 text-start">
              <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">السعر المطلوب (ج.م)</label>
              <input
                type="text"
                value={form.watch("price") || ""}
                onChange={(e) => form.setValue("price", e.target.value)}
                placeholder="1,200,000"
                className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[12px] text-[#1a1a1a] font-light leading-[1.7] outline-none focus:border-[#002ec1] transition-colors w-full"
              />
            </div>

            <Select
              label="التصنيف"
              value={form.watch(`specifications.${categoryType?.id}`) || ""}
              options={categoryOptions}
              onChange={(v) => {
                if (categoryType?.id) {
                  const current = form.getValues("specifications") || {};
                  form.setValue("specifications", { ...current, [categoryType.id]: v });
                }
              }}
            />

            <CitySelect
              label="المدينة"
              value={form.watch("address") || ""}
              onChange={(city) => form.setValue("address", city)}
              placeholder="اختر المدينة"
            />
          </div>

          {/* Media Column */}
          <div className="flex flex-col gap-3 order-2">
            {/* Images Section */}
            <div className="bg-white rounded-[16px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-[#1a1a1a]">الصور</h3>
                {uploadedImages.length > 0 && (
                  <span className="text-[12px] text-gray-500">
                    {uploadedImages.length} صورة
                  </span>
                )}
              </div>

              {/* Image Grid with Reordering */}
              {uploadedImages.length > 0 && (
                <div className="mb-4">
                  <ImageReorderGrid
                    images={uploadedImages}
                    onReorder={(fromIndex, toIndex) => {
                      reorderImages(fromIndex, toIndex);
                    }}
                    onRemove={(index) => {
                      removeImage(index);
                    }}
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      setIsUploadingImage(true);
                      try {
                        const results = await uploadApi.uploadMultiple(
                          Array.from(files),
                          'car-image'
                        );
                        results.forEach((result) => {
                          addImage(result.url);
                        });
                        toast.success(`تم رفع ${results.length} صورة بنجاح`);
                      } catch (error) {
                        const message = error instanceof Error ? error.message : 'فشل في رفع الصور';
                        toast.error(message);
                      } finally {
                        setIsUploadingImage(false);
                        e.target.value = '';
                      }
                    }}
                    disabled={isUploadingImage}
                  />
                  <div className={`bg-[#f9fafb] border-2 border-dashed border-[#d1d5db] rounded-[12px] p-4 text-center cursor-pointer hover:border-[#002ec1] hover:bg-[#e9f0fc] transition-all ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[12px] text-gray-600">جاري الرفع...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
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
                        <span className="text-[14px] text-[#002ec1] font-medium">إضافة صور</span>
                        <span className="text-[11px] text-gray-500">PNG, JPG, WEBP</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Car Specs Section */}
      <div className="bg-white rounded-[16px] p-4 shadow-sm border border-[#f2f2f2] flex flex-col gap-5">
        <div className="border-b border-[#f2f2f2] pb-3 flex items-center justify-between">
          <p className="text-[16px] font-semibold text-[#002ec1] text-start">مواصفات السيارة</p>
          <button
            onClick={() => setSpecDialogOpen(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="إدارة المواصفات"
          >
            <img src="/assets/dashboard/cars/more.svg" alt="more" width={18} height={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
           {/* Dynamic Specs from API - EXCLUDING status and category which are in Media & General Info */}
           {carSpecTypes.length > 0 ? (
             carSpecTypes.map((specType) => {
               if (specType.fieldType === "TEXT" || specType.fieldType === "NUMBER") {
                 return (
                   <div key={specType.id} className="flex flex-col gap-2 text-start">
                     <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">{specType.name}</label>
                     <input
                       type={specType.fieldType === "NUMBER" ? "number" : "text"}
                       value={form.watch("specifications")?.[specType.id] || ""}
                       onChange={(e) => {
                         const val = e.target.value;
                         const current = form.getValues("specifications") || {};
                         form.setValue("specifications", { ...current, [specType.id]: val });
                       }}
                       className="bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 text-[12px] text-[#1a1a1a] font-light leading-[1.7] outline-none focus:border-[#002ec1] transition-colors w-full"
                       placeholder={`أدخل ${specType.name}`}
                     />
                   </div>
                 );
               }
               return (
                 <Select
                   key={specType.id}
                   label={specType.name}
                   value={form.watch("specifications")?.[specType.id] || ""}
                   options={specType.options.map((o) => ({ label: o.label, value: o.id }))}
                   onChange={(v) => {
                     const current = form.getValues("specifications") || {};
                     form.setValue("specifications", { ...current, [specType.id]: v });
                   }}
                 />
               );
             })
           ) : (
             <div className="col-span-3 text-center text-[14px] text-[#9ca3af] py-8">لم يتم إضافة مواصفات بعد. اضغط على الزر أعلاه للإدارة.</div>
           )}
        </div>
      </div>

      {/* 3. Features Section */}
      <div className="bg-white rounded-[16px] p-4 shadow-sm border border-[#f2f2f2] flex flex-col gap-5">
        <div className="border-b border-[#f2f2f2] pb-3 text-start flex items-center justify-between">
          <p className="text-[16px] font-semibold text-[#002ec1]">المميزات</p>
          <button
            onClick={() => setFeatureDialogOpen(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="إدارة المميزات"
          >
            <img src="/assets/dashboard/cars/more.svg" alt="more" width={18} height={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featureSections.length > 0 ? (
            featureSections.map((section) => {
              const checkedCount = section.items.filter((item) =>
                selectedFeatures.includes(item.id)
              ).length;

              return (
                <div key={section.id} className="bg-white border border-[#f2f2f2] rounded-[16px] p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[14px] text-[#1a1a1a] font-normal">{section.name}</span>
                    <span className="text-[12px] text-[#6b7280] font-light leading-[1.5]">{checkedCount}/{section.items.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {section.items.map((item) => {
                      const isChecked = selectedFeatures.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            const current = form.getValues("featureIds") || [];
                            if (isChecked) {
                              form.setValue("featureIds", current.filter((id) => id !== item.id));
                            } else {
                              form.setValue("featureIds", [...current, item.id]);
                            }
                          }}
                          className={`flex items-center justify-between p-3 px-4 rounded-[4px] h-[56px] cursor-pointer transition-all ${isChecked ? 'bg-[#f9fafb]' : 'bg-[#f9fafb]/50 opacity-60'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                              {item.iconUrl ? (
                                <img src={item.iconUrl || ''} alt={item.name} className="absolute inset-0 w-full h-full object-contain opacity-60" />
                              ) : (
                                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                              )}
                            </div>
                            <span className={`text-[12px] font-normal text-right ${isChecked ? 'text-[#4b5563]' : 'text-[#9ca3af]'}`}>{item.name}</span>
                          </div>
                          <div className={`w-6 h-6 rounded-[6px] border flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-[#002ec1] border-[#002ec1]' : 'bg-white border-[#d1d5db]'}`}>
                            {isChecked && <img src="/assets/dashboard/cars/stats-tick.svg" alt="check" width={12} height={12} className="brightness-0 invert" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-[14px] text-[#9ca3af] py-8">لم يتم إضافة مميزات بعد. اضغط على الزر أعلاه للإدارة.</div>
          )}
        </div>
      </div>

      {/* 4. Description Section */}
      <div className="bg-white rounded-[16px] p-4 shadow-sm border border-[#f2f2f2] flex flex-col gap-5 text-start">
        <div className="border-b border-[#f2f2f2] pb-3">
          <p className="text-[16px] font-semibold text-[#002ec1]">الوصف</p>
        </div>

        <div className="bg-white border border-[#f2f2f2] rounded-[16px] flex flex-col min-h-[240px] overflow-hidden">
          {/* Toolbar */}
          <div className="bg-[#f9fafb] border-b border-[#f2f2f2] p-3 px-6 flex items-center justify-end gap-8">
            <div className="flex items-center gap-6">
              <div className="w-5 h-5 flex items-center justify-center opacity-40 hover:opacity-100 cursor-pointer">
                <img src="/assets/dashboard/cars/more.svg" alt="more" width={18} height={18} />
              </div>
            </div>
            <div className="flex items-center gap-6 border-r border-[#e5e7eb] pr-8">
              <div className="w-5 h-5 flex items-center justify-center opacity-40 hover:opacity-100 cursor-pointer">
                <img src="/assets/dashboard/cars/view-grid.svg" alt="grid" width={18} height={18} />
              </div>
              <div className="w-5 h-5 flex items-center justify-center opacity-40 hover:opacity-100 cursor-pointer">
                <img src="/assets/dashboard/cars/view-list.svg" alt="list" width={18} height={18} />
              </div>
            </div>
            <div className="flex items-center gap-6 border-r border-[#e5e7eb] pr-8">
              <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer underline underline-offset-4">
                <span className="text-[12px] font-semibold">U</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer italic">
                <span className="text-[12px] font-semibold">I</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer">
                <span className="text-[12px] font-semibold">B</span>
              </div>
            </div>
          </div>
          {/* Editor Area */}
          <textarea
            className="w-full flex-1 p-6 text-right text-[14px] text-[#1a1a1a] font-normal leading-[1.9] outline-none border-none resize-none bg-transparent min-h-[160px]"
            value={form.watch("description") || ""}
            onChange={(e) => form.setValue("description", e.target.value)}
            placeholder="سيارة للبيع - بحالة ممتازة وجاهزة للاستخدام الفوري."
          />
        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="flex items-center gap-4 justify-start">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-[180px] h-[48px] rounded-[16px]"
          onClick={async () => {
            console.log('[EditPage] Submit button clicked');
            try {
              await submit();
              // Navigation is handled by the mutation hook on success
              router.push('/dashboard/cars');
            } catch (error) {
              // Error already handled by toast in hook
              console.error('[EditPage] Submit error:', error);
            }
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري التحديث...' : 'تحديث'}
        </Button>
        <Link href="/dashboard/cars">
          <button className="w-[120px] h-[48px] bg-[#fff1f0] text-[#ef4444] rounded-[16px] font-medium hover:bg-red-100 transition-all">الغاء</button>
        </Link>
      </div>

      {/* Management Dialogs */}
      <SpecOptionsDialog
        isOpen={specDialogOpen}
        onClose={() => setSpecDialogOpen(false)}
        onSpecTypesChange={refetchSpecs}
      />

      <FeaturesManagerDialog
        isOpen={featureDialogOpen}
        onClose={() => setFeatureDialogOpen(false)}
        onFeaturesChange={refetchFeatures}
      />

      <BrandModelDialog
        isOpen={brandDialogOpen}
        onClose={() => setBrandDialogOpen(false)}
      />
    </div>
  );
}