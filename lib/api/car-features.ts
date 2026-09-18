import { apiClient, FeatureSection, CreateFeatureSectionDto, CreateFeatureItemDto } from '../api-client';

export const featureSectionApi = {
  getPublic: () =>
    apiClient.get<FeatureSection[]>('/car-features'),

  getAll: () =>
    apiClient.get<FeatureSection[]>('/admin/car-features/sections'),

  getById: (id: string) =>
    apiClient.get<FeatureSection>(`/admin/car-features/sections/${id}`),

  create: (data: CreateFeatureSectionDto) =>
    apiClient.post<FeatureSection>('/admin/car-features/sections', data),

  update: (id: string, data: Partial<CreateFeatureSectionDto>) =>
    apiClient.patch<FeatureSection>(`/admin/car-features/sections/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/admin/car-features/sections/${id}`),

  reorder: (sectionIds: string[]) =>
    apiClient.post<void>('/admin/car-features/sections/reorder', { sectionIds }),
};

export const featureItemApi = {
  getAll: (sectionId: string) =>
    apiClient.get<FeatureSection['items']>(`/admin/car-features/sections/${sectionId}/items`),

  create: (sectionId: string, data: CreateFeatureItemDto) =>
    apiClient.post<FeatureSection['items'][0]>(`/admin/car-features/sections/${sectionId}/items`, data),

  update: (id: string, data: Partial<CreateFeatureItemDto>) =>
    apiClient.patch<FeatureSection['items'][0]>(`/admin/car-features/items/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/admin/car-features/items/${id}`),

  reorder: (sectionId: string, itemIds: string[]) =>
    apiClient.post<void>(`/admin/car-features/sections/${sectionId}/items/reorder`, { itemIds }),
};