import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, CreateUserPayload, UpdateUserPayload } from '@/lib/api/users';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Hook to update user information
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      usersApi.update(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Update the user detail in cache
      queryClient.setQueryData(queryKeys.users.detail(id), updatedUser);

      // Invalidate the users list and stats to ensure they reflect the change
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });

      toast.success('تم تحديث البيانات بنجاح');
    },
    onError: (error: Error, { id }) => {
      logger.error('Failed to update user', { id, error });
      toast.error('حدث خطأ أثناء تحديث البيانات');
    },
  });
}

/**
 * Hook to activate a user account
 */
export function useActivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.activate(userId),
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(userId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.users.detail(userId), (old: any) => ({
        ...old,
        isActive: true,
      }));

      // Return context with rollback data
      return { previousUser };
    },
    onError: (error: Error, userId, context) => {
      // Rollback to previous value on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser);
      }
      logger.error('Failed to activate user', { userId, error });
      toast.error('حدث خطأ أثناء تفعيل الحساب');
    },
    onSuccess: (data, userId) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.users.detail(userId), data);

      // Invalidate list and stats to reflect the change
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });

      toast.success('تم تفعيل الحساب بنجاح');
    },
  });
}

/**
 * Hook to deactivate (block) a user account
 */
export function useDeactivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(userId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.users.detail(userId), (old: any) => ({
        ...old,
        isActive: false,
      }));

      // Return context with rollback data
      return { previousUser };
    },
    onError: (error: Error, userId, context) => {
      // Rollback to previous value on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser);
      }
      logger.error('Failed to deactivate user', { userId, error });
      toast.error('حدث خطأ أثناء إلغاء تفعيل الحساب');
    },
    onSuccess: (data, userId) => {
      // Update with server response
      queryClient.setQueryData(queryKeys.users.detail(userId), data);

      // Invalidate list and stats to reflect the change
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });

      toast.success('تم إلغاء تفعيل الحساب بنجاح');
    },
  });
}

/**
 * Hook to create a new user account
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersApi.create(data),
    onSuccess: () => {
      // Invalidate list and stats to reflect the new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });

      toast.success('تم إنشاء الحساب بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create user', { error });
      toast.error('حدث خطأ أثناء إنشاء الحساب');
    },
  });
}