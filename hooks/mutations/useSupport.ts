import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi, SupportContent } from '@/lib/api/support';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';

export function useUpdateSupportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SupportContent) => supportApi.saveContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category('support') });
      toast.success('تم حفظ محتوى الدعم بنجاح');
    },
    onError: () => toast.error('فشل الحفظ'),
  });
}