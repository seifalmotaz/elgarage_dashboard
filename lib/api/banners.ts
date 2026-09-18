import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Banner status type
 */
export type BannerStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Banner item
 */
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  imageMobile?: string | null;
  imageDesktop?: string | null;
  link: string | null;
  location?: "HOME" | "BROWSE" | "FEATURED" | "SELL";
  type?: "APP" | "WEBSITE";
  position: number;
  startDate: string | null;
  endDate: string | null;
  status: BannerStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Alias for Banner (for compatibility)
 */
export type BannerListItem = Banner;

/**
 * Paginated banners response
 */
export interface BannersListResponse {
  data: Banner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filters for listing banners
 */
export interface BannerFilters {
  page?: number;
  limit?: number;
  location?: "HOME" | "BROWSE" | "FEATURED" | "SELL";
  type?: "APP" | "WEBSITE";
  position?: number;
  status?: BannerStatus;
}

/**
 * Payload for creating a banner
 */
export interface CreateBannerPayload {
  title: string;
  subtitle?: string;
  image?: string | null;
  imageMobile?: string | null;
  imageDesktop?: string | null;
  link?: string;
  location: "HOME" | "BROWSE" | "FEATURED" | "SELL";
  type: "APP" | "WEBSITE";
  startDate?: string;
  endDate?: string;
  status?: BannerStatus;
  order?: number;
}

/**
 * Payload for updating a banner
 */
export interface UpdateBannerPayload {
  title?: string;
  subtitle?: string;
  image?: string | null;
  imageMobile?: string | null;
  imageDesktop?: string | null;
  link?: string;
  location?: "HOME" | "BROWSE" | "FEATURED" | "SELL";
  type?: "APP" | "WEBSITE";
  startDate?: string;
  endDate?: string;
  status?: BannerStatus;
  order?: number;
}

/**
 * Banners API - Using AuthMiddleware
 */
export const bannersApi = {
  /**
   * Get list of banners (Admin)
   */
  getList: async (filters?: BannerFilters): Promise<BannersListResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.location) params.set('location', filters.location);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.position) params.set('position', String(filters.position));
    if (filters?.status) params.set('status', filters.status);

    const query = params.toString();
    const endpoint = query ? `/admin/banners?${query}` : '/admin/banners';

    return AuthMiddleware.get<BannersListResponse>(endpoint);
  },

  /**
   * Get banner by ID (Admin)
   */
  getById: async (id: string): Promise<Banner> => {
    return AuthMiddleware.get<Banner>(`/admin/banners/${id}`);
  },

  /**
   * Create a new banner (Admin)
   */
  create: async (data: CreateBannerPayload): Promise<Banner> => {
    return AuthMiddleware.post<Banner>('/admin/banners', data);
  },

  /**
   * Update an existing banner (Admin)
   */
  update: async (id: string, data: UpdateBannerPayload): Promise<Banner> => {
    return AuthMiddleware.patch<Banner>(`/admin/banners/${id}`, data);
  },

  /**
   * Delete a banner (Admin)
   */
  delete: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/banners/${id}`);
  },

  /**
   * Toggle banner status (Admin)
   */
  toggleStatus: async (id: string, status: BannerStatus): Promise<Banner> => {
    return AuthMiddleware.patch<Banner>(`/admin/banners/${id}/toggle`, { status });
  },

  /**
   * Get active banners by position (Public)
   */
  getActiveByPosition: async (position: number): Promise<{ data: Banner[] }> => {
    const response = await fetch(`/banners?position=${position}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }
    return response.json();
  },
};