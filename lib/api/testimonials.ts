import { AuthMiddleware } from './generated/auth-middleware';

export interface Testimonial {
  id: string;
  name: string;
  carInfo: string | null;
  comment: string;
  avatar: string | null;
  bgImage: string | null;
  rating: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialsListResponse {
  data: Testimonial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TestimonialFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateTestimonialPayload {
  name: string;
  carInfo?: string;
  comment: string;
  avatar?: string;
  bgImage?: string;
  rating?: number;
  order?: number;
  isActive?: boolean;
}

export interface UpdateTestimonialPayload {
  name?: string;
  /** Pass null to clear */
  carInfo?: string | null;
  comment?: string;
  /** Pass null to clear */
  avatar?: string | null;
  /** Pass null to clear */
  bgImage?: string | null;
  /** Pass null to clear */
  rating?: number | null;
  order?: number;
  isActive?: boolean;
}

export const testimonialsApi = {
  getList: async (
    filters?: TestimonialFilters,
  ): Promise<TestimonialsListResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.search) params.set('search', filters.search);
    if (filters?.isActive !== undefined) {
      params.set('isActive', String(filters.isActive));
    }

    const query = params.toString();
    const endpoint = query
      ? `/admin/testimonials?${query}`
      : '/admin/testimonials';

    return AuthMiddleware.get<TestimonialsListResponse>(endpoint);
  },

  getById: async (id: string): Promise<Testimonial> => {
    return AuthMiddleware.get<Testimonial>(`/admin/testimonials/${id}`);
  },

  create: async (data: CreateTestimonialPayload): Promise<Testimonial> => {
    return AuthMiddleware.post<Testimonial>('/admin/testimonials', data);
  },

  update: async (
    id: string,
    data: UpdateTestimonialPayload,
  ): Promise<Testimonial> => {
    return AuthMiddleware.patch<Testimonial>(`/admin/testimonials/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/testimonials/${id}`);
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Testimonial> => {
    return AuthMiddleware.patch<Testimonial>(
      `/admin/testimonials/${id}/toggle`,
      { isActive },
    );
  },

  reorder: async (ids: string[]): Promise<Testimonial[]> => {
    return AuthMiddleware.post<Testimonial[]>('/admin/testimonials/reorder', {
      ids,
    });
  },
};
