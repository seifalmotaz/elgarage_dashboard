import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Contact submission from the public contact form
 */
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  messageType: 'suggestion' | 'complaint' | 'inquiry';
  message: string;
  userId: string | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contact submissions list response
 */
export interface ContactSubmissionsResponse {
  data: ContactSubmission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Contact submissions filters
 */
export interface ContactFilters {
  page?: number;
  limit?: number;
  messageType?: 'suggestion' | 'complaint' | 'inquiry';
}

/**
 * Message type labels (Arabic)
 */
export const MESSAGE_TYPE_LABELS: Record<string, string> = {
  suggestion: 'اقتراح',
  complaint: 'شكوى',
  inquiry: 'استفسار',
};

/**
 * Message type filter options for dropdown
 */
export const MESSAGE_TYPE_FILTER_OPTIONS = [
  { label: 'الكل', value: '' },
  { label: 'اقتراح', value: 'suggestion' },
  { label: 'شكوى', value: 'complaint' },
  { label: 'استفسار', value: 'inquiry' },
];

/**
 * Contact API - Using AuthMiddleware
 */
export const contactApi = {
  /**
   * Get list of contact submissions (Admin)
   */
  getList: async (filters?: ContactFilters): Promise<ContactSubmissionsResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.messageType) params.set('messageType', filters.messageType);

    const query = params.toString();
    const endpoint = query ? `/admin/contact?${query}` : '/admin/contact';

    return AuthMiddleware.get<ContactSubmissionsResponse>(endpoint);
  },

  /**
   * Get a single contact submission by ID (Admin)
   */
  getById: async (id: string): Promise<ContactSubmission> => {
    return AuthMiddleware.get<ContactSubmission>(`/admin/contact/${id}`);
  },
};