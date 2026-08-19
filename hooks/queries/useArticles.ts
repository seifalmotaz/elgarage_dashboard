import { useQuery } from '@tanstack/react-query';
import { articlesApi, ArticleFilters } from '@/lib/api/articles';
import { queryKeys } from '@/lib/query-keys';
import { cacheConfig } from '@/config/cache.config';

/**
 * Hook to fetch paginated list of articles with filters
 */
export function useArticles(filters?: ArticleFilters) {
  return useQuery({
    queryKey: queryKeys.articles.list(filters),
    queryFn: () => articlesApi.getList(filters),
    staleTime: cacheConfig.overrides.articles.staleTime,
    gcTime: cacheConfig.overrides.articles.cacheTime,
  });
}

/**
 * Hook to fetch a single article by ID
 */
export function useArticle(id: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(id),
    queryFn: () => articlesApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch article statistics
 */
export function useArticlesStats() {
  return useQuery({
    queryKey: queryKeys.articles.stats(),
    queryFn: () => articlesApi.getStats(),
    staleTime: 60_000, // 1 minute
  });
}