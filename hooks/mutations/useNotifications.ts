import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, SendNotificationPayload } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/query-keys';
import toast from 'react-hot-toast';

export function useSendNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendNotificationPayload) => notificationsApi.send(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      toast.success('تم إرسال الإشعار بنجاح');
    },
    onError: (error: any) => {
      if (error?.status === 404) {
        toast.error('خدمة الإشعارات غير متوفرة حالياً');
      } else {
        toast.error(error?.message || 'فشل إرسال الإشعار');
      }
    },
  });
}