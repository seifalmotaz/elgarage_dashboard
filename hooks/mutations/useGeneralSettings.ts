import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generalSettingsApi, GeneralSettings } from '@/lib/api/general-settings';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';

export function useUpdateGeneralSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GeneralSettings) => generalSettingsApi.saveSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category('general') });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: () => toast.error('فشل الحفظ'),
  });
}