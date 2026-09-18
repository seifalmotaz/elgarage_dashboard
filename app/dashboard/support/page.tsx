"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import Button from "@/components/ui/Button";
import { useSupportContent } from "@/hooks/queries/useSupport";
import { useUpdateSupportMutation } from "@/hooks/mutations/useSupport";
import type { SupportContent } from "@/lib/api/support";
import toast from "react-hot-toast";

const initialFormData: SupportContent = {
  title: "",
  email: "",
  phone: "",
  whatsapp: "",
  content: "",
};

export default function SupportPage() {
  const [formData, setFormData] = useState<SupportContent>(initialFormData);
  const [originalData, setOriginalData] = useState<SupportContent>(initialFormData);

  const { data, isLoading, isError, refetch } = useSupportContent();
  const updateMutation = useUpdateSupportMutation();

  useEffect(() => {
    if (data) {
      setFormData(data);
      setOriginalData(data);
    }
  }, [data]);

  const handleChange = (field: keyof SupportContent, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(originalData);
  };

  const handleSave = () => {
    // Validate title
    if (!formData.title || formData.title.trim().length < 2) {
      toast.error('الرجاء إدخال عنوان الصفحة');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    // Validate phone (numeric with +, -, spaces, min 8 chars)
    const phoneRegex = /^[\d+\-\s]{8,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('الرجاء إدخال رقم هاتف صحيح');
      return;
    }

    updateMutation.mutate(formData);
    setOriginalData(formData);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (isLoading) {
    return <LoadingState type="page" />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} message="فشل تحميل محتوى الدعم" />;
  }

  return (
    <PageContainer>
      <PageHeader title="الدعم" />
      <ContentCard>
        <div className="flex flex-col gap-6">
          {/* عنوان الصفحة */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              عنوان الصفحة
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors text-right"
              placeholder="معلوماتالدعم"
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors text-left"
              dir="ltr"
              placeholder="support@example.com"
            />
          </div>

          {/* رقم الهاتف */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors text-left"
              dir="ltr"
              placeholder="+20 100 123 4567"
            />
          </div>

          {/* رقم الواتساب */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              رقم الواتساب
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              className="h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors text-left"
              dir="ltr"
              placeholder="+20 100 123 4567"
            />
          </div>

          {/* محتوى صفحة الدعم */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
              محتوى صفحة الدعم
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              minLength={200}
              className="min-h-[200px] p-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors resize-none text-right"
              placeholder="أدخل محتوى صفحة الدعم..."
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
    </PageContainer>
  );
}