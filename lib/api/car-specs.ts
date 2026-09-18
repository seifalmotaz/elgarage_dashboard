import { apiClient, SpecType, CreateSpecTypeDto, CreateSpecOptionDto } from '../api-client';

export const specTypesApi = {
  getPublic: () => 
    apiClient.get<SpecType[]>('/car-specs'),

  getAll: () =>
    apiClient.get<SpecType[]>('/admin/car-specs/types'),

  getById: (id: string) =>
    apiClient.get<SpecType>(`/admin/car-specs/types/${id}`),

  create: (data: CreateSpecTypeDto) =>
    apiClient.post<SpecType>('/admin/car-specs/types', data),

  update: (id: string, data: Partial<CreateSpecTypeDto>) =>
    apiClient.patch<SpecType>(`/admin/car-specs/types/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/admin/car-specs/types/${id}`),

  reorder: (typeIds: string[]) =>
    apiClient.post<void>('/admin/car-specs/types/reorder', { typeIds }),
};

export const specOptionsApi = {
  getAll: (typeId: string) =>
    apiClient.get<SpecType['options']>(`/admin/car-specs/types/${typeId}/options`),

  create: (typeId: string, data: CreateSpecOptionDto) =>
    apiClient.post<SpecType['options'][0]>(`/admin/car-specs/types/${typeId}/options`, data),

  update: (id: string, data: Partial<CreateSpecOptionDto>) =>
    apiClient.patch<SpecType['options'][0]>(`/admin/car-specs/options/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/admin/car-specs/options/${id}`),

  reorder: (typeId: string, optionIds: string[]) =>
    apiClient.post<void>(`/admin/car-specs/types/${typeId}/options/reorder`, { optionIds }),
};