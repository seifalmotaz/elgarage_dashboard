import { AuthMiddleware } from './generated/auth-middleware';

// Re-export ApiResponse interface for backward compatibility
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Re-export AuthMiddleware methods with backward-compatible signatures
// This allows gradual migration - old code can use v2Client, new code can use AuthMiddleware directly
export const v2Client = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    AuthMiddleware.get<T>(endpoint, options),
  
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => 
    AuthMiddleware.post<T>(endpoint, data, options),
  
  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) => 
    AuthMiddleware.patch<T>(endpoint, data, options),
  
  delete: <T>(endpoint: string, options?: RequestInit) => 
    AuthMiddleware.delete<T>(endpoint, options),
  
  // Expose auth methods for AuthContext integration
  setUnauthorizedCallback: (callback: () => void) => 
    AuthMiddleware.setUnauthorizedCallback(callback),
  
  setTokens: (accessToken: string, refreshToken: string) => 
    AuthMiddleware.setTokens(accessToken, refreshToken),
  
  clearTokens: () => 
    AuthMiddleware.clearTokens(),
  
  getToken: () => 
    AuthMiddleware.getToken(),
  
  getRefreshToken: () => 
    AuthMiddleware.getRefreshToken(),
};

// Re-export types from generated
export type { paths, components } from './generated/types.gen';
export type { ApiClientError } from './generated/client.gen';