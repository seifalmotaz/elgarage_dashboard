import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Article status type
 */
export type ArticleStatus = 'DRAFT' | 'PUBLISHED';

/**
 * Article list item
 */
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

/**
 * Article detail (same as Article for now)
 */
export type ArticleDetail = Article;

/**
 * Paginated articles response
 */
export interface ArticlesListResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filters for listing articles
 */
export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: ArticleStatus;
  search?: string;
  /** Filter articles published/created after this date (YYYY-MM-DD) */
  fromDate?: string;
  /** Filter articles published/created before this date (YYYY-MM-DD) */
  toDate?: string;
}

/**
 * Payload for creating an article
 */
export interface CreateArticlePayload {
  title: string;
  description: string;
  content: string;
  image?: string;
  category: string;
  status?: ArticleStatus;
}

/**
 * Payload for updating an article
 */
export interface UpdateArticlePayload {
  title?: string;
  description?: string;
  content?: string;
  image?: string;
  category?: string;
  status?: ArticleStatus;
}

/**
 * Articles API - Using AuthMiddleware
 */
export const articlesApi = {
  /**
   * Get paginated list of articles with filters (Admin)
   */
  getList: async (filters?: ArticleFilters): Promise<ArticlesListResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.fromDate) params.set('fromDate', filters.fromDate);
    if (filters?.toDate) params.set('toDate', filters.toDate);

    const query = params.toString();
    const endpoint = query ? `/admin/articles?${query}` : '/admin/articles';

    return AuthMiddleware.get<ArticlesListResponse>(endpoint);
  },

  /**
   * Get article statistics (Admin)
   */
  getStats: async (): Promise<{ total: number; published: number; draft: number }> => {
    return AuthMiddleware.get<{ total: number; published: number; draft: number }>('/admin/articles/stats');
  },

  /**
   * Get article by ID (Admin)
   */
  getById: async (id: string): Promise<ArticleDetail> => {
    return AuthMiddleware.get<ArticleDetail>(`/admin/articles/${id}`);
  },

  /**
   * Create a new article (Admin)
   */
  create: async (data: CreateArticlePayload): Promise<ArticleDetail> => {
    return AuthMiddleware.post<ArticleDetail>('/admin/articles', data);
  },

  /**
   * Update an existing article (Admin)
   */
  update: async (id: string, data: UpdateArticlePayload): Promise<ArticleDetail> => {
    return AuthMiddleware.patch<ArticleDetail>(`/admin/articles/${id}`, data);
  },

  /**
   * Delete an article (Admin)
   */
  delete: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/articles/${id}`);
  },

  /**
   * Publish an article (Admin)
   */
  publish: async (id: string): Promise<ArticleDetail> => {
    return AuthMiddleware.patch<ArticleDetail>(`/admin/articles/${id}/publish`);
  },

  /**
   * Get public paginated list of articles
   */
  getPublicList: async (filters?: ArticleFilters): Promise<ArticlesListResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString();
    const endpoint = query ? `/articles?${query}` : '/articles';

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get public article by ID
   */
  getPublicById: async (id: string): Promise<ArticleDetail> => {
    const response = await fetch(`/articles/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    return response.json();
  },
};