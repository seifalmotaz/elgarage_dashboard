// Feature-based query key factory
// Provides type-safe query keys with proper hierarchy

import type { UserFilters } from './api/users';
import type { ArticleFilters } from './api/articles';
import type { BannerFilters } from './api/banners';
import type { ContactFilters } from './api/contact';
import type { TestimonialFilters } from './api/testimonials';

export const queryKeys = {
  // Auth
  auth: {
    all: () => ['auth'] as const,
    user: () => ['auth', 'user'] as const,
  },

  // Users
  users: {
    all: () => ['users'] as const,
    list: (filters?: UserFilters) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    stats: () => ['users', 'stats'] as const,
  },

  // Inspectors
  inspectors: {
    all: () => ['inspectors'] as const,
    list: (filters?: Record<string, unknown>) => ['inspectors', 'list', filters] as const,
    detail: (id: string) => ['inspectors', 'detail', id] as const,
    stats: () => ['inspectors', 'stats'] as const,
    appointments: (inspectorId: string, filters?: Record<string, unknown>) =>
      ['inspectors', inspectorId, 'appointments', filters] as const,
    weeklyAppointments: () => ['inspectors', 'weeklyAppointments'] as const,
  },

  // Cars
  cars: {
    all: () => ['cars'] as const,
    list: (filters?: Record<string, unknown>) => ['cars', 'list', filters] as const,
    detail: (id: string) => ['cars', 'detail', id] as const,
    brands: () => ['cars', 'brands'] as const,
    models: (brandId: string) => ['cars', 'models', brandId] as const,
    features: () => ['cars', 'features'] as const,
    specs: () => ['cars', 'specs'] as const,
    cities: () => ['cars', 'cities'] as const,
    availableInspections: () => ['cars', 'availableInspections'] as const,
    viewer360: (carId: string) => ['cars', 'detail', carId, 'viewer360'] as const,
  },

  // Listing Requests / Sales Requests
  listingRequests: {
    all: () => ['listingRequests'] as const,
    list: (filters?: Record<string, unknown>) => ['listingRequests', 'list', filters] as const,
    detail: (id: string) => ['listingRequests', 'detail', id] as const,
    inspectionSections: () => ['listingRequests', 'inspectionSections'] as const,
    inspectionPublishStatus: () =>
      ['listingRequests', 'inspectionPublishStatus'] as const,
  },

  // Negotiations
  negotiations: {
    all: () => ['negotiations'] as const,
    list: (filters?: Record<string, unknown>) => ['negotiations', 'list', filters] as const,
    detail: (id: string) => ['negotiations', 'detail', id] as const,
    stats: () => ['negotiations', 'stats'] as const,
  },

  // Articles
  articles: {
    all: () => ['articles'] as const,
    list: (filters?: ArticleFilters) => ['articles', 'list', filters] as const,
    byStatus: (status: string) => ['articles', 'status', status] as const,
    byCategory: (category: string) => ['articles', 'category', category] as const,
    detail: (id: string) => ['articles', 'detail', id] as const,
    stats: () => ['articles', 'stats'] as const,
  },

  // Marketing / Banners
  banners: {
    all: () => ['banners'] as const,
    list: (filters?: BannerFilters) => ['banners', 'list', filters] as const,
    byPosition: (position: number) => ['banners', 'position', position] as const,
    byStatus: (status: string) => ['banners', 'status', status] as const,
    detail: (id: string) => ['banners', 'detail', id] as const,
  },

  // FAQ
  faq: {
    all: () => ['faq'] as const,
    list: (category?: string, search?: string, page?: number, limit?: number) =>
      ['faq', 'list', { category, search, page, limit }] as const,
    detail: (id: string) => ['faq', 'detail', id] as const,
  },

  // Testimonials / opinions
  testimonials: {
    all: () => ['testimonials'] as const,
    list: (filters?: TestimonialFilters) =>
      ['testimonials', 'list', filters] as const,
    detail: (id: string) => ['testimonials', 'detail', id] as const,
  },

  // Contact Submissions
  contact: {
    all: () => ['contact'] as const,
    list: (filters?: ContactFilters) => ['contact', 'list', filters] as const,
    detail: (id: string) => ['contact', 'detail', id] as const,
  },

  // Notifications
  notifications: {
    all: () => ['notifications'] as const,
    list: (filters?: Record<string, unknown>) => ['notifications', 'list', filters] as const,
  },

  // Settings
  settings: {
    all: () => ['settings'] as const,
    app: () => ['settings', 'app'] as const,
    category: (category: string) => ['settings', 'category', category] as const,
  },

  // Statistics
  statistics: {
    dashboard: (period?: 'day' | 'week' | 'month' | 'year') =>
      ['statistics', 'dashboard', period || 'month'] as const,
  },

  // Admin Inspections
  adminInspections: {
    all: () => ['adminInspections'] as const,
    byCar: (carId: string) => ['adminInspections', 'byCar', carId] as const,
    detail: (id: string) => ['adminInspections', 'detail', id] as const,
  },

  availability: {
    all: () => ['availability'] as const,
    rules: () => ['availability', 'rules'] as const,
    calendar: (from: string, to: string) =>
      ['availability', 'calendar', from, to] as const,
  },
} as const;