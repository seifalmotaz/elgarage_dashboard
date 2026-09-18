const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app';
const API_PREFIX = '/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
  skipAuthRefresh?: boolean;
}

type UnauthorizedCallback = () => void;

// Re-export types from types.ts for backward compatibility
export type {
  ApiResponse,
  SpecType,
  SpecOption,
  CreateSpecTypeDto,
  CreateSpecOptionDto,
  FeatureSection,
  FeatureItem,
  CreateFeatureSectionDto,
  CreateFeatureItemDto,
  CarBrand,
  CarBrandModel,
  CreateBrandDto,
  CreateModelDto,
  Car,
  CarSpecification,
  CarFeature,
  CreateCarDto,
  UpdateCarDto,
  LoginDto,
  AuthResponse,
  User,
  OptionSemanticType,
  InspectionSection,
  InspectionQuestion,
  InspectionOption,
  CreateInspectionSectionDto,
  UpdateInspectionSectionDto,
  CreateInspectionQuestionDto,
  UpdateInspectionQuestionDto,
} from './api/types';

// Re-export SEMANTIC_COLORS
export { SEMANTIC_COLORS } from './api/types';

export class ApiClient {
  private baseUrl: string;
  private prefix: string;
  private onUnauthorized: UnauthorizedCallback | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string, prefix: string = '/api/v1') {
    this.baseUrl = baseUrl;
    this.prefix = prefix;
  }

  setUnauthorizedCallback(callback: UnauthorizedCallback) {
    this.onUnauthorized = callback;
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  private async getRefreshToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminRefreshToken');
  }

  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);
    }
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
    }
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private buildUrl(endpoint: string): string {
    const cleanBase = this.baseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const cleanPrefix = this.prefix ? `/${this.prefix.replace(/^\/+|\/+$/g, '')}` : '';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let rawUrl = `${cleanBase}${cleanPrefix}${cleanEndpoint}`;
    rawUrl = rawUrl.replace(/\/api\/v1\/api\/v1\//g, '/api/v1/');
    return rawUrl.replace(/([^:])\/+/g, '$1/');
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = await this.getRefreshToken();
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

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, skipAuthRefresh, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint);
    const authToken = token || await this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers);
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log(`[API] ${fetchOptions.method || 'GET'} ${endpoint}`, { hasToken: !!authToken });

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401 && !skipAuthRefresh) {
      const refreshed = await this.refreshToken();

      if (refreshed) {
        return this.request<T>(endpoint, { ...options, skipAuthRefresh: true });
      }

      this.clearTokens();
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.error(`[API Error] ${response.status}`, error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_PREFIX);
