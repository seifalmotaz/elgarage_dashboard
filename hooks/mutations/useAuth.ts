import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { AuthMiddleware } from '@/lib/api/generated/auth-middleware';
import { queryKeys } from '@/lib/query-keys';
import { AUTH_KEYS } from '@/lib/constants/auth';
import { useRouter } from 'next/navigation';
import { showError } from '@/lib/notifications';

export interface LoginCredentials {
  email: string;
  password: string;
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.adminLogin({
        email: credentials.email,
        password: credentials.password,
      });

      return response;
    },
    onSuccess: async (data) => {
      // Store tokens
      AuthMiddleware.setTokens(data.accessToken, data.refreshToken);

      // Fetch and cache user profile
      const profile = await authApi.getAdminProfile();
      
      // Update React Query cache
      queryClient.setQueryData(queryKeys.auth.user(), profile);
      
      // Store in localStorage for persistence
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(profile));

      // Redirect to dashboard
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
      showError('فشل تسجيل الدخول. تأكد من صحة البيانات');
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.adminLogout();
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API call failed:', error);
      }
    },
    onSettled: () => {
      // Clear tokens
      AuthMiddleware.clearTokens();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Remove from localStorage
      localStorage.removeItem(AUTH_KEYS.USER);

      // Redirect to login
      router.push('/login');
    },
  });
}

export function useRefreshTokenMutation() {
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      return await authApi.adminRefresh(refreshToken);
    },
    onSuccess: (data) => {
      // Store new tokens
      AuthMiddleware.setTokens(data.accessToken, data.refreshToken);
    },
  });
}

export function useGetProfileQuery() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authApi.getAdminProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}