"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/ui/Modal";
import { useCarWithInspection } from "@/hooks/queries/useCarWithInspection";
import { useDeleteCarMutation } from "@/hooks/mutations/useCars";
import { useRemove360ViewMutation } from "@/hooks/mutations/useCar360Mutations";
import { use360UploadProgress } from "@/hooks/use360UploadProgress";
import { transformInspectionReport } from "@/lib/utils/inspection-transformers";
import { formatPrice } from "@/lib/utils/car-transformers";
import SpecsStripEditor from "@/components/dashboard/cars/SpecsStripEditor";
import { DownloadInspectionPdfButton } from "@/components/dashboard/inspection/DownloadInspectionPdfButton";
import { SEMANTIC_COLORS } from "@/lib/api/types";
import toast from "react-hot-toast";

const TABS = ["مواصفات السيارة", "المميزات", "الوصف"];

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;
  const { car, inspectionReport, listingRequest, isLoading, isError, error, refetch } = useCarWithInspection(carId);
  const transformedReport = transformInspectionReport(inspectionReport);
  const [activeTab, setActiveTab] = useState(1);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [specsEditorOpen, setSpecsEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [remove360DialogOpen, setRemove360DialogOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const deleteCarMutation = useDeleteCarMutation();
  const remove360Mutation = useRemove360ViewMutation(carId);
  const { phase, progress, totalFrames, isUploading, uploadFile, cancelUpload, reset, error: uploadError } = use360UploadProgress(carId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleDeleteCar = async () => {
    if (!car) return;

    try {
      await deleteCarMutation.mutateAsync(car.id);
      toast.success('تم حذف السيارة بنجاح');
      setDeleteDialogOpen(false);
      router.push('/dashboard/cars');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل حذف السيارة';
      toast.error(message);
    }
  };

  const handleUpload360 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await uploadFile(file);
        toast.success(`تم رفع عرض 360 درجة (${result.totalFrames} إطار)`);
        refetch();
      } catch (err) {
        // Error already handled by hook with toast
      }
    }
    e.target.value = '';
  };

  const handleRemove360 = async () => {
    setRemove360DialogOpen(false);
    remove360Mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002ec1]"></div>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-[#8286ab] text-[16px]">حدث خطأ في تحميل البيانات</p>
        {error && <p className="text-red-500 text-[14px]">{error.message}</p>}
        <Button variant="primary" onClick={() => refetch()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const carTitle = `${car.brand} ${car.model}`;

  const featuresBySection: Record<string, typeof car.features> = {};
  car.features.forEach(feature => {
    // Use sectionId since FeatureItem doesn't include full section object
    // We'll display features without section grouping for now
    const sectionName = 'المميزات';
    if (!featuresBySection[sectionName]) {
      featuresBySection[sectionName] = [];
    }
    featuresBySection[sectionName].push(feature);
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getWhatsAppLink = (phone: string) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return null;
    let formatted = cleaned;
    if (formatted.startsWith('00')) {
      formatted = formatted.slice(2);
    }
    if (formatted.startsWith('0')) {
      formatted = '20' + formatted.slice(1);
    } else if (formatted.startsWith('1') && formatted.length === 10) {
      formatted = '20' + formatted;
    }
    return `https://wa.me/${formatted}`;
  };

  const getInspectionStatus = () => {
    if (!inspectionReport) return null;
    if (inspectionReport.status === 'COMPLETED') {
      return { label: 'تم الفحص', hasCheck: true };
    }
    return { label: 'جاري الفحص', hasCheck: false };
  };

  const getReliabilityStatus = () => {
    if (!transformedReport) return { label: 'غير محدد', hasCheck: false };

    const hasIssues = transformedReport.sections.some(s => s.badCount > 0 || s.warnCount > 0);

    if (hasIssues) {
      return { label: 'يحتاج مراجعة', hasCheck: false };
    }

    return { label: 'موثوق', hasCheck: true };
  };

  const inspectionStatus = getInspectionStatus();
  const reliabilityStatus = getReliabilityStatus();

  return (
    <div className="flex flex-col gap-8 pb-20 w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[32px] font-bold text-[#111]">تفاصيل السيارة</h1>
        <Button
          variant="primary"
          size="md"
          className="rounded-full"
          onClick={() => router.push(`/dashboard/cars/${carId}/edit`)}
          icon={
            <img
              src="/assets/dashboard/cars/edit.svg"
              alt=""
              width={18}
              height={18}
              className="brightness-0 invert"
            />
          }
          iconPosition="right"
        >
          تعديل
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_382px] gap-8 items-start w-full min-w-0">
        <div className="flex flex-col gap-8 order-2 lg:order-1 flex-1 min-w-0 w-full">
          <div className="bg-white rounded-[24px] p-4 lg:p-5 shadow-sm border border-[#f2f2f2] flex flex-col gap-5 min-w-0 w-full">
            {/* Fixed 730/452 frame (Figma/website); avoids ultrawide crop from fixed heights */}
            <div className="relative w-full aspect-[730/452] max-h-[452px] rounded-[16px] overflow-hidden bg-[#f8f8f8] isolate min-w-0">
              {car.images.length > 0 ? (
                <img
                  src={car.images[Math.min(activeImageIdx, car.images.length - 1)] || ""}
                  alt={carTitle}
                  decoding="async"
                  className="absolute inset-0 block h-full w-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#8286ab]">
                  لا توجد صور
                </div>
              )}

              {car.videoUrl && (
                <div className="absolute bottom-4 end-4 z-10 bg-[#e9f0fc] px-6 py-2.5 rounded-full flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition-colors">
                  <span className="text-[#002ec1] font-medium text-[16px]">تشغيل</span>
                  <div className="w-7 h-7 bg-[#002ec1] rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ms-0.5" />
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 start-4 z-10 backdrop-blur-md bg-black/15 px-5 py-2.5 rounded-full flex items-center gap-2 text-white">
                <span className="text-[16px] font-medium">{car.images.length}</span>
                <img
                  src="/assets/dashboard/marketing.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="brightness-0 invert"
                />
              </div>
            </div>

            {car.images.length > 0 && (
              <div className="bg-white border border-[#f2f2f2] rounded-2xl p-3 flex gap-2 overflow-x-auto no-scrollbar min-w-0 w-full">
                {car.images.map((image, i) => {
                  const isActive = i === activeImageIdx;
                  return (
                    <button
                      key={`${image}-${i}`}
                      type="button"
                      onClick={() => setActiveImageIdx(i)}
                      aria-label={`صورة ${i + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative w-[89px] h-[73px] rounded-xl overflow-hidden bg-[#f8f8f8] shrink-0 border-2 transition-all ${
                        isActive
                          ? "border-[#002ec1] shadow-sm scale-[0.97]"
                          : "border-transparent hover:border-[#d4e3f9]"
                      }`}
                    >
                      <img
                        src={image || ""}
                        alt=""
                        width={89}
                        height={73}
                        decoding="async"
                        className="absolute inset-0 block h-full w-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[24px] p-4 lg:p-6 shadow-sm border border-[#f2f2f2] flex flex-col gap-4 w-full min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-[20px] font-semibold text-[#1a1a1a] leading-[1.5]">
                  {carTitle}
                </h2>
              </div>
               <div className="flex flex-col items-start gap-1">
                 <div className="flex items-center gap-1">
                   <span className="text-[#002ec1] text-[24px] font-bold">
                     {formatPrice(car.price)}
                   </span>
                   <span className="text-[#4b84e7] text-[16px] leading-[1.5]">ج.م</span>
                 </div>
               </div>
            </div>

            <div className="flex items-start justify-between gap-3 px-1 py-4 border-y border-gray-50">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
                {(car.highlightStrip ?? []).map((chip) => (
                  <StripItem
                    key={`${chip.source}-${chip.key}`}
                    icon={chip.iconUrl || stripFallbackIcon(chip.key)}
                    label={chip.label}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSpecsEditorOpen(true)}
                className="shrink-0 h-9 px-3 rounded-full border border-[#e9f0fc] bg-[#e9f0fc] text-[#002ec1] text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#d4e3f9] transition-colors"
              >
                <img
                  src="/assets/dashboard/cars/edit.svg"
                  alt=""
                  width={14}
                  height={14}
                />
                تعديل شريط المواصفات
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-8 min-h-[400px] w-full min-w-0">
            <div className="flex items-center gap-12 border-b border-gray-100">
              {TABS.map((tab, idx) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(idx)}
                  className={`pb-4 text-[16px] font-medium transition-all relative ${activeTab === idx ? "text-[#002ec1]" : "text-[#8286ab] hover:text-[#111]"}`}
                >
                  {tab}
                  {activeTab === idx && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#002ec1] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-10">
              {activeTab === 0 && (
                <div className="flex flex-col gap-4">
                  {car.specifications.length > 0 ? (
                    car.specifications.map((spec) => (
                      <div key={spec.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-[14px] text-[#4b5563]">{spec.specKey?.name || 'غير محدد'}</span>
                        <span className="text-[14px] text-[#1a1a1a] font-medium">{spec.option?.label || spec.value || 'غير محدد'}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#8286ab] text-[14px]">لا توجد مواصفات</p>
                  )}
                </div>
              )}

              {activeTab === 1 && (
                <div className="flex flex-col gap-10">
                  {Object.keys(featuresBySection).length > 0 ? (
                    Object.entries(featuresBySection).map(([sectionName, features]) => (
                      <div key={sectionName} className="flex flex-col gap-4 w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[14px] text-[#002ec1] font-medium text-start">
                            {sectionName}
                          </span>
                          <span className="text-[14px] text-[#6b7280] font-light">
                            {features.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap justify-start gap-3">
                          {features.map((feature) => (
                            <div
                              key={feature.id}
                              className="bg-[#f9fafb] rounded-[4px] w-[89px] h-[78px] flex flex-col items-center justify-center gap-1 p-2 group hover:border-blue-100 transition-colors border border-transparent"
                            >
                              <span className="text-[12px] text-center leading-[1.5] text-[#4b5563]">
                                {feature.feature?.name || 'غير محدد'}
                              </span>
                              <div className="relative w-8 h-8 flex items-center justify-center">
                                {feature.feature?.iconUrl ? (
                                  <img
                                    src={feature.feature.iconUrl || ''}
                                    alt={feature.feature.name}
                                    className="absolute inset-0 w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-[#e5e7eb] rounded-full" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#8286ab] text-[14px]">لا توجد مميزات</p>
                  )}
                </div>
              )}

              {activeTab === 2 && (
                <div className="text-[14px] text-[#4b5563] leading-[1.8] text-right">
                  {car.description || 'لا يوجد وصف'}
                </div>
              )}
            </div>
          </div>

          {car.listingRequestId && (
            <div className="bg-[#00165b] rounded-[24px] p-4 flex items-center justify-between px-8 w-full min-w-0">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/dashboard/cars/garage-logo-mini.svg"
                  alt="Garage"
                  width={24}
                  height={24}
                />
                <span className="text-white font-medium text-[16px]">معتمدة من جراج</span>
              </div>
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <span className="text-[14px]">معلومات عن الفحص</span>
                <img
                  src="/assets/dashboard/cars/car-arrow-left.svg"
                  alt="Info"
                  width={18}
                  height={18}
                  className="rotate-45"
                />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 order-1 lg:order-2 w-full lg:w-[382px] min-w-0 shrink-0">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
            <h3 className="text-[18px] font-bold text-[#111] text-start">إجراءات الإدارة و المراجعة</h3>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-[52px] rounded-full border-blue-600 text-blue-600 font-bold"
                onClick={() => window.location.href = `/dashboard/cars/${carId}/edit`}
              >
                تعديل بيانات السيارة
              </Button>
              {car.listingRequestId ? (
                // Imported car - has inspection via listing request
                inspectionReport ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-[52px] rounded-full border-[#002ec1] text-[#002ec1] font-bold hover:bg-blue-50"
                    onClick={() => window.location.href = `/dashboard/cars/${carId}/inspection/edit?reportId=${inspectionReport.id}`}
                  >
                    تعديل تقرير الفحص
                  </Button>
                ) : null
              ) : (
                // Manual car - create or edit inspection
                inspectionReport ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-[52px] rounded-full border-[#002ec1] text-[#002ec1] font-bold hover:bg-blue-50"
                    onClick={() => window.location.href = `/dashboard/cars/${carId}/inspection/edit?reportId=${inspectionReport.id}`}
                  >
                    تعديل تقرير الفحص
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-[52px] rounded-full border-[#002ec1] text-[#002ec1] font-bold hover:bg-blue-50"
                    onClick={() => window.location.href = `/dashboard/cars/${carId}/inspection/new`}
                  >
                    إنشاء تقرير فحص
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="lg"
                className="w-full h-[52px] rounded-full border-red-500 text-red-500 font-bold hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                إزالة من المعروضات
              </Button>
            </div>
          </div>

          {/* 360° View Management */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
            <h3 className="text-[18px] font-bold text-[#111] text-start">عرض 360 درجة</h3>

            {car.viewer360Path && phase === 'idle' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M1.03906 10.0007C1.03906 14.9482 5.04984 18.959 9.9974 18.959C14.9449 18.959 18.9557 14.9482 18.9557 10.0007C18.9557 5.0531 14.9449 1.04232 9.9974 1.04232C5.04984 1.04232 1.03906 5.0531 1.03906 10.0007Z" fill="#DCFCE7"/>
                    <path d="M14.0594 6.68365C14.2802 7.08745 14.1319 7.59381 13.7281 7.81463C12.5853 8.4396 11.5121 9.74794 10.6927 11.0027C10.2932 11.6144 9.9727 12.1839 9.75229 12.6003C9.64229 12.8081 9.55778 12.9767 9.50136 13.0921L9.4195 13.2633C9.29075 13.5447 9.01654 13.7318 8.70753 13.7489C8.39843 13.7659 8.10535 13.6103 7.94644 13.3446C7.68751 12.9117 7.27606 12.5165 6.89477 12.2151C6.70949 12.0686 6.54273 11.9531 6.42372 11.8751L6.24847 11.7655C5.8489 11.5375 5.70977 11.0287 5.93772 10.629C6.16573 10.2292 6.67466 10.0899 7.07445 10.3179L7.33699 10.481C7.48881 10.5804 7.69704 10.7247 7.92844 10.9077C8.10527 11.0475 8.303 11.2156 8.50262 11.4093C8.71665 11.0248 8.9841 10.5708 9.29721 10.0914C10.1444 8.79404 11.4045 7.18572 12.9284 6.35235C13.3322 6.13152 13.8386 6.27985 14.0594 6.68365Z" fill="#22C55E"/>
                  </svg>
                  <span className="text-[14px] font-medium">تم الرفع</span>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-[52px] rounded-full border-blue-600 text-blue-600 font-bold"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={false}
                >
                  استبدال الملف
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleUpload360}
                  disabled={false}
                />

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-[52px] rounded-full border-red-500 text-red-500 font-bold hover:bg-red-50"
                  onClick={() => setRemove360DialogOpen(true)}
                  disabled={remove360Mutation.isPending}
                >
                  حذف عرض 360
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {phase === 'idle' && !car.viewer360Path && (
                  <>
                    <p className="text-[14px] text-[#8286ab] leading-relaxed">
                      لا يوجد عرض 360 درجة锅里.قم برفع ملف ZIP يحتوي على مجلد frames بداخله صور الإطارات.
                    </p>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full h-[52px] rounded-full font-bold"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={false}
                    >
                      رفع عرض 360
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={handleUpload360}
                      disabled={false}
                    />
                  </>
                )}

                {phase === 'error' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600">{uploadError || 'حدث خطأ'}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-[52px] rounded-full border-blue-600 text-blue-600 font-bold"
                      onClick={() => {
                        reset();
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                        setTimeout(() => fileInputRef.current?.click(), 0);
                      }}
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {phase !== 'idle' && phase !== 'error' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b7280]">
                          {phase === 'uploading' && 'جاري رفع الملف...'}
                          {phase === 'extracting' && 'جاري استخراج الإطارات...'}
                          {phase === 'complete' && 'تم الرفع بنجاح'}
                        </span>
                        <span className="font-medium text-[#002ec1]">
                          {phase === 'complete' ? `${totalFrames} إطار` : `${progress}%`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#002ec1] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {phase === 'uploading' && (
                        <button
                          onClick={cancelUpload}
                          className="text-red-500 text-sm hover:underline mr-auto"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {listingRequest && (
            <div className="bg-white rounded-[16px] p-4 shadow-sm border border-[#f2f2f2] flex flex-col gap-4">
              <p className="text-[16px] font-semibold text-[#262626] text-start w-full">من سيشتري منه العميل ؟</p>
              <div className="flex items-center justify-start gap-3">
                <div className="w-[52px] h-[52px] bg-[#ebf1ff] rounded-full flex items-center justify-center border border-white shadow-sm overflow-hidden shrink-0">
                  <img
                    src="/assets/dashboard/users.svg"
                    alt="Seller"
                    width={32}
                    height={32}
                    className="opacity-40"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[14px] font-normal text-[#242424] text-start">
                    {listingRequest.user.firstName} {listingRequest.user.lastName}
                  </span>
                  <span className="text-[12px] text-[#8286ab] font-light leading-[1.7] text-start">بائع فردي</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  className="bg-[#dcfce7] border border-[#bbf7d0] h-[48px] rounded-[16px] flex items-center justify-center gap-2 text-[#24b45f] font-medium transition-colors hover:bg-green-100"
                  onClick={() => {
                    const link = getWhatsAppLink(listingRequest.user.phone);
                    if (link) window.open(link, '_blank');
                  }}
                >
                  <img
                    src="/assets/dashboard/cars/whatsapp.svg"
                    alt="WhatsApp"
                    width={18}
                    height={18}
                  />
                  <span className="text-[14px]">واتساب</span>
                </button>
                <button
                  className="bg-[#e9f0fc] border border-[#d2e0f9] h-[48px] rounded-[16px] flex items-center justify-center gap-2 text-[#002ec1] font-medium transition-colors hover:bg-blue-100"
                  onClick={() => window.location.href = `tel:${listingRequest.user.phone}`}
                >
                  <img
                    src="/assets/dashboard/cars/call.svg"
                    alt="Call"
                    width={18}
                    height={18}
                  />
                  <span className="text-[14px]">مكالمة</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-[#f2f2f2] flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[16px] font-semibold text-[#002ec1]">الاعتمادية</h3>
              <div className="w-[32px] h-[20px] bg-[#002ec1] rounded-full p-[2px] cursor-pointer relative">
                <div className="w-[16px] h-[16px] bg-white rounded-full shadow-sm ml-auto" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-[#f9fafb] p-3 px-4 rounded-[8px] flex items-center justify-between border border-[#f2f2f2]">
                <span className="text-[12px] text-[#4b5563] font-normal leading-[1.5]">تقييم الفحص الميكانيكي</span>
                <div className="flex items-center gap-1 text-[#1a1a1a]">
                  {inspectionStatus?.hasCheck && (
                    <img
                      src="/assets/dashboard/cars/stats-tick.svg"
                      alt="Check"
                      width={14}
                      height={14}
                      className="opacity-60"
                    />
                  )}
                  <span className="text-[10px] font-normal leading-[1.5]">{inspectionStatus?.label || 'غير محدد'}</span>
                </div>
              </div>
              <div className="bg-[#f9fafb] p-3 px-4 rounded-[8px] flex items-center justify-between border border-[#f2f2f2]">
                <span className="text-[12px] text-[#4b5563] font-normal leading-[1.5]">جهة البيع</span>
                <span className="text-[10px] text-[#1a1a1a] font-normal leading-[1.5]">فرد خاص</span>
              </div>
              <div className="bg-[#f9fafb] p-3 px-4 rounded-[8px] flex items-center justify-between border border-[#f2f2f2]">
                <span className="text-[12px] text-[#4b5563] font-normal leading-[1.5]">مستوى الموثوقية</span>
                <div className="flex items-center gap-1 text-[#1a1a1a]">
                  {reliabilityStatus.hasCheck && (
                    <img
                      src="/assets/dashboard/cars/stats-tick.svg"
                      alt="Check"
                      width={14}
                      height={14}
                      className="opacity-60"
                    />
                  )}
                  <span className="text-[10px] font-normal leading-[1.5]">{reliabilityStatus.label}</span>
                </div>
              </div>
            </div>
          </div>

          {transformedReport && (
            <div className="bg-white rounded-[16px] border border-[#f2f2f2] flex flex-col gap-3 pb-3 overflow-hidden shadow-sm">
              <div className="bg-[#e9f0fc] p-3 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/dashboard/cars/verify.svg"
                    alt="Verify"
                    width={20}
                    height={20}
                  />
                  <h3 className="text-[16px] font-bold text-[#1a1a1a]">تقرير الفحص</h3>
                  <span className="text-[12px] text-[#374151] font-normal mt-0.5">
                    ({formatDate(transformedReport.completedAt)})
                  </span>
                </div>
                {inspectionReport?.id && (
                  <Link
                    href={`/dashboard/cars/${carId}/inspection/edit?reportId=${inspectionReport.id}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-[200px] bg-white border border-[#002ec1]/20 text-[#002ec1] hover:bg-[#002ec1] hover:text-white text-[12px] font-semibold transition-all shadow-xs"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>تعديل التقرير</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-9 justify-center py-2 border-b border-gray-50 mx-2">
                <div className="flex items-center gap-2 text-[#22c55e]">
                  <div className="w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25C6.06294 1.25 1.25 6.06294 1.25 12Z" fill="#DCFCE7" />
                      <path d="M16.8775 8.02038C17.1425 8.50493 16.9645 9.11257 16.48 9.37756C15.1086 10.1275 13.8208 11.6975 12.8374 13.2032C12.3581 13.9372 11.9735 14.6207 11.709 15.1204C11.577 15.3697 11.4756 15.5721 11.4079 15.7105L11.3096 15.9159C11.1551 16.2536 10.8261 16.4782 10.4553 16.4987C10.0844 16.5191 9.73267 16.3323 9.54198 16.0135C9.23126 15.494 8.73753 15.0198 8.27997 14.6581C8.05764 14.4823 7.85752 14.3437 7.71471 14.2502L7.50442 14.1187C7.02493 13.8449 6.85797 13.2344 7.13152 12.7548C7.40513 12.275 8.01585 12.1079 8.49559 12.3815L8.81063 12.5772C8.99282 12.6965 9.2427 12.8697 9.52038 13.0892C9.73258 13.257 9.96985 13.4587 10.2094 13.6911C10.4662 13.2297 10.7872 12.685 11.1629 12.1096C12.1796 10.5529 13.6917 8.62286 15.5204 7.62282C16.0049 7.35782 16.6126 7.53582 16.8775 8.02038Z" fill="#22C55E" />
                    </svg>

                  </div>
                  <span className="text-[14px] font-light leading-[1.9]">فحص ناجح</span>
                </div>
                <div className="flex items-center gap-2 text-[#f97316]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#FFEDD5" />
                    <path d="M12 13.75C12.41 13.75 12.75 13.41 12.75 13V8C12.75 7.59 12.41 7.25 12 7.25C11.59 7.25 11.25 7.59 11.25 8V13C11.25 13.41 11.59 13.75 12 13.75Z" fill="#F97316" />
                    <path d="M12.92 15.6199C12.87 15.4999 12.8 15.3899 12.71 15.2899C12.61 15.1999 12.5 15.1299 12.38 15.0799C12.14 14.9799 11.86 14.9799 11.62 15.0799C11.5 15.1299 11.39 15.1999 11.29 15.2899C11.2 15.3899 11.13 15.4999 11.08 15.6199C11.03 15.7399 11 15.8699 11 15.9999C11 16.1299 11.03 16.2599 11.08 16.3799C11.13 16.5099 11.2 16.6099 11.29 16.7099C11.39 16.7999 11.5 16.8699 11.62 16.9199C11.74 16.9699 11.87 16.9999 12 16.9999C12.13 16.9999 12.26 16.9699 12.38 16.9199C12.5 16.8699 12.61 16.7999 12.71 16.7099C12.8 16.6099 12.87 16.5099 12.92 16.3799C12.97 16.2599 13 16.1299 13 15.9999C13 15.8699 12.97 15.7399 12.92 15.6199Z" fill="#F97316" />
                  </svg>

                  <span className="text-[14px] font-light leading-[1.9]">عيب او خلل</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-3">
                {transformedReport.sections.map((section) => {
                  const isExpanded = expandedSections[section.id];
                  const totalCount = section.goodCount + section.warnCount + section.badCount;

                  return (
                    <div
                      key={section.id}
                      className={`rounded-xl p-4 border border-[#f2f2f2] flex flex-col gap-3 ${isExpanded ? "bg-[#f9fafb]/40" : "bg-white"}`}
                    >
                      <div
                        className="flex items-center justify-between border-b border-[#f2f2f2] pb-2 mb-1 cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-2">
                          {section.icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={section.icon || ''}
                              alt={section.title}
                              width={20}
                              height={20}
                              className="opacity-40"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-5 h-5 bg-[#e5e7eb] rounded opacity-40" />
                          )}
                          <span className="text-[14px] font-normal text-[#4b5563]">{section.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[#6b7280]">{totalCount}/{section.totalQuestions}</span>
                          <svg className={`cursor-pointer transition-transform duration-300 ${!isExpanded ? "rotate-180" : ""}`} width="9" height="5" viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 0L0 4.5H9L4.5 0Z" fill="#002EC1" />
                          </svg>

                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {section.questions.map((q) => {
                          const semanticType = q.response?.semanticType || 'GOOD';
                          const colors = SEMANTIC_COLORS[semanticType];

                          return (
                            <div
                              key={q.id}
                              className={`flex items-center justify-between gap-2 py-2 px-3 rounded-lg`}
                            >
                              <span className="text-[12px] text-[#6b7280] font-normal text-right leading-[1.5]">
                                {q.questionText}
                              </span>
                              <span className={`text-[12px] font-medium ${colors.text}`}>
                                {semanticType == "WARN" ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.4" d="M10.0013 18.3337C14.6037 18.3337 18.3346 14.6027 18.3346 10.0003C18.3346 5.39795 14.6037 1.66699 10.0013 1.66699C5.39893 1.66699 1.66797 5.39795 1.66797 10.0003C1.66797 14.6027 5.39893 18.3337 10.0013 18.3337Z" fill="#FFEDD5" />
                                    <path d="M10 11.4587C10.3417 11.4587 10.625 11.1753 10.625 10.8337V6.66699C10.625 6.32533 10.3417 6.04199 10 6.04199C9.65833 6.04199 9.375 6.32533 9.375 6.66699V10.8337C9.375 11.1753 9.65833 11.4587 10 11.4587Z" fill="#F97316" />
                                    <path d="M10.768 13.0164C10.7263 12.9164 10.668 12.8247 10.593 12.7414C10.5096 12.6664 10.418 12.6081 10.318 12.5664C10.118 12.4831 9.88464 12.4831 9.68464 12.5664C9.58464 12.6081 9.49297 12.6664 9.40964 12.7414C9.33464 12.8247 9.2763 12.9164 9.23464 13.0164C9.19297 13.1164 9.16797 13.2247 9.16797 13.3331C9.16797 13.4414 9.19297 13.5497 9.23464 13.6497C9.2763 13.7581 9.33464 13.8414 9.40964 13.9247C9.49297 13.9997 9.58464 14.0581 9.68464 14.0997C9.78464 14.1414 9.89297 14.1664 10.0013 14.1664C10.1096 14.1664 10.218 14.1414 10.318 14.0997C10.418 14.0581 10.5096 13.9997 10.593 13.9247C10.668 13.8414 10.7263 13.7581 10.768 13.6497C10.8096 13.5497 10.8346 13.4414 10.8346 13.3331C10.8346 13.2247 10.8096 13.1164 10.768 13.0164Z" fill="#F97316" />
                                  </svg>) : ""}
                                {semanticType == "BAD" ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path opacity="0.4" d="M10.0013 18.3337C14.6037 18.3337 18.3346 14.6027 18.3346 10.0003C18.3346 5.39795 14.6037 1.66699 10.0013 1.66699C5.39893 1.66699 1.66797 5.39795 1.66797 10.0003C1.66797 14.6027 5.39893 18.3337 10.0013 18.3337Z" fill="#FECACA" />
                                    <path d="M10 11.4587C10.3417 11.4587 10.625 11.1753 10.625 10.8337V6.66699C10.625 6.32533 10.3417 6.04199 10 6.04199C9.65833 6.04199 9.375 6.32533 9.375 6.66699V10.8337C9.375 11.1753 9.65833 11.4587 10 11.4587Z" fill="#DC2626" />
                                    <path d="M10.768 13.0164C10.7263 12.9164 10.668 12.8247 10.593 12.7414C10.5096 12.6664 10.418 12.6081 10.318 12.5664C10.118 12.4831 9.88464 12.4831 9.68464 12.5664C9.58464 12.6081 9.49297 12.6664 9.40964 12.7414C9.33464 12.8247 9.2763 12.9164 9.23464 13.0164C9.19297 13.1164 9.16797 13.2247 9.16797 13.3331C9.16797 13.4414 9.19297 13.5497 9.23464 13.6497C9.2763 13.7581 9.33464 13.8414 9.40964 13.9247C9.49297 13.9997 9.58464 14.0581 9.68464 14.0997C9.78464 14.1414 9.89297 14.1664 10.0013 14.1664C10.1096 14.1664 10.218 14.1414 10.318 14.0997C10.418 14.0581 10.5096 13.9997 10.593 13.9247C10.668 13.8414 10.7263 13.7581 10.768 13.6497C10.8096 13.5497 10.8346 13.4414 10.8346 13.3331C10.8346 13.2247 10.8096 13.1164 10.768 13.0164Z" fill="#DC2626" />
                                  </svg>) : ""}

                                {semanticType == "GOOD" ? (
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.03906 10.0007C1.03906 14.9482 5.04984 18.959 9.9974 18.959C14.9449 18.959 18.9557 14.9482 18.9557 10.0007C18.9557 5.0531 14.9449 1.04232 9.9974 1.04232C5.04984 1.04232 1.03906 5.0531 1.03906 10.0007Z" fill="#DCFCE7" />
                                    <path d="M14.0594 6.68365C14.2802 7.08745 14.1319 7.59381 13.7281 7.81463C12.5853 8.4396 11.5121 9.74794 10.6927 11.0027C10.2932 11.6144 9.9727 12.1839 9.75229 12.6003C9.64229 12.8081 9.55778 12.9767 9.50136 13.0921L9.4195 13.2633C9.29075 13.5447 9.01654 13.7318 8.70753 13.7489C8.39843 13.7659 8.10535 13.6103 7.94644 13.3446C7.68751 12.9117 7.27606 12.5165 6.89477 12.2151C6.70949 12.0686 6.54273 11.9531 6.42372 11.8751L6.24847 11.7655C5.8489 11.5375 5.70977 11.0287 5.93772 10.629C6.16573 10.2292 6.67466 10.0899 7.07445 10.3179L7.33699 10.481C7.48881 10.5804 7.69704 10.7247 7.92844 10.9077C8.10527 11.0475 8.303 11.2156 8.50262 11.4093C8.71665 11.0248 8.9841 10.5708 9.29721 10.0914C10.1444 8.79404 11.4045 7.18572 12.9284 6.35235C13.3322 6.13152 13.8386 6.27985 14.0594 6.68365Z" fill="#22C55E" />
                                  </svg>) : ""}

                              </span>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>

              {inspectionReport?.id ? (
                <div className="px-3 pt-1 pb-1 border-t border-gray-50 mx-2">
                  <DownloadInspectionPdfButton
                    reportId={inspectionReport.id}
                    variant="button"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="تأكيد الحذف"
        maxWidth="400px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleDeleteCar}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCarMutation.isPending}
            >
              {deleteCarMutation.isPending ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 text-base leading-relaxed">
          هل أنت متأكد من حذف هذه السيارة؟ هذا الإجراء لا يمكن التراجع عنه.
        </p>
      </Modal>

      {specsEditorOpen ? (
        <SpecsStripEditor
          car={car}
          isOpen={specsEditorOpen}
          onClose={() => setSpecsEditorOpen(false)}
        />
      ) : null}

      {/* Remove 360 View Confirmation Dialog */}
      <Modal
        isOpen={remove360DialogOpen}
        onClose={() => setRemove360DialogOpen(false)}
        title="تأكيد الحذف"
        maxWidth="400px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setRemove360DialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleRemove360}
              className="bg-red-600 hover:bg-red-700"
              disabled={remove360Mutation.isPending}
            >
              {remove360Mutation.isPending ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 text-base leading-relaxed">
          هل أنت متأكد من حذف عرض 360 درجة لهذه السيارة؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع الإطارات.
        </p>
      </Modal>
    </div>
  );
}

const STRIP_FALLBACK_ICONS: Record<string, string> = {
  fuel: "/assets/dashboard/cars/gas-station.svg",
  transmission: "/assets/dashboard/cars/transmission.svg",
  year: "/assets/dashboard/cars/calendar-bulk.svg",
  mileage: "/assets/dashboard/cars/car-speedometer-bulk.svg",
  address: "/assets/dashboard/cars/location-bulk.svg",
  trim: "/assets/dashboard/cars/car-model.svg",
};

function stripFallbackIcon(key: string) {
  return STRIP_FALLBACK_ICONS[key] || "/assets/dashboard/cars/info-circle.svg";
}

function StripItem({ icon, label }: { icon: string; label: string }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-1">
      <img src={icon} alt="" width={20} height={20} className="opacity-70" />
      <span className="text-[#6b7280] text-[14px] leading-none">{label}</span>
    </div>
  );
}