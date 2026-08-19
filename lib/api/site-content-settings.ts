import type { AppSetting, UpsertSettingPayload } from "./settings";

export type ContactSocialForm = {
  whatsapp_number: string;
  primary_phone: string;
  secondary_phone: string;
  email: string;
  address: string;
  address_en: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  twitter_url: string;
  snapchat_url: string;
  youtube_url: string;
};

export const emptyContactSocialForm: ContactSocialForm = {
  whatsapp_number: "",
  primary_phone: "",
  secondary_phone: "",
  email: "",
  address: "",
  address_en: "",
  instagram_url: "",
  facebook_url: "",
  tiktok_url: "",
  twitter_url: "",
  snapchat_url: "",
  youtube_url: "",
};

export const SOCIAL_FIELDS: Array<{
  key: keyof ContactSocialForm;
  label: string;
  placeholder: string;
}> = [
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "twitter_url", label: "X (Twitter)", placeholder: "https://x.com/..." },
  { key: "youtube_url", label: "YouTube", placeholder: "https://youtube.com/..." },
  { key: "tiktok_url", label: "TikTok", placeholder: "https://tiktok.com/..." },
  { key: "snapchat_url", label: "Snapchat", placeholder: "https://snapchat.com/..." },
];

export function mapSettingsToForm<T extends Record<string, string>>(
  rows: AppSetting[] | undefined,
  keys: Array<keyof T>,
): Partial<T> {
  if (!rows || rows.length === 0) return {};
  const map: Record<string, string> = {};
  rows.forEach((row) => {
    map[row.key] = row.value;
  });
  const next: Partial<T> = {};
  for (const key of keys) {
    next[key] = (map[String(key)] ?? "") as T[keyof T];
  }
  return next;
}

export function contactSocialToPayload(form: ContactSocialForm): UpsertSettingPayload[] {
  return [
    { key: "whatsapp_number", value: form.whatsapp_number, category: "contact" },
    { key: "primary_phone", value: form.primary_phone, category: "contact" },
    { key: "secondary_phone", value: form.secondary_phone, category: "contact" },
    { key: "email", value: form.email, category: "contact" },
    { key: "address", value: form.address, category: "contact" },
    { key: "address_en", value: form.address_en, category: "contact" },
    { key: "instagram_url", value: form.instagram_url, category: "social" },
    { key: "facebook_url", value: form.facebook_url, category: "social" },
    { key: "tiktok_url", value: form.tiktok_url, category: "social" },
    { key: "twitter_url", value: form.twitter_url, category: "social" },
    { key: "snapchat_url", value: form.snapchat_url, category: "social" },
    { key: "youtube_url", value: form.youtube_url, category: "social" },
  ];
}

export type BrandingForm = {
  tagline: string;
  project_name: string;
  vision: string;
  mission: string;
};

export const emptyBrandingForm: BrandingForm = {
  tagline: "",
  project_name: "",
  vision: "",
  mission: "",
};

export function brandingToPayload(form: BrandingForm): UpsertSettingPayload[] {
  return [
    { key: "tagline", value: form.tagline, category: "branding" },
    { key: "project_name", value: form.project_name, category: "branding" },
    { key: "vision", value: form.vision, category: "branding" },
    { key: "mission", value: form.mission, category: "branding" },
  ];
}
