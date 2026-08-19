"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import Button from "@/components/ui/Button";
import { usePrivacyContent } from "@/hooks/queries/usePrivacy";
import { useUpdatePrivacyMutation } from "@/hooks/mutations/usePrivacy";
import type { PrivacyContent } from "@/lib/api/privacy";

type TabType = "privacy" | "terms";

const initialFormData: PrivacyContent = {
  privacyPolicy: "",
  termsOfService: "",
  lastUpdated: "",
};

export default function PrivacyPage() {
  const [formData, setFormData] = useState<PrivacyContent>(initialFormData);
  const [originalData, setOriginalData] = useState<PrivacyContent>(initialFormData);
  const [activeTab, setActiveTab] = useState<TabType>("privacy");

  const { data, isLoading, isError, refetch } = usePrivacyContent();
  const updateMutation = useUpdatePrivacyMutation();

  useEffect(() => {
    if (data) {
      setFormData(data);
      setOriginalData(data);
    }
  }, [data]);

  const handleChange = (field: keyof PrivacyContent, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    return <ErrorState onRetry={() => refetch()} message="فشل تحميل محتوى الخصوصية" />;
  }

  return (
    <PageContainer>
      <PageHeader title="الخصوصية والشروط" />
      <ContentCard>
        <div className="flex flex-col gap-6">
          {/* Tab Toggle */}
          <div className="flex items-center gap-2 bg-[#f8fafc] p-1 rounded-full w-fit">
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${
                activeTab === "privacy"
                  ? "bg-[#002ec1] text-white"
                  : "text-[#6b7280] hover:text-[#1a1a1a]"
              }`}
            >
              سياسة الخصوصية
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${
                activeTab === "terms"
                  ? "bg-[#002ec1] text-white"
                  : "text-[#6b7280] hover:text-[#1a1a1a]"
              }`}
            >
              شروط الاستخدام
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "privacy" ? (
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
                سياسة الخصوصية
              </label>
              <textarea
                value={formData.privacyPolicy}
                onChange={(e) => handleChange("privacyPolicy", e.target.value)}
                className="min-h-[400px] p-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors resize-none text-right"
                placeholder="أدخل سياسة الخصوصية..."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
                شروط الاستخدام
              </label>
              <textarea
                value={formData.termsOfService}
                onChange={(e) => handleChange("termsOfService", e.target.value)}
                className="min-h-[400px] p-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors resize-none text-right"
                placeholder="أدخل شروط الاستخدام..."
              />
            </div>
          )}

          {/* تاريخ آخر تحديث */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              تاريخ آخر تحديث
            </label>
            <input
              type="date"
              value={formData.lastUpdated}
              onChange={(e) => handleChange("lastUpdated", e.target.value)}
              className="h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors text-right"
            />
          </div>

          {/* Action Buttons */}
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
            >
              حفظ
            </Button>
          </div>
        </div>
      </ContentCard>
    </PageContainer>
  );
}