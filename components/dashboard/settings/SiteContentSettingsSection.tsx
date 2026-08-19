"use client";

import { useEffect, useState } from "react";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import Button from "@/components/ui/Button";
import { useSettingsByCategory } from "@/hooks/queries/useSettings";
import { useBulkUpdateSettingsMutation } from "@/hooks/mutations/useSettings";
import {
  SOCIAL_FIELDS,
  contactSocialToPayload,
  emptyContactSocialForm,
  mapSettingsToForm,
  type ContactSocialForm,
} from "@/lib/api/site-content-settings";

const inputClassName =
  "h-[48px] px-4 rounded-[16px] border border-[#f2f2f2] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#002ec1] transition-colors";

const CONTACT_KEYS: Array<keyof ContactSocialForm> = [
  "whatsapp_number",
  "primary_phone",
  "secondary_phone",
  "email",
  "address",
  "address_en",
];

const SOCIAL_KEYS: Array<keyof ContactSocialForm> = [
  "instagram_url",
  "facebook_url",
  "tiktok_url",
  "twitter_url",
  "snapchat_url",
  "youtube_url",
];

export function SiteContentSettingsSection() {
  const [form, setForm] = useState<ContactSocialForm>(emptyContactSocialForm);
  const [original, setOriginal] = useState<ContactSocialForm>(emptyContactSocialForm);

  const { data: contactSettings, isLoading: loadingContact } =
    useSettingsByCategory("contact");
  const { data: socialSettings, isLoading: loadingSocial } =
    useSettingsByCategory("social");
  const saveMutation = useBulkUpdateSettingsMutation();

  useEffect(() => {
    const next = {
      ...emptyContactSocialForm,
      ...mapSettingsToForm(contactSettings, CONTACT_KEYS),
      ...mapSettingsToForm(socialSettings, SOCIAL_KEYS),
    };
    setForm(next);
    setOriginal(next);
  }, [contactSettings, socialSettings]);

  const handleChange = (field: keyof ContactSocialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(original);

  if (loadingContact || loadingSocial) {
    return <LoadingState type="card" count={2} />;
  }

  return (
    <>
      <ContentCard title="معلومات التواصل">
        <div className="flex flex-col gap-6">
          <p className="text-[13px] text-[#6B7280] text-right">
            تظهر هذه البيانات في صفحة تواصل معنا وتذييل الموقع والتطبيق.
          </p>
          {(
            [
              { key: "whatsapp_number", label: "WhatsApp", placeholder: "+201012345678", dir: "ltr" },
              { key: "primary_phone", label: "رقم الهاتف الرئيسي", placeholder: "19900", dir: "ltr" },
              { key: "secondary_phone", label: "رقم الهاتف الثانوي", placeholder: "+201001234567", dir: "ltr" },
              { key: "email", label: "البريد الإلكتروني", placeholder: "info@elgarage.eg", dir: "ltr" },
              { key: "address", label: "العنوان (عربي)", placeholder: "القاهرة، مصر الجديدة، شارع الثورة", dir: "rtl" },
              { key: "address_en", label: "العنوان (English)", placeholder: "Cairo, Heliopolis, El Thawra St.", dir: "ltr" },
            ] as const
          ).map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
                {field.label}
              </label>
              <input
                type={field.key === "email" ? "email" : "text"}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={`${inputClassName} ${field.dir === "ltr" ? "text-left" : "text-right"}`}
                dir={field.dir}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </ContentCard>

      <ContentCard title="وسائل التواصل الاجتماعي">
        <div className="flex flex-col gap-6">
          <p className="text-[13px] text-[#6B7280] text-right">
            الروابط الفارغة لا تظهر على الموقع. تأكد من إدخال رابط كامل يبدأ بـ https://
          </p>
          {SOCIAL_FIELDS.map((social) => (
            <div key={social.key} className="flex flex-col gap-2">
              <label className="text-[14px] font-medium text-[#1a1a1a] text-right">
                {social.label}
              </label>
              <input
                type="url"
                value={form[social.key]}
                onChange={(e) => handleChange(social.key, e.target.value)}
                className={`${inputClassName} text-left`}
                dir="ltr"
                placeholder={social.placeholder}
              />
            </div>
          ))}

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setForm(original)}
              disabled={!hasChanges || saveMutation.isPending}
              className="!text-red-500 !border-red-200 hover:!bg-red-50"
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                saveMutation.mutate(contactSocialToPayload(form), {
                  onSuccess: () => setOriginal(form),
                })
              }
              disabled={!hasChanges || saveMutation.isPending}
              loading={saveMutation.isPending}
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
              حفظ التواصل والسوشيال
            </Button>
          </div>
        </div>
      </ContentCard>
    </>
  );
}
