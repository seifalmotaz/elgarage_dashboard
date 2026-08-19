/**
 * Shared API Types
 *
 * This file contains all types used across the application that are
 * shared between multiple domains. Types are extracted from api-client.ts
 * and organized here for better maintainability.
 */

// ========== CORE API TYPES ==========

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ========== CAR SPEC TYPES ==========

export interface SpecType {
  id: string;
  name: string;
  nameEn?: string | null;
  key: string;
  fieldType?: 'DROPDOWN' | 'TEXT' | 'NUMBER';
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  options: SpecOption[];
}

export interface SpecOption {
  id: string;
  typeId: string;
  label: string;
  labelEn?: string | null;
  value: string;
  order: number;
  isActive: boolean;
}

export interface CreateSpecTypeDto {
  name: string;
  nameEn?: string;
  key: string;
  fieldType?: 'DROPDOWN' | 'TEXT' | 'NUMBER';
  order?: number;
}

export interface CreateSpecOptionDto {
  label: string;
  labelEn?: string;
  value: string;
  order?: number;
}

// ========== CAR FEATURE TYPES ==========

export interface FeatureSection {
  id: string;
  name: string;
  nameEn?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: FeatureItem[];
}

export interface FeatureItem {
  id: string;
  sectionId: string;
  name: string;
  nameEn?: string | null;
  iconUrl: string;
  order: number;
  isActive: boolean;
}

export interface CreateFeatureSectionDto {
  name: string;
  nameEn?: string;
  order?: number;
}

export interface CreateFeatureItemDto {
  name: string;
  nameEn?: string;
  iconUrl: string;
  order?: number;
}

// ========== CAR BRAND TYPES ==========

export interface CarBrandRelation {
  id: string;
  name: string;
  nameEn?: string;
  logo?: string;
  order: number;
  isActive: boolean;
}

export interface CarModelRelation {
  id: string;
  brandId: string;
  name: string;
  nameEn?: string;
  order: number;
  isActive: boolean;
}

export interface CarBrand {
  id: string;
  name: string;
  nameEn?: string;
  website?: string;
  logo?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  models: CarBrandModel[];
}

export interface CarBrandModel {
  id: string;
  brandId: string;
  name: string;
  nameEn?: string;
  order: number;
  isActive: boolean;
}

export interface CreateBrandDto {
  name: string;
  nameEn?: string;
  website?: string;
  logo?: string;
  order?: number;
}

export interface CreateModelDto {
  name: string;
  nameEn?: string;
  order?: number;
}

// ========== CAR TYPES ==========

export interface Car {
  id: string;
  brand: string;
  model: string;
  brandId?: string;
  modelId?: string;
  carBrand?: CarBrandRelation;
  carModel?: CarModelRelation;
  year: number;
  mileage: number;
  trim?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  price: number;
  images: string[];
  videoUrl?: string;
  viewer360Path?: string | null;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD';
  listingRequestId?: string;
  plateNumber?: string;
  chassisNumber?: string;
  createdAt: string;
  updatedAt: string;
  specifications: CarSpecification[];
  features: CarFeature[];
  isFeatured?: boolean;
  featuredAt?: string | null;
}

export interface CarSpecification {
  id: string;
  carId: string;
  specKeyId: string;
  specKey: SpecType;
  optionId?: string;
  option?: SpecOption;
  value?: string;
}

export interface CarFeature {
  id: string;
  carId: string;
  featureId: string;
  feature: FeatureItem;
}

export interface CreateCarDto {
  brandId?: string;
  modelId?: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  trim?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  price: number;
  images: string[];
  videoUrl?: string;
  description?: string;
  listingRequestId?: string;
  specifications: { specKeyId: string; optionId?: string; value?: string }[];
  featureIds: string[];
}

export interface UpdateCarDto {
  brandId?: string;
  modelId?: string;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  trim?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  price?: number;
  images?: string[];
  videoUrl?: string;
  description?: string;
  specifications?: { specKeyId: string; optionId?: string; value?: string }[];
  featureIds?: string[];
}

// ========== AUTH TYPES ==========

