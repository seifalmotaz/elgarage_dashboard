import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  articlesApi,
  CreateArticlePayload,
  UpdateArticlePayload,
} from '@/lib/api/articles';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * Hook to create a new article
 */
export function useCreateArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticlePayload) => articlesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم إنشاء المقال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to create article', { error });
      toast.error('حدث خطأ أثناء إنشاء المقال');
    },
  });
}

/**
 * Hook to update an existing article
 */
export function useUpdateArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticlePayload }) =>
      articlesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم تحديث المقال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to update article', { error });
      toast.error('حدث خطأ أثناء تحديث المقال');
    },
  });
}

/**
 * Hook to delete an article
 */
export function useDeleteArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم حذف المقال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to delete article', { error });
      toast.error('حدث خطأ أثناء حذف المقال');
    },
  });
}

/**
 * Hook to publish an article
 */
export function usePublishArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.articles.stats() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.dashboard() });
      toast.success('تم نشر المقال بنجاح');
    },
    onError: (error: Error) => {
      logger.error('Failed to publish article', { error });
      toast.error('حدث خطأ أثناء نشر المقال');
    },
  });
}