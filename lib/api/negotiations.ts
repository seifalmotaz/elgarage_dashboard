import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Negotiation status type
 */
export type NegotiationStatus = 'PENDING' | 'CONNECTED' | 'COMPLETED' | 'CANCELLED';

/**
 * Negotiation item from backend
 */
export interface Negotiation {
  id: string;
  carId: string;
  buyerId: string;
  askingPrice: number;
  initialOffer: number;
  finalPrice: number | null;
  status: NegotiationStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  connectedAt: string | null;
  completedAt: string | null;
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images: string[];
  };
  buyer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
}

/**
 * Legacy alias for NegotiationFilters
 */
export interface NegotiationFilters {
  page?: number;
  limit?: number;
  status?: NegotiationStatus;
  search?: string;
}

/**
 * Legacy alias for NegotiationStats
 */
export interface NegotiationStats {
  total: number;
  pending: number;
  connected: number;
  completed: number;
  cancelled: number;
}

/**
 * Paginated negotiations response matching backend response format
 */
export interface NegotiationsListResponse {
  items: Negotiation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Payload for updating a negotiation
 */
export interface UpdateNegotiationPayload {
  status?: NegotiationStatus;
  adminNotes?: string;
  finalPrice?: number;
}

/**
 * Payload for completing a negotiation with final price
 */
export interface CompleteNegotiationPayload {
  finalPrice: number;
}

/**
 * Negotiation API v2 - Using AuthMiddleware
 */
export const negotiationsApi = {
  /**
   * Get paginated list of negotiations with optional filters
   */
  getList: async (filters?: NegotiationFilters): Promise<NegotiationsListResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString();
    const endpoint = query ? `/admin/negotiations?${query}` : '/admin/negotiations';

    return AuthMiddleware.get<NegotiationsListResponse>(endpoint);
  },

  /**
   * Get negotiation details by ID
   */
  getById: async (id: string): Promise<Negotiation> => {
    return AuthMiddleware.get<Negotiation>(`/admin/negotiations/${id}`);
  },

  /**
   * Update a negotiation
   */
  update: async (id: string, data: UpdateNegotiationPayload): Promise<Negotiation> => {
    return AuthMiddleware.patch<Negotiation>(`/admin/negotiations/${id}`, data);
  },

  /**
   * Complete a negotiation with final price
   */
  complete: async (id: string, data: CompleteNegotiationPayload): Promise<Negotiation> => {
    return AuthMiddleware.post<Negotiation>(`/admin/negotiations/${id}/complete`, data);
  },

  /**
   * Get negotiation statistics
   */
  getStats: async (): Promise<NegotiationStats> => {
    return AuthMiddleware.get<NegotiationStats>('/admin/negotiations/stats');
  },
};