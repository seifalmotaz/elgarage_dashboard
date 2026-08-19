import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Timeline item with flexible label
 */
export interface TimelineItem {
  label: string;
  count: number;
}

/**
 * Car statistics
 */
export interface CarStatistics {
  published: number;
  verified: number;
  sold: number;
  bought: number;
}

/**
 * Dashboard statistics response
 */
export interface DashboardStats {
  monthlyRevenue: number;
  todaySalesRequests: number;
  activeInspectors: number;
  totalUsers: number;
  inspectionRequestsTimeline: TimelineItem[];
  newUsersTimeline: TimelineItem[];
  cumulativeUsersTimeline: TimelineItem[];
  carStatistics: CarStatistics;
}

/**
 * Statistics API - Using AuthMiddleware
 */
export const statisticsApi = {
  /**
   * Get dashboard statistics (Admin)
   * @param period - Optional time period filter: 'day' | 'week' | 'month' | 'year'
   */
  getDashboardStats: async (period?: 'day' | 'week' | 'month' | 'year'): Promise<DashboardStats> => {
    const query = period ? `?period=${period}` : '';
    return AuthMiddleware.get<DashboardStats>(`/admin/statistics/dashboard${query}`);
  },
};