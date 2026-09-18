"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import { SiteContentSettingsSection } from "@/components/dashboard/settings/SiteContentSettingsSection";
import { HighlightStripSettingsSection } from "@/components/dashboard/settings/HighlightStripSettingsSection";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import { useGeneralSettings } from "@/hooks/queries/useGeneralSettings";
import { useUpdateGeneralSettingsMutation } from "@/hooks/mutations/useGeneralSettings";
import type { GeneralSettings } from "@/lib/api/general-settings";

const initialFormData: GeneralSettings = {
  platformName: "",
  defaultLanguage: "ar",
  maintenanceMode: "false",
  defaultPaginationLimit: "20",
};

export default function SettingsPage() {
  const [formData, setFormData] = useState<GeneralSettings>(initialFormData);
  const [originalData, setOriginalData] = useState<GeneralSettings>(initialFormData);

  const { data, isLoading, isError, refetch } = useGeneralSettings();
  const updateMutation = useUpdateGeneralSettingsMutation();

  useEffect(() => {
    if (data) {
      setFormData(data);
      setOriginalData(data);
    }
  }, [data]);

  const handleChange = (field: keyof GeneralSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaintenanceModeToggle = (checked: boolean) => {
    handleChange("maintenanceMode", checked ? "true" : "false");
  };

  const handleCancel = () => {
    setFormData(originalData);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
    setOriginalData(formData);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (isLoading) {
    return <LoadingState type="page" />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} message="فشل تحميل الإعدادات" />;
  }

  return (
    <PageContainer>
      <PageHeader title="الإعدادات" />
      <ContentCard>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              اسم المنصة
            </label>
            <input
              type="text"
              value={formData.platformName}
              onChange={(e) => handleChange("platformName", e.target.value)}
              className="h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors text-right"
              placeholder="elGarage"
            />
          </div>

          <Select
            label="اللغة الافتراضية"
            value={formData.defaultLanguage}
            options={[
              { label: "العربية", value: "ar" },
              { label: "English", value: "en" },
            ]}
            onChange={(value) => handleChange("defaultLanguage", value)}
          />

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-medium text-[#1a1a1a]">
                وضع الصيانة
              </span>
              <span className="text-[12px] text-[#9ca3af]">
                تفعيل وضع الصيانة يوقف الوصول للمستخدمين
              </span>
            </div>
            <Switch
              checked={formData.maintenanceMode === "true"}
              onChange={handleMaintenanceModeToggle}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              عدد العناصر في الصفحة
            </label>
            <input
              type="number"
              value={formData.defaultPaginationLimit}
              onChange={(e) => handleChange("defaultPaginationLimit", e.target.value)}
              min={5}
              max={100}
              className="h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors text-right"
              placeholder="20"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges || updateMutation.isPending}
              className="!text-red-500 !border-red-200 hover:!bg-red-50"
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              loading={updateMutation.isPending}
              icon={
                <img
                  src="/assets/dashboard/sales-requests/copy-success.svg"
                  alt="save"
                  width={20}
                  height={20}
                  className="brightness-0 invert"
                />
              }
              iconPosition="right"
            >
              حفظ
            </Button>
          </div>
        </div>
      </ContentCard>

      <SiteContentSettingsSection />
      <HighlightStripSettingsSection />
    </PageContainer>
  );
}
