"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import toast from "react-hot-toast";
import BannerImageUpload from "@/components/dashboard/BannerImageUpload";
import type { CreateBannerPayload } from "@/lib/api/banners";
import {
  BANNER_IMAGE_FIELDS,
  BANNER_LOCATION_LABEL,
  BANNER_TYPE_LABEL,
  slotsForType,
  usedImageFields,
  type BannerImageField,
  type BannerLocation,
  type BannerType,
} from "@/lib/banner-specs";

export type BannerFormValues = {
  title: string;
  subtitle: string;
  image: string;
  imageMobile: string;
  imageDesktop: string;
  link: string;
  location: BannerLocation;
  type: BannerType;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE";
  order: string;
};

type BannerFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<BannerFormValues>;
  submitting: boolean;
  onSubmit: (payload: CreateBannerPayload) => void;
  onCancel: () => void;
};

const EMPTY_VALUES: BannerFormValues = {
  title: "",
  subtitle: "",
  image: "",
  imageMobile: "",
  imageDesktop: "",
  link: "",
  location: "HOME",
  type: "WEBSITE",
  startDate: "",
  endDate: "",
  status: "ACTIVE",
  order: "",
};

export default function BannerForm({
  mode,
  initialValues,
  submitting,
  onSubmit,
  onCancel,
}: BannerFormProps) {
  const [values, setValues] = useState<BannerFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });

  const setField = <K extends keyof BannerFormValues>(
    key: K,
    value: BannerFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const slots = slotsForType(values.type);
  const ownedFields = usedImageFields(values.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.title.trim()) {
      toast.error("عنوان البانر مطلوب");
      return;
    }

    if (
      values.startDate &&
      values.endDate &&
      new Date(values.endDate) < new Date(values.startDate)
    ) {
      toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    const missing = slots.filter((spec) => !values[spec.field].trim());
    if (missing.length > 0) {
      toast.error(
        ownedFields.has("image")
          ? "ارفع صورة البانر للتطبيق"
          : "ارفع صورة للموبايل وصورة لسطح المكتب",
      );
      return;
    }

    const images = Object.fromEntries(
      BANNER_IMAGE_FIELDS.map((field: BannerImageField) => [
        field,
        ownedFields.has(field) ? values[field].trim() : null,
      ]),
    ) as Record<BannerImageField, string | null>;

    onSubmit({
      title: values.title.trim(),
      subtitle: values.subtitle.trim() || undefined,
      ...images,
      link: values.link.trim() || undefined,
      location: values.location,
      type: values.type,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      status: values.status,
      order: values.order ? parseInt(values.order, 10) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[#000a2a]">
          {mode === "create" ? "اضافة بانر جديد" : "تعديل البانر"}
        </h1>
        <Link
          href="/dashboard/marketing"
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
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-[#002ec1] border-b border-[#f2f2f2] pb-3 text-start">
              اعدادات البانر
            </h2>

            <div className="flex flex-col gap-4">
              <Select
                label="الموقع"
                value={values.location}
                onChange={(val) => setField("location", val as BannerLocation)}
                options={[
                  { label: BANNER_LOCATION_LABEL.HOME, value: "HOME" },
                  { label: BANNER_LOCATION_LABEL.BROWSE, value: "BROWSE" },
                  { label: BANNER_LOCATION_LABEL.FEATURED, value: "FEATURED" },
                  { label: BANNER_LOCATION_LABEL.SELL, value: "SELL" },
                ]}
              />
              <Select
                label="النوع"
                value={values.type}
                onChange={(val) => setField("type", val as BannerType)}
                options={[
                  { label: BANNER_TYPE_LABEL.WEBSITE, value: "WEBSITE" },
                  { label: BANNER_TYPE_LABEL.APP, value: "APP" },
                ]}
              />
              <Select
                label="الحالة"
                value={values.status}
                onChange={(val) =>
                  setField("status", val as "ACTIVE" | "INACTIVE")
                }
                options={[
                  { label: "نشط", value: "ACTIVE" },
                  { label: "غير نشط", value: "INACTIVE" },
                ]}
              />

              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                  ترتيب العرض
                </label>
                <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                  <input
                    type="number"
                    value={values.order}
                    onChange={(e) => setField("order", e.target.value)}
                    placeholder="الأصغر يظهر أولاً..."
                    className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
                  />
                </div>
                <p className="text-[11px] text-[#9ca3af] text-start leading-relaxed">
                  الترتيب يحدد أولوية الظهور. عدد البانرات المعروضة على التطبيق/الموقع يتحكم به العميل عبر limit (كم تظهر).
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                  تاريخ البداية
                </label>
                <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                  <input
                    type="date"
                    value={values.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 h-full text-start"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                  تاريخ النهاية
                </label>
                <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                  <input
                    type="date"
                    value={values.endDate}
                    onChange={(e) => setField("endDate", e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 h-full text-start"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#f2f2f2] mt-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-[2] h-[44px] rounded-full"
                loading={submitting}
                disabled={submitting}
                icon={
                  mode === "create" ? (
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
                  ) : (
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
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                  )
                }
                iconPosition="left"
              >
                {submitting
                  ? mode === "create"
                    ? "جاري الحفظ..."
                    : "جاري التحديث..."
                  : mode === "create"
                    ? "اضافة البانر"
                    : "تحديث البانر"}
              </Button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-[#fff5f5] text-[#ef4444] border border-[#ffe4e4] rounded-full h-[44px] text-[14px] font-medium hover:bg-[#ffeaea] transition-colors"
              >
                الغاء
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
              <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                عنوان البانر
              </label>
              <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                <input
                  type="text"
                  value={values.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="أدخل عنوان البانر ..."
                  className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
              <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                الوصف
              </label>
              <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                <input
                  type="text"
                  value={values.subtitle}
                  onChange={(e) => setField("subtitle", e.target.value)}
                  placeholder="أدخل وصف البانر ..."
                  className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
              <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
                رابط البانر
              </label>
              <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
                <input
                  type="text"
                  value={values.link}
                  onChange={(e) => setField("link", e.target.value)}
                  placeholder="https://example.com/..."
                  className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
                />
              </div>
              <p className="text-[11px] text-[#9ca3af] text-start">
                اختياري. يفتح عند الضغط على البانر.
              </p>
            </div>

            {slots.map((spec) => (
              <BannerImageUpload
                key={spec.slot}
                spec={spec}
                value={values[spec.field]}
                onChange={(url) => setField(spec.field, url)}
                disabled={submitting}
              />
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