export interface LoginDto {
  phone: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

// ========== USER TYPES ==========

export interface User {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  city: string | null;
  region: string | null;
  avatar: string | null;
  role: string;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== INSPECTION SYSTEM TYPES ==========

export type OptionSemanticType = 'GOOD' | 'WARN' | 'BAD';

export const SEMANTIC_COLORS: Record<OptionSemanticType, { bg: string; text: string; border: string }> = {
  GOOD: { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]', border: 'border-[#16A34A]' },
  WARN: { bg: 'bg-[#FEF3C7]', text: 'text-[#CA8A04]', border: 'border-[#CA8A04]' },
  BAD:  { bg: 'bg-[#FFE0DE]', text: 'text-[#AF1208]', border: 'border-[#AF1208]' },
};

export interface InspectionSection {
  id: string;
  title: string;
  titleEn?: string | null;
  icon?: string;
  order: number;
  enablePhotos: boolean;
  enableNotes: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  draftQuestions?: InspectionQuestion[];
  _count?: { draftQuestions: number };
}

export interface InspectionQuestion {
  id: string;
  draftSectionId: string;
  questionText: string;
  questionTextEn?: string | null;
  questionKey: string;
  answerType: 'OPTIONS';
  isRequired: boolean;
  order: number;
  isActive: boolean;
  draftOptions?: InspectionOption[];
}

export interface InspectionOption {
  id: string;
  draftQuestionId: string;
  label: string;
  value: string;
  semanticType: OptionSemanticType;
  order: number;
}

export interface CreateInspectionSectionDto {
  title: string;
  titleEn?: string;
  icon?: string;
  enablePhotos?: boolean;
  enableNotes?: boolean;
}

export interface UpdateInspectionSectionDto {
  title?: string;
  titleEn?: string | null;
  icon?: string;
  enablePhotos?: boolean;
  enableNotes?: boolean;
}

export interface CreateInspectionQuestionDto {
  sectionId: string;
  questionText: string;
  questionTextEn?: string;
  questionKey: string;
  options?: { label: string; value: string; semanticType: OptionSemanticType }[];
}

export interface UpdateInspectionQuestionDto {
  questionText?: string;
  questionTextEn?: string | null;
  options?: { label: string; value: string; semanticType: OptionSemanticType }[];
}

// ========== 360 VIEW TYPES ==========

export interface Car360UploadResponse {
  success: boolean;
  data: {
    totalFrames: number;
    viewer360Path: string;
  };
}

export interface Car360RemoveResponse {
  success: boolean;
  message: string;
}

export interface Car360Manifest {
  carId: string;
  totalFrames: number;
  /** Quality tiers — keys are "low", "high", "original". Each tier maps to an array of absolute frame URLs.
   *  Tiers may be absent if the car only has certain qualities uploaded.
   *  Backward compat: v1 flat frame cars return { original: string[] } only.
   */
  frameUrls: Record<string, string[]>;
}

// ========== ARTICLE TYPES ==========

export type ArticleStatus = 'DRAFT' | 'PUBLISHED';

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string | null;
  category: string;
  status: ArticleStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export type ArticleDetail = Article;

export interface ArticlesListResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: ArticleStatus;
  search?: string;
}

export interface CreateArticlePayload {
  title: string;
  description: string;
  content: string;
  image?: string;
  category: string;
  status?: ArticleStatus;
}

export interface UpdateArticlePayload {
  title?: string;
  description?: string;
  content?: string;
  image?: string;
  category?: string;
  status?: ArticleStatus;
}

// ========== FAQ TYPES ==========

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type FAQListItem = FAQ;

export interface FAQsResponse {
  data: FAQ[];
  total: number;
}

export interface CreateFAQPayload {
  question: string;
  answer: string;
  category: string;
  order?: number;
}

export interface UpdateFAQPayload {
  question?: string;
  answer?: string;
  category?: string;
  order?: number;
}

// ========== BANNER TYPES ==========

export type BannerStatus = 'ACTIVE' | 'INACTIVE';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  imageMobile?: string | null;
  imageDesktop?: string | null;
  link: string | null;
  location?: "HOME" | "BROWSE" | "FEATURED";
  type?: "APP" | "WEBSITE";
  position: number;
  startDate: string | null;
  endDate: string | null;
  status: BannerStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type BannerListItem = Banner;

export interface BannersListResponse {
  data: Banner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BannerFilters {
  page?: number;
  limit?: number;
  location?: "HOME" | "BROWSE" | "FEATURED";
  type?: "APP" | "WEBSITE";
  position?: number;
  status?: BannerStatus;
}

export interface CreateBannerPayload {
  title: string;
  subtitle: string;
  image?: string | null;
  imageMobile?: string | null;
  imageDesktop?: string | null;
  link?: string;
  location: "HOME" | "BROWSE" | "FEATURED";
  type: "APP" | "WEBSITE";
  startDate?: string;
  endDate?: string;
  status?: BannerStatus;
  order?: number;
}

export interface UpdateBannerPayload {
  title?: string;
  subtitle?: string;
  image?: string | null;
  imageMobile?: string | null;
  imageDesktop?: string | null;
  link?: string;
  location?: "HOME" | "BROWSE" | "FEATURED";
  type?: "APP" | "WEBSITE";
  startDate?: string;
  endDate?: string;
  status?: BannerStatus;
  order?: number;
}

// ========== SETTINGS TYPES ==========

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSettingPayload {
  key: string;
  value: string;
  category?: string;
  description?: string;
}

export interface SettingsByCategory {
  [category: string]: AppSetting[];
}

export interface ContactInfo {
  whatsappNumber: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  address: string;
  addressEn: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  snapchat?: string;
}

// ========== STATISTICS TYPES ==========

export interface InspectionTimelineItem {
  month: string;
  count: number;
}

export interface CarStatistics {
  published: number;
  verified: number;
  sold: number;
  bought: number;
}

export interface DashboardStats {
  monthlyRevenue: number;
  todaySalesRequests: number;
  activeInspectors: number;
  totalUsers: number;
  inspectionRequestsTimeline: InspectionTimelineItem[];
  carStatistics: CarStatistics;
}
