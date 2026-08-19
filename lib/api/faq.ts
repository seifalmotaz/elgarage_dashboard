import { AuthMiddleware } from './generated/auth-middleware';

/**
 * FAQ item
 */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  questionEn?: string | null;
  answerEn?: string | null;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Alias for FAQ item (for compatibility)
 */
export type FAQListItem = FAQ;

/**
 * FAQs response
 */
export interface FAQsResponse {
  data: FAQ[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Payload for creating a FAQ
 */
export interface CreateFAQPayload {
  question: string;
  answer: string;
  questionEn?: string;
  answerEn?: string;
  category: string;
  order?: number;
}

/**
 * Payload for updating a FAQ
 */
export interface UpdateFAQPayload {
  question?: string;
  answer?: string;
  questionEn?: string | null;
  answerEn?: string | null;
  category?: string;
  order?: number;
}

/**
 * FAQ API - Using AuthMiddleware
 */
export const faqApi = {
  /**
   * Get list of FAQs (Admin)
   */
  getList: async (category?: string, search?: string, page?: number, limit?: number): Promise<FAQsResponse> => {
    const params = new URLSearchParams();

    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));

    const query = params.toString();
    const endpoint = query ? `/admin/faq?${query}` : '/admin/faq';

    return AuthMiddleware.get<FAQsResponse>(endpoint);
  },

  /**
   * Get FAQ by ID (Admin)
   */
  getById: async (id: string): Promise<FAQ> => {
    return AuthMiddleware.get<FAQ>(`/admin/faq/${id}`);
  },

  /**
   * Create a new FAQ (Admin)
   */
  create: async (data: CreateFAQPayload): Promise<FAQ> => {
    return AuthMiddleware.post<FAQ>('/admin/faq', data);
  },

  /**
   * Update an existing FAQ (Admin)
   */
  update: async (id: string, data: UpdateFAQPayload): Promise<FAQ> => {
    return AuthMiddleware.patch<FAQ>(`/admin/faq/${id}`, data);
  },

  /**
   * Delete a FAQ (Admin)
   */
  delete: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/faq/${id}`);
  },

  /**
   * Reorder FAQs (Admin)
   */
  reorder: async (ids: string[]): Promise<FAQ[]> => {
    return AuthMiddleware.post<FAQ[]>('/admin/faq/reorder', { ids });
  },

  /**
   * Get public list of FAQs
   */
  getPublicList: async (category?: string): Promise<FAQsResponse> => {
    const endpoint = category ? `/faq?category=${category}` : '/faq';
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch FAQs: ${response.statusText}`);
    }
    return response.json();
  },
};