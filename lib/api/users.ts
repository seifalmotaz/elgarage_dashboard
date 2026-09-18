import { AuthMiddleware } from './generated/auth-middleware';

/**
 * User role type
 */
export type UserRole = 'USER' | 'INSPECTOR' | 'ADMIN';

/**
 * User status type
 */
export type UserStatus = 'active' | 'inactive' | 'all';

/**
 * User list item matching backend UserResponseDto
 */
export interface UserListItem {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  city: string | null;
  region: string | null;
  avatar: string | null;
  role: UserRole;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated users response matching backend UsersListResponseDto
 */
export interface UsersListResponse {
  data: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * User statistics matching backend UserStatsResponseDto
 */
export interface UserStats {
  totalUsers: number;
  users: number;
  inspectors: number;
  admins: number;
  verifiedUsers: number;
  activeUsers: number;
}

/**
 * User detail (same as UserListItem for now)
 */
export type UserDetail = UserListItem;

/**
 * Filters for listing users
 */
export interface UserFilters {
  page?: number;
  limit?: number;
  role?: UserRole | 'all';
  isActive?: boolean;
  isPhoneVerified?: boolean;
  phone?: string;
  /** Filter users registered after this date (YYYY-MM-DD) */
  fromDate?: string;
  /** Filter users registered before this date (YYYY-MM-DD) */
  toDate?: string;
}

/**
 * Payload for updating user
 */
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  region?: string;
  avatar?: string;
}

/**
 * Payload for creating a new user
 */
export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  email?: string;
  city?: string;
  region?: string;
}

/**
 * Status filter options for UI
 */
export const USER_STATUS_FILTER_OPTIONS = [
  { label: 'الكل', value: '' },
  { label: 'نشط', value: 'active' },
  { label: 'غير نشط', value: 'inactive' },
] as const;

/**
 * Status map for display badges
 */
export const USER_STATUS_MAP = {
  active: { label: 'نشط', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  inactive: { label: 'غير نشط', bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]' },
} as const;

/**
 * Role map for display badges
 */
export const USER_ROLE_MAP = {
  USER: { label: 'مستخدم', bg: 'bg-[#E0F2FE]', text: 'text-[#2563EB]' },
  INSPECTOR: { label: 'مفتش', bg: 'bg-[#FEF3C7]', text: 'text-[#CA8A04]' },
  ADMIN: { label: 'مدير', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
} as const;

/**
 * User API v2 - Using AuthMiddleware
 */
export const usersApi = {
  /**
   * Create a new user
   */
  create: async (data: CreateUserPayload): Promise<UserDetail> => {
    return AuthMiddleware.post<UserDetail>('/admin/users', data);
  },

  /**
   * Get paginated list of users with filters
   */
  getList: async (filters?: UserFilters): Promise<UsersListResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.role && filters.role !== 'all') params.set('role', filters.role);
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters?.isPhoneVerified !== undefined) params.set('isPhoneVerified', String(filters.isPhoneVerified));
    if (filters?.phone) params.set('phone', filters.phone);
    if (filters?.fromDate) params.set('fromDate', filters.fromDate);
    if (filters?.toDate) params.set('toDate', filters.toDate);

    const query = params.toString();
    const endpoint = query ? `/admin/users?${query}` : '/admin/users';

    return AuthMiddleware.get<UsersListResponse>(endpoint);
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
    return AuthMiddleware.get<UserStats>('/admin/users/stats');
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<UserDetail> => {
    return AuthMiddleware.get<UserDetail>(`/admin/users/${id}`);
  },

  /**
   * Update user profile
   */
  update: async (id: string, data: UpdateUserPayload): Promise<UserDetail> => {
    return AuthMiddleware.patch<UserDetail>(`/admin/users/${id}`, data);
  },

  /**
   * Deactivate (block) user
   */
  deactivate: async (id: string): Promise<UserDetail> => {
    return AuthMiddleware.patch<UserDetail>(`/admin/users/${id}/deactivate`);
  },

  /**
   * Activate (unblock) user
   */
  activate: async (id: string): Promise<UserDetail> => {
    return AuthMiddleware.patch<UserDetail>(`/admin/users/${id}/activate`);
  },
};