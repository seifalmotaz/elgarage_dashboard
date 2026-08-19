import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Payload for sending a push notification
 */
export interface SendNotificationPayload {
  title: string;
  body: string;
  audience: 'all' | 'active' | 'specific';
  targetUserIds?: string[];
  data?: Record<string, string>;
}

/**
 * Backend response for sending notification
 */
export interface SendNotificationResponse {
  title: string;
  body: string;
  audience: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: 'sent' | 'partial' | 'failed';
}

/**
 * Single notification log entry
 */
export interface NotificationLogItem {
  id: string;
  title: string;
  body: string;
  type: string;
  audience: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}

/**
 * Paginated notification logs response
 */
export interface NotificationLogsResponse {
  data: NotificationLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Notifications API - Using AuthMiddleware
 */
export const notificationsApi = {
  /**
   * Send a push notification
   */
  send: async (payload: SendNotificationPayload): Promise<SendNotificationResponse> => {
    return AuthMiddleware.post<SendNotificationResponse>('/admin/notifications/send', payload);
  },

  /**
   * Get notification logs with pagination
   */
  getLogs: async (page = 1, limit = 20): Promise<NotificationLogsResponse> => {
    return AuthMiddleware.get<NotificationLogsResponse>(
      `/admin/notifications/logs?page=${page}&limit=${limit}`
    );
  },
};