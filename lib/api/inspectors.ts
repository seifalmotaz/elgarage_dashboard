import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Inspector status type
 */
export type InspectorStatusFilter = 'active' | 'inactive' | 'all';

/**
 * Inspector list item matching backend InspectorResponseDto
 */
export interface InspectorListItem {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  email: string | null;
  avatar: string | null;
  city: string | null;
  region: string | null;
  isActive: boolean;
  createdAt: string;
  stats: InspectorStats;
}

/**
 * Inspector statistics
 */
export interface InspectorStats {
  totalInspections: number;
  completed: number;
  inProgress: number;
  cancelled: number;
}

/**
 * Paginated inspectors response
 */
export interface PaginatedInspectorsResponse {
  items: InspectorListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  activeCount: number;
}

/**
 * Inspector dashboard statistics
 */
export interface InspectorDashboardStats {
  totalInspectors: number;
  activeInspectors: number;
  totalCompletedInspections: number;
  scheduledToday: number;
  availableNow: number;
}

/**
 * Filters for listing inspectors
 */
export interface InspectorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: InspectorStatusFilter;
}

/**
 * Appointment client info
 */
export interface AppointmentClient {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
}

/**
 * Inspector appointment item
 */
export interface Appointment {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  user: AppointmentClient;
  address: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

/**
 * Inspector appointments response
 */
export interface InspectorAppointmentsResponse {
  appointments: Appointment[];
  total: number;
}

/**
 * Weekly appointment item
 */
export interface WeeklyAppointmentItem {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  user: AppointmentClient;
  address: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  assignedInspector?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

/**
 * Weekly appointments response
 */
export interface WeeklyAppointmentsResponse {
  items: WeeklyAppointmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Filters for inspector appointments
 */
export interface InspectorAppointmentFilters {
  fromDate?: string;
  toDate?: string;
}

/**
 * Payload for creating a new inspector
 */
export interface CreateInspectorPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  email?: string;
  city?: string;
  region?: string;
}

/**
 * Payload for updating an inspector
 */
export interface UpdateInspectorPayload {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string;
  city?: string;
  region?: string;
  isActive?: boolean;
}

/**
 * Inspectors API v2 - Using AuthMiddleware
 */
export const inspectorsApi = {
  /**
   * Get paginated list of inspectors with filters
   */
  getList: async (filters?: InspectorFilters): Promise<PaginatedInspectorsResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.search) params.set('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);

    const query = params.toString();
    const endpoint = query ? `/admin/inspectors?${query}` : '/admin/inspectors';

    return AuthMiddleware.get<PaginatedInspectorsResponse>(endpoint);
  },

  /**
   * Get inspector statistics
   */
  getStats: async (): Promise<InspectorDashboardStats> => {
    return AuthMiddleware.get<InspectorDashboardStats>('/admin/inspectors/stats');
  },

  /**
   * Get inspector by ID
   */
  getById: async (id: string): Promise<InspectorListItem> => {
    return AuthMiddleware.get<InspectorListItem>(`/admin/inspectors/${id}`);
  },

  /**
   * Get appointments for a specific inspector
   */
  getAppointments: async (
    inspectorId: string,
    filters?: InspectorAppointmentFilters
  ): Promise<InspectorAppointmentsResponse> => {
    const params = new URLSearchParams();

    if (filters?.fromDate) params.set('fromDate', filters.fromDate);
    if (filters?.toDate) params.set('toDate', filters.toDate);

    const query = params.toString();
    const endpoint = query
      ? `/admin/inspectors/${inspectorId}/appointments?${query}`
      : `/admin/inspectors/${inspectorId}/appointments`;

    return AuthMiddleware.get<InspectorAppointmentsResponse>(endpoint);
  },

  /**
   * Get weekly appointments calendar
   */
  getWeeklyAppointments: async (
    startDate: Date,
    endDate: Date
  ): Promise<WeeklyAppointmentsResponse> => {
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const query = `?fromDate=${formatDate(startDate)}&toDate=${formatDate(endDate)}`;

    return AuthMiddleware.get<WeeklyAppointmentsResponse>(`/admin/listing-requests${query}`);
  },

  /**
   * Create a new inspector
   */
  create: async (data: CreateInspectorPayload): Promise<{ id: string }> => {
    return AuthMiddleware.post<{ id: string }>('/admin/users/inspector', data);
  },

  /**
   * Update an inspector
   */
  update: async (id: string, data: UpdateInspectorPayload): Promise<InspectorListItem> => {
    return AuthMiddleware.patch<InspectorListItem>(`/admin/inspectors/${id}`, data);
  },

  /**
   * Appoint an inspector to a listing request
   */
  appointToRequest: async (
    inspectorId: string,
    requestId: string
  ): Promise<{ id: string }> => {
    return AuthMiddleware.post<{ id: string }>(
      `/admin/listing-requests/${requestId}/appoint`,
      { assignedInspectorId: inspectorId }
    );
  },
};

/**
 * Create an appointment for an inspector
 */
export async function createAppointment(data: {
  userId: string;
  assignedInspectorId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  address: string;
  latitude: number;
  longitude: number;
  scheduledDate: string;
  scheduledTime: string;
}): Promise<{ id: string }> {
  return AuthMiddleware.post<{ id: string }>(
    '/admin/listing-requests',
    data
  );
}

/**
 * Search users by phone or name
 */
export async function searchUsers(
  query: string
): Promise<Array<{ id: string; firstName: string | null; lastName: string | null; phone: string }>> {
  const params = new URLSearchParams();
  params.set('search', query);
  
  return AuthMiddleware.get(`/admin/users/search?${params.toString()}`);
}