import { AuthMiddleware } from './generated/auth-middleware';
import type { FeatureSection, CreateFeatureSectionDto, CreateFeatureItemDto } from './types';

// Re-export types for convenience
export type { FeatureSection, CreateFeatureSectionDto, CreateFeatureItemDto };

/**
 * Feature item type (nested in FeatureSection)
 */
export type FeatureItem = FeatureSection['items'][0];

/**
 * Car Features API v2 - Using AuthMiddleware
 */
export const carFeaturesApi = {
  /**
   * Get all feature sections with their items
   */
  getSections: async (): Promise<FeatureSection[]> => {
    return AuthMiddleware.get<FeatureSection[]>('/admin/car-features/sections');
  },

  /**
   * Get a single section by ID
   */
  getSectionById: async (id: string): Promise<FeatureSection> => {
    return AuthMiddleware.get<FeatureSection>(`/admin/car-features/sections/${id}`);
  },

  /**
   * Create a new section
   */
  createSection: async (data: CreateFeatureSectionDto): Promise<FeatureSection> => {
    return AuthMiddleware.post<FeatureSection>('/admin/car-features/sections', data);
  },

  /**
   * Update a section
   */
  updateSection: async (id: string, data: Partial<CreateFeatureSectionDto>): Promise<FeatureSection> => {
    return AuthMiddleware.patch<FeatureSection>(`/admin/car-features/sections/${id}`, data);
  },

  /**
   * Delete a section
   */
  deleteSection: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/car-features/sections/${id}`);
  },

  /**
   * Reorder sections
   */
  reorderSections: async (sectionIds: string[]): Promise<void> => {
    return AuthMiddleware.post<void>('/admin/car-features/sections/reorder', { sectionIds });
  },

  /**
   * Create a feature item in a section
   */
  createItem: async (sectionId: string, data: CreateFeatureItemDto): Promise<FeatureItem> => {
    return AuthMiddleware.post<FeatureItem>(`/admin/car-features/sections/${sectionId}/items`, data);
  },

  /**
   * Update a feature item
   */
  updateItem: async (id: string, data: Partial<CreateFeatureItemDto>): Promise<FeatureItem> => {
    return AuthMiddleware.patch<FeatureItem>(`/admin/car-features/items/${id}`, data);
  },

  /**
   * Delete a feature item
   */
  deleteItem: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/car-features/items/${id}`);
  },

  /**
   * Reorder items within a section
   */
  reorderItems: async (sectionId: string, itemIds: string[]): Promise<void> => {
    return AuthMiddleware.post<void>(`/admin/car-features/sections/${sectionId}/items/reorder`, { itemIds });
  },

  /**
   * Upload a feature icon
   */
  uploadIcon: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    return AuthMiddleware.post<{ url: string }>('/upload/feature-icon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};