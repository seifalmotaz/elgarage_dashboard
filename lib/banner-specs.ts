export const BANNER_LOCATIONS = ["HOME", "BROWSE", "FEATURED", "SELL"] as const;
export type BannerLocation = (typeof BANNER_LOCATIONS)[number];

export const BANNER_TYPES = ["APP", "WEBSITE"] as const;
export type BannerType = (typeof BANNER_TYPES)[number];

export const BANNER_LOCATION_LABEL: Record<BannerLocation, string> = {
  HOME: "الصفحة الرئيسية",
  BROWSE: "تصفح السيارات",
  FEATURED: "السيارات المميزة",
  SELL: "بيع سيارتك",
};

export const BANNER_TYPE_LABEL: Record<BannerType, string> = {
  APP: "التطبيق",
  WEBSITE: "الموقع",
};

export type BannerImageSlot = "app" | "webMobile" | "webDesktop";
export type BannerImageField = "image" | "imageMobile" | "imageDesktop";

export type BannerImageSpec = {
  slot: BannerImageSlot;
  field: BannerImageField;
  width: number;
  height: number;
  ratio: number;
  ratioLabel: string;
  aspectClass: string;
  title: string;
  hint: string;
};

export const BANNER_IMAGE_SPECS: Record<BannerImageSlot, BannerImageSpec> = {
  app: {
    slot: "app",
    field: "image",
    width: 350,
    height: 150,
    ratio: 350 / 150,
    ratioLabel: "7∶3",
    aspectClass: "aspect-[7/3]",
    title: "صورة التطبيق",
    hint: "الحجم المستحسن 350 × 150 بكسل — النسبة 7∶3. لا توجد نسخة سطح مكتب للتطبيق.",
  },
  webMobile: {
    slot: "webMobile",
    field: "imageMobile",
    width: 350,
    height: 157,
    ratio: 350 / 157,
    ratioLabel: "350∶157",
    aspectClass: "aspect-[350/157]",
    title: "صورة الموبايل",
    hint: "الحجم المستحسن 350 × 157 بكسل — النسبة ≈ 2.23∶1. ضع العنصر المهم في المنتصف عمودياً.",
  },
  webDesktop: {
    slot: "webDesktop",
    field: "imageDesktop",
    width: 1088,
    height: 157,
    ratio: 1088 / 157,
    ratioLabel: "1088∶157",
    aspectClass: "aspect-[1088/157]",
    title: "صورة سطح المكتب",
    hint: "الحجم المستحسن 1088 × 157 بكسل — النسبة ≈ 6.93∶1. الجوانب تُقص مع ضيق الشاشة.",
  },
};

export const BANNER_IMAGE_FIELDS: BannerImageField[] = [
  "image",
  "imageMobile",
  "imageDesktop",
];

export function slotsForType(type: BannerType): BannerImageSpec[] {
  return type === "APP"
    ? [BANNER_IMAGE_SPECS.app]
    : [BANNER_IMAGE_SPECS.webMobile, BANNER_IMAGE_SPECS.webDesktop];
}

export function usedImageFields(type: BannerType): Set<BannerImageField> {
  return new Set(slotsForType(type).map((spec) => spec.field));
}

export function listPreviewAspect(type: BannerType): string {
  return type === "APP" ? "aspect-[7/3]" : "aspect-[1088/157]";
}

export function bannerPreviewUrl(banner: {
  image?: string | null;
  imageMobile?: string | null;
  imageDesktop?: string | null;
  type?: string | null;
}): string | null {
  if (banner.type === "APP") {
    return banner.image || null;
  }
  return banner.imageDesktop || banner.imageMobile || banner.image || null;
}

export function parseLocation(value: string | null | undefined): BannerLocation {
  return BANNER_LOCATIONS.includes(value as BannerLocation)
    ? (value as BannerLocation)
    : "HOME";
}

export function parseType(value: string | null | undefined): BannerType {
  return BANNER_TYPES.includes(value as BannerType)
    ? (value as BannerType)
    : "WEBSITE";
}
