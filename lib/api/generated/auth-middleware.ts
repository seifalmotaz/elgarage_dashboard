import { ApiClientError } from './client.gen';
import { AUTH_KEYS } from '@/lib/constants/auth';

export class AuthMiddleware {
  private static refreshPromise: Promise<boolean> | null = null;
  private static onUnauthorized: (() => void) | null = null;
  private static tokenListeners: Set<(hasToken: boolean) => void> = new Set();

  static setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  static addTokenListener(listener: (hasToken: boolean) => void) {
    this.tokenListeners.add(listener);
  }

  static removeTokenListener(listener: (hasToken: boolean) => void) {
    this.tokenListeners.delete(listener);
  }

  private static notifyTokenListeners(hasToken: boolean) {
    this.tokenListeners.forEach((listener) => {
      try {
        listener(hasToken);
      } catch (e) {
        console.error('Error in token listener:', e);
      }
    });
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_KEYS.TOKEN);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
  }

  static setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEYS.TOKEN, accessToken);
      localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
      this.notifyTokenListeners(true);
    }
  }

  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEYS.TOKEN);
      localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_KEYS.USER);
      this.notifyTokenListeners(false);
    }
  }

  private static async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private static buildUrl(endpoint: string): string {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app').replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const prefix = '/api/v1';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let rawUrl = `${baseUrl}${prefix}${cleanEndpoint}`;
    rawUrl = rawUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
    return rawUrl.replace(/([^:])\/+/g, '$1/');
  }

  private static async doRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const url = this.buildUrl('/admin/auth/refresh');

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  static async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit & { skipAuthRefresh?: boolean } = {}
  ): Promise<T> {
    const { skipAuthRefresh, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint);
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[API] ${fetchOptions.method || 'GET'} ${endpoint}`, { hasToken: !!token });

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401 && !skipAuthRefresh) {
      const refreshed = await this.refreshToken();

      if (refreshed) {
        // Retry with new token
        return this.fetchWithAuth<T>(endpoint, { ...options, skipAuthRefresh: true });
      }

      // Refresh failed, clear tokens and redirect
      this.clearTokens();
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new ApiClientError('Unauthorized', 401);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.error(`[API Error] ${response.status}`, error);
      throw new ApiClientError(
        error.message || `HTTP error! status: ${response.status}`,
        response.status,
        error
      );
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // Handle empty responses (204 No Content, empty body, or non-JSON content)
    if (response.status === 204 || contentLength === '0') {
      return undefined as T;
    }

    // If content-type is not JSON, return undefined
    if (!contentType || !contentType.includes('application/json')) {
      return undefined as T;
    }

    try {
      return await response.json();
    } catch (error) {
      // If JSON parsing fails on an empty body, return undefined
      return undefined as T;
    }
  }

  // Convenience methods
  static get<T>(endpoint: string, options?: RequestInit & { skipAuthRefresh?: boolean }) {
    return this.fetchWithAuth<T>(endpoint, { ...options, method: 'GET' });
  }

  static post<T>(endpoint: string, data?: unknown, options?: RequestInit & { skipAuthRefresh?: boolean }) {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static patch<T>(endpoint: string, data?: unknown, options?: RequestInit & { skipAuthRefresh?: boolean }) {
    return this.fetchWithAuth<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string, options?: RequestInit & { skipAuthRefresh?: boolean }) {
    return this.fetchWithAuth<T>(endpoint, { ...options, method: 'DELETE' });
  }
}