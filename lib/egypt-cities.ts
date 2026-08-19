export type EgyptCityOption = {
  slug: string;
  nameAr: string;
  nameEn: string;
  featured?: boolean;
};

/**
 * Fallback catalog mirroring `backend/src/common/geo/egypt-cities.ts`.
 * Used when `GET /cars/cities` is unavailable. Slugs stay the filter contract.
 */
export const EGYPT_CITIES: EgyptCityOption[] = [
  { slug: "cairo", nameAr: "القاهرة", nameEn: "Cairo", featured: true },
  { slug: "new-cairo", nameAr: "القاهرة الجديدة", nameEn: "New Cairo", featured: true },
  { slug: "giza", nameAr: "الجيزة", nameEn: "Giza", featured: true },
  { slug: "october", nameAr: "6 أكتوبر", nameEn: "6th of October", featured: true },
  { slug: "sheikh-zayed", nameAr: "الشيخ زايد", nameEn: "Sheikh Zayed", featured: true },
  { slug: "alexandria", nameAr: "الإسكندرية", nameEn: "Alexandria", featured: true },
  { slug: "qalyubia", nameAr: "القليوبية", nameEn: "Qalyubia" },
  { slug: "sharqia", nameAr: "الشرقية", nameEn: "Sharqia" },
  { slug: "dakahlia", nameAr: "الدقهلية", nameEn: "Dakahlia" },
  { slug: "beheira", nameAr: "البحيرة", nameEn: "Beheira" },
  { slug: "kafr-el-sheikh", nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh" },
  { slug: "gharbia", nameAr: "الغربية", nameEn: "Gharbia" },
  { slug: "monufia", nameAr: "المنوفية", nameEn: "Monufia" },
  { slug: "damietta", nameAr: "دمياط", nameEn: "Damietta" },
  { slug: "port-said", nameAr: "بورسعيد", nameEn: "Port Said" },
  { slug: "ismailia", nameAr: "الإسماعيلية", nameEn: "Ismailia" },
  { slug: "suez", nameAr: "السويس", nameEn: "Suez" },
  { slug: "fayoum", nameAr: "الفيوم", nameEn: "Fayoum" },
  { slug: "beni-suef", nameAr: "بني سويف", nameEn: "Beni Suef" },
  { slug: "minya", nameAr: "المنيا", nameEn: "Minya" },
  { slug: "asyut", nameAr: "أسيوط", nameEn: "Asyut" },
  { slug: "sohag", nameAr: "سوهاج", nameEn: "Sohag" },
  { slug: "qena", nameAr: "قنا", nameEn: "Qena" },
  { slug: "luxor", nameAr: "الأقصر", nameEn: "Luxor" },
  { slug: "aswan", nameAr: "أسوان", nameEn: "Aswan" },
  { slug: "red-sea", nameAr: "البحر الأحمر", nameEn: "Red Sea" },
  { slug: "south-sinai", nameAr: "جنوب سيناء", nameEn: "South Sinai" },
  { slug: "north-sinai", nameAr: "شمال سيناء", nameEn: "North Sinai" },
  { slug: "matrouh", nameAr: "مطروح", nameEn: "Matrouh" },
  { slug: "new-valley", nameAr: "الوادي الجديد", nameEn: "New Valley" },
];

export function matchStoredCity(
  raw: string | undefined | null,
  cities: EgyptCityOption[] = EGYPT_CITIES,
): string {
  if (!raw?.trim()) return "";
  const value = raw.trim();
  const exact = cities.find(
    (city) =>
      city.nameAr === value ||
      city.nameEn.toLowerCase() === value.toLowerCase() ||
      city.slug === value.toLowerCase(),
  );
  if (exact) return exact.nameAr;

  const contained = cities.find(
    (city) =>
      value.includes(city.nameAr) ||
      value.toLowerCase().includes(city.nameEn.toLowerCase()),
  );
  return contained?.nameAr ?? value;
}
