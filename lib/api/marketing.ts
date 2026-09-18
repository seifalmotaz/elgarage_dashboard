/**
 * @deprecated Use banners.ts instead - marketing.ts is kept for backward compatibility
 */
import { AuthMiddleware } from './generated/auth-middleware';
import type { BannerStatus } from './banners';

// Re-export BannerStatus from banners.ts
export type { BannerStatus } from './banners';

/**
 * Banner list item (legacy - use Banner from banners.ts)
 * @deprecated Use Banner from banners.ts
 */
export interface BannerListItem {
  id: string;
  image: string | null;
  title: string;
  subtitle: string;
  link: string | null;
  startDate: string | null;
  endDate: string | null;
  status: BannerStatus;
  position: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Banners response (legacy)
 * @deprecated Use BannersListResponse from banners.ts
 */
export interface BannersResponse {
  data: BannerListItem[];
  total: number;
}

/**
 * Payload for creating a banner
 * @deprecated Use CreateBannerPayload from banners.ts
 */
export interface CreateBannerPayload {
  title: string;
  subtitle: string;
  image?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  status: BannerStatus;
  position: string;
}

/**
 * Payload for updating a banner
 * @deprecated Use UpdateBannerPayload from banners.ts
 */
export interface UpdateBannerPayload {
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  status?: BannerStatus;
  position?: string;
}

/**
 * Marketing API (legacy - use bannersApi from banners.ts)
 * @deprecated Use bannersApi from banners.ts
 */
export const marketingApi = {
  /**
   * Get list of banners
   * @deprecated Use bannersApi.getList() from banners.ts
   */
  getBanners: async (): Promise<BannersResponse> => {
    return AuthMiddleware.get<BannersResponse>('/admin/banners');
  },

  /**
   * Create a new banner
   * @deprecated Use bannersApi.create() from banners.ts
   */
  createBanner: async (data: CreateBannerPayload): Promise<BannerListItem> => {
    return AuthMiddleware.post<BannerListItem>('/admin/banners', data);
  },

  /**
   * Update an existing banner
   * @deprecated Use bannersApi.update() from banners.ts
   */
  updateBanner: async (id: string, data: UpdateBannerPayload): Promise<BannerListItem> => {
    return AuthMiddleware.patch<BannerListItem>(`/admin/banners/${id}`, data);
  },

  /**
   * Delete a banner
   * @deprecated Use bannersApi.delete() from banners.ts
   */
  deleteBanner: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/banners/${id}`);
  },

  /**
   * Toggle banner active status
   * @deprecated Use bannersApi.toggleStatus() from banners.ts
   */
  toggleBanner: async (id: string, active: boolean): Promise<BannerListItem> => {
    return AuthMiddleware.patch<BannerListItem>(`/admin/banners/${id}`, {
      status: active ? 'active' : 'inactive',
    });
  },
};