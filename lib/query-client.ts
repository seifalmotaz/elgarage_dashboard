import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { showError } from './notifications';

const DEFAULT_STALE_TIME = 30_000; // 30 seconds
const DEFAULT_CACHE_TIME = 5 * 60_000; // 5 minutes

export const defaultQueryClientOptions: DefaultOptions = {
  queries: {
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_CACHE_TIME,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode >= 400 && statusCode < 500) {
          return false;
        }
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false,
    onError: (error) => {
      console.error('Mutation error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      showError(message);
    },
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryClientOptions,
  });
}