import { AuthMiddleware } from './generated/auth-middleware';
import type { CarBrand, CarBrandModel, CreateBrandDto, CreateModelDto } from './types';

// Re-export types for convenience
export type { CarBrand, CarBrandModel, CreateBrandDto, CreateModelDto };

/**
 * Car Brands API v2 - Using AuthMiddleware
 */
export const carBrandsApi = {
  /**
   * Get all car brands with their models
   */
  getList: async (): Promise<CarBrand[]> => {
    return AuthMiddleware.get<CarBrand[]>('/admin/car-brands');
  },

  /**
   * Get models for a specific brand
   */
  getModels: async (brandId: string): Promise<CarBrandModel[]> => {
    return AuthMiddleware.get<CarBrandModel[]>(`/admin/car-brands/${brandId}/models`);
  },

  /**
   * Create a new brand
   */
  createBrand: async (data: CreateBrandDto): Promise<CarBrand> => {
    return AuthMiddleware.post<CarBrand>('/admin/car-brands', data);
  },

  /**
   * Update a brand
   */
  updateBrand: async (id: string, data: Partial<CreateBrandDto>): Promise<CarBrand> => {
    return AuthMiddleware.patch<CarBrand>(`/admin/car-brands/${id}`, data);
  },

  /**
   * Delete a brand
   */
  deleteBrand: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/car-brands/${id}`);
  },

  /**
   * Reorder brands
   */
  reorderBrands: async (brandIds: string[]): Promise<void> => {
    return AuthMiddleware.post<void>('/admin/car-brands/reorder', { brandIds });
  },

  /**
   * Create a model for a brand
   */
  createModel: async (brandId: string, data: CreateModelDto): Promise<CarBrandModel> => {
    return AuthMiddleware.post<CarBrandModel>(`/admin/car-brands/${brandId}/models`, data);
  },

  /**
   * Update a model
   */
  updateModel: async (id: string, data: Partial<CreateModelDto>): Promise<CarBrandModel> => {
    return AuthMiddleware.patch<CarBrandModel>(`/admin/car-models/${id}`, data);
  },

  /**
   * Delete a model
   */
  deleteModel: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/car-models/${id}`);
  },

  /**
   * Reorder models for a brand
   */
  reorderModels: async (brandId: string, modelIds: string[]): Promise<void> => {
    return AuthMiddleware.post<void>(`/admin/car-brands/${brandId}/models/reorder`, { modelIds });
  },

  /**
   * Upload brand logo manually
   */
  uploadLogo: async (brandId: string, file: File): Promise<{ id: string; logo: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app').replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/car-brands/${brandId}/logo`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  },
};