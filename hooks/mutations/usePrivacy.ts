import { useMutation, useQueryClient } from '@tanstack/react-query';
import { privacyApi, PrivacyContent } from '@/lib/api/privacy';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';

export function useUpdatePrivacyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PrivacyContent) => privacyApi.saveContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category('privacy') });
      toast.success('تم حفظ محتوى الخصوصية بنجاح');
    },
    onError: () => toast.error('فشل الحفظ'),
  });
}