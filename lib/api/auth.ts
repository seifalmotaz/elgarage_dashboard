import { AuthMiddleware } from './generated/auth-middleware';
import type { paths, components } from './generated/types.gen';

// Extract types from generated OpenAPI schema
type LoginRequest = paths['/api/v1/auth/login']['post']['requestBody']['content']['application/json'];
type AdminLoginRequest = paths['/api/v1/admin/auth/login']['post']['requestBody']['content']['application/json'];
type AuthResponse = paths['/api/v1/auth/login']['post']['responses']['200']['content']['application/json'];
type UserProfile = paths['/api/v1/auth/me']['get']['responses']['200']['content']['application/json'];

// Recovery flow DTOs
export type ForgotPasswordDto = components['schemas']['ForgotPasswordDto'];
export type VerifyOtpDto = components['schemas']['VerifyOtpDto'];
export type ResendOtpDto = components['schemas']['ResendOtpDto'];
export type ResetPasswordDto = components['schemas']['ResetPasswordDto'];
export type OtpResponseDto = components['schemas']['OtpResponseDto'];
export type VerifyOtpResponseDto = components['schemas']['VerifyOtpResponseDto'];
export type MessageResponseDto = components['schemas']['MessageResponseDto'];

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  avatar?: string;
}

export const authApi = {
  // Admin login
  adminLogin: (data: AdminLoginRequest) =>
    AuthMiddleware.post<AuthResponse>('/admin/auth/login', data),

  // User login (if needed)
  login: (data: LoginRequest) =>
    AuthMiddleware.post<AuthResponse>('/auth/login', data),

  // Admin refresh token
  adminRefresh: (refreshToken: string) =>
    AuthMiddleware.post<AuthResponse>('/admin/auth/refresh', { refreshToken }, { skipAuthRefresh: true }),

  // User refresh token
  refresh: (refreshToken: string) =>
    AuthMiddleware.post<AuthResponse>('/auth/refresh', { refreshToken }),

  // Admin logout
  adminLogout: () =>
    AuthMiddleware.post<{ message: string }>('/admin/auth/logout', undefined, { skipAuthRefresh: true }),

  // User logout
  logout: (refreshToken: string) =>
    AuthMiddleware.post<{ message: string }>('/auth/logout', { refreshToken }),

  // Get admin profile
  getAdminProfile: () =>
    AuthMiddleware.get<AdminUser>('/admin/auth/me'),

  // Get user profile
  getProfile: () =>
    AuthMiddleware.get<UserProfile>('/auth/me'),

  // Password recovery flow
  forgotPassword: (data: ForgotPasswordDto) =>
    AuthMiddleware.post<OtpResponseDto>('/auth/forgot-password', data, { skipAuthRefresh: true }),

  verifyOtp: (data: VerifyOtpDto) =>
    AuthMiddleware.post<VerifyOtpResponseDto>('/auth/verify-otp', data, { skipAuthRefresh: true }),

  resendOtp: (data: ResendOtpDto) =>
    AuthMiddleware.post<OtpResponseDto>('/auth/resend-otp', data, { skipAuthRefresh: true }),

  resetPassword: (data: ResetPasswordDto) =>
    AuthMiddleware.post<MessageResponseDto>('/auth/reset-password', data, { skipAuthRefresh: true }),
};