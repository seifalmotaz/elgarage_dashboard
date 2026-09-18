import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, SendNotificationPayload } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/query-keys';
import toast from 'react-hot-toast';

export function useSendNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendNotificationPayload) => notificationsApi.send(payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      if (result.status === 'sent') {
        toast.success(`تم قبول الإشعار لـ ${result.sentCount} جهاز`);
      } else if (result.status === 'partial') {
        toast(`تم الإرسال جزئياً: ${result.sentCount} نجح و${result.failedCount} فشل`);
      } else if (result.status === 'no_recipients') {
        toast('لا توجد أجهزة نشطة ضمن الجمهور المختار');
      } else {
        toast.error('فشل إرسال الإشعار. تحقق من إعدادات Firebase.');
      }
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
