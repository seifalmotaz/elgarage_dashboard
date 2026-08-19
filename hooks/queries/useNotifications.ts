import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, NotificationLogsResponse } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/query-keys';
import toast from 'react-hot-toast';

/**
 * Hook to fetch notification logs with pagination
 */
export function useNotificationLogs(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.notifications.list({ page, limit }),
    queryFn: () => notificationsApi.getLogs(page, limit),
    staleTime: 30_000,
  });
}