import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, UpsertSettingPayload } from '@/lib/api/settings';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Hook to upsert a single setting
 */
export function useUpsertSettingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpsertSettingPayload }) =>
      settingsApi.upsert(key, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category("contact") });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category("social") });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category("branding") });
      if (variables.key === 'car_highlight_strip') {
        queryClient.invalidateQueries({ queryKey: queryKeys.carHighlightStrip() });
      }
      toast.success('تم حفظ الإعداد بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to upsert setting', { error });
      toast.error('حدث خطأ أثناء حفظ الإعداد');
    },
  });
}

/**
 * Hook to bulk update settings
 */
export function useBulkUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: UpsertSettingPayload[]) =>
      settingsApi.bulkUpdate(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category("contact") });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category("social") });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.category("branding") });
      toast.success('تم حفظ الإعدادات بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to bulk update settings', { error });
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    },
  });
}