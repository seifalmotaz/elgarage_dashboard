"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettingsByCategory } from "@/hooks/queries/useSettings";
import { useBulkUpdateSettingsMutation } from "@/hooks/mutations/useSettings";
import {
  brandingToPayload,
  emptyBrandingForm,
  mapSettingsToForm,
  type BrandingForm,
} from "@/lib/api/site-content-settings";

const BRANDING_KEYS: Array<keyof BrandingForm> = [
  "tagline",
  "project_name",
  "vision",
  "mission",
];

export default function AboutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BrandingForm>(emptyBrandingForm);
  const [originalData, setOriginalData] = useState<BrandingForm>(emptyBrandingForm);

  const { data: brandingSettings, isLoading } = useSettingsByCategory("branding");
  const bulkUpdateMutation = useBulkUpdateSettingsMutation();

  useEffect(() => {
    const next = {
      ...emptyBrandingForm,
      ...mapSettingsToForm<BrandingForm>(brandingSettings, BRANDING_KEYS),
    };
    setFormData(next);
    setOriginalData(next);
  }, [brandingSettings]);

  const handleChange = (field: keyof BrandingForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(originalData);
    router.back();
  };

  const handleSave = () => {
    bulkUpdateMutation.mutate(brandingToPayload(formData), {
      onSuccess: () => setOriginalData(formData),
    });
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
        <div className="px-8 py-6 flex items-center justify-between shrink-0">
          <h1 className="text-[24px] font-bold text-[#1A1A1A]">عن جراج</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002EC1]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
      <div className="px-8 py-6 flex items-center justify-between shrink-0">
        <h1 className="text-[24px] font-bold text-[#1A1A1A]">عن جراج</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar w-full">
        <div className="w-full max-w-[720px] ms-auto">
          <div className="bg-white rounded-[24px] p-8 border border-[#F2F2F2] flex flex-col gap-8">
            <h3 className="text-[18px] font-semibold text-[#1A1A1A] text-right">
              التعريف بالمشروع
            </h3>
            <p className="text-[13px] text-[#6B7280] text-right">
              معلومات التواصل وروابط السوشيال تُدار من الإعدادات.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#4B5563] text-right">
                  الشعار اللفظي (Tagline)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="سوق السيارات الموثوق في مصر"
                  className="h-[56px] px-4 rounded-[12px] border border-[#E5E7EB] text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#002EC1] transition-colors text-right"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#4B5563] text-right">
                  اسم المشروع
                </label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => handleChange("project_name", e.target.value)}
                  placeholder="elGarage"
                  className="h-[56px] px-4 rounded-[12px] border border-[#E5E7EB] text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#002EC1] transition-colors text-right"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#4B5563] text-right">
                  رؤيتنا
                </label>
                <textarea
                  rows={4}
                  value={formData.vision}
                  onChange={(e) => handleChange("vision", e.target.value)}
                  placeholder="أن نكون المنصة الرائدة والأكثر ثقة لبيع وشراء السيارات في مصر والشرق الأوسط."
                  className="p-4 rounded-[12px] border border-[#E5E7EB] text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#002EC1] resize-none transition-colors text-right"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#4B5563] text-right">
                  مهمتنا
                </label>
                <textarea
                  rows={4}
                  value={formData.mission}
                  onChange={(e) => handleChange("mission", e.target.value)}
                  placeholder="توفير تجربة آمنة، شفافة، وسهلة لجميع مستخدمينا من خلال فحص دقيق للسيارات وخدمة عملاء متميزة."
                  className="p-4 rounded-[12px] border border-[#E5E7EB] text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#002EC1] resize-none transition-colors text-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F2F2F2] px-8 py-5 flex items-center justify-end gap-4 z-20">
        <button
          onClick={handleCancel}
          className="h-[48px] px-10 rounded-[12px] bg-[#FEF2F2] text-[#DC2626] text-[14px] font-semibold hover:bg-[#FEE2E2] transition-all"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          disabled={bulkUpdateMutation.isPending || !hasChanges}
          className="h-[48px] px-10 rounded-[12px] bg-[#002EC1] text-white text-[14px] font-semibold hover:bg-[#0026A3] transition-all flex items-center gap-2 disabled:bg-[#9CA3AF] disabled:cursor-not-allowed"
        >
          {bulkUpdateMutation.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <img
              src="/assets/dashboard/sales-requests/copy-success.svg"
              alt="save"
              width={20}
              height={20}
              className="brightness-0 invert"
            />
          )}
          حفظ التعديلات
        </button>
      </div>
    </div>
  );
}
