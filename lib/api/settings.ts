import { AuthMiddleware } from './generated/auth-middleware';

/**
 * App Setting item
 */
export interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for upserting a setting
 */
export interface UpsertSettingPayload {
  key: string;
  value: string;
  category?: string;
  description?: string;
}

/**
 * Settings grouped by category
 */
export interface SettingsByCategory {
  [category: string]: AppSetting[];
}

/**
 * Contact info response (Public) — matches GET /settings/contact
 */
export interface ContactInfo {
  whatsappNumber: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  address: string;
  addressEn: string;
}

/**
 * Social links response (Public) — matches GET /settings/social
 */
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  snapchat?: string;
}

/**
 * Branding / about response (Public) — matches GET /settings/branding
 */
export interface BrandingInfo {
  logoUrl: string;
  tagline: string;
  projectName: string;
  vision: string;
  mission: string;
}

/**
 * Settings API - Using AuthMiddleware
 */
export const settingsApi = {
  /**
   * Get all settings (Admin)
   */
  getAll: async (): Promise<AppSetting[]> => {
    return AuthMiddleware.get<AppSetting[]>('/admin/settings');
  },

  /**
   * Get settings by category (Admin)
   */
  getByCategory: async (category: string): Promise<AppSetting[]> => {
    return AuthMiddleware.get<AppSetting[]>(`/admin/settings/${category}`);
  },

  /**
   * Upsert a setting (Admin)
   */
  upsert: async (key: string, data: UpsertSettingPayload): Promise<AppSetting> => {
    return AuthMiddleware.patch<AppSetting>(`/admin/settings/${key}`, data);
  },

  /**
   * Bulk update settings (Admin)
   */
  bulkUpdate: async (settings: UpsertSettingPayload[]): Promise<AppSetting[]> => {
    return AuthMiddleware.post<AppSetting[]>('/admin/settings/bulk', { settings });
  },

  /**
   * Get contact info (Public)
   */
  getContactInfo: async (): Promise<ContactInfo> => {
    return AuthMiddleware.get<ContactInfo>('/settings/contact');
  },

  /**
   * Get social links (Public)
   */
  getSocialLinks: async (): Promise<SocialLinks> => {
    return AuthMiddleware.get<SocialLinks>('/settings/social');
  },

  getHighlightStrip: async (): Promise<HighlightStripConfig> => {
    return AuthMiddleware.get<HighlightStripConfig>(
      '/settings/car-highlight-strip',
    );
  },
};

export type HighlightStripSource = 'spec' | 'car_field';

export interface HighlightStripItem {
  id: string;
  source: HighlightStripSource;
  key: string;
  enabled: boolean;
  iconUrl: string | null;
  name: string;
  nameEn: string | null;
}

export interface HighlightStripConfig {
  items: HighlightStripItem[];
}