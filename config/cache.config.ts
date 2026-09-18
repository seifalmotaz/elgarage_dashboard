/**
 * Cache configuration for React Query
 * Values can be overridden via environment variables
 */
export const cacheConfig = {
  // Stale time: How long data is considered fresh
  staleTime: Number(process.env.NEXT_PUBLIC_QUERY_STALE_TIME) || 30000, // 30 seconds

  // Cache time: How long unused data stays in memory
  cacheTime: Number(process.env.NEXT_PUBLIC_QUERY_CACHE_TIME) || 300000, // 5 minutes

  // Refetch interval: How often to automatically refetch data
  refetchInterval: Number(process.env.NEXT_PUBLIC_STATS_REFETCH_INTERVAL) || 300000, // 5 minutes

  // Specific overrides for different data types
  overrides: {
    // Static data (less frequent updates)
    settings: {
      staleTime: 60000, // 1 minute
      cacheTime: 600000, // 10 minutes
    },

    // Frequently changing data
    statistics: {
      staleTime: 60000, // 1 minute
      refetchInterval: 300000, // 5 minutes
    },

    // User-generated content
    articles: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    },
  },
} as const;