import { AuthMiddleware } from './generated/auth-middleware';
import type { SpecType, CreateSpecTypeDto, CreateSpecOptionDto } from './types';

// Re-export types for convenience
export type { SpecType, CreateSpecTypeDto, CreateSpecOptionDto };

/**
 * Spec option type (nested in SpecType)
 */
export type SpecOption = SpecType['options'][0];

/**
 * Car Specs API v2 - Using AuthMiddleware
 */
export const carSpecsApi = {
  /**
   * Get all spec types with their options
   */
  getTypes: async (): Promise<SpecType[]> => {
    return AuthMiddleware.get<SpecType[]>('/admin/car-specs/types');
  },

  /**
   * Get a single spec type by ID
   */
  getTypeById: async (id: string): Promise<SpecType> => {
    return AuthMiddleware.get<SpecType>(`/admin/car-specs/types/${id}`);
  },

  /**
   * Create a new spec type
   */
  createType: async (data: CreateSpecTypeDto): Promise<SpecType> => {
    return AuthMiddleware.post<SpecType>('/admin/car-specs/types', data);
  },

  /**
   * Update a spec type
   */
  updateType: async (id: string, data: Partial<CreateSpecTypeDto>): Promise<SpecType> => {
    return AuthMiddleware.patch<SpecType>(`/admin/car-specs/types/${id}`, data);
  },

  /**
   * Delete a spec type
   */
  deleteType: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/car-specs/types/${id}`);
  },

  /**
   * Reorder spec types
   */
  reorderTypes: async (typeIds: string[]): Promise<void> => {
    return AuthMiddleware.post<void>('/admin/car-specs/types/reorder', { typeIds });
  },

  /**
   * Create a spec option for a type
   */
  createOption: async (typeId: string, data: CreateSpecOptionDto): Promise<SpecOption> => {
    return AuthMiddleware.post<SpecOption>(`/admin/car-specs/types/${typeId}/options`, data);
  },

  /**
   * Update a spec option
   */
  updateOption: async (id: string, data: Partial<CreateSpecOptionDto>): Promise<SpecOption> => {
    return AuthMiddleware.patch<SpecOption>(`/admin/car-specs/options/${id}`, data);
  },

  /**
   * Delete a spec option
   */
  deleteOption: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/car-specs/options/${id}`);
  },

  /**
   * Reorder options within a type
   */
  reorderOptions: async (typeId: string, optionIds: string[]): Promise<void> => {
    return AuthMiddleware.post<void>(`/admin/car-specs/types/${typeId}/options/reorder`, { optionIds });
  },
};