import { apiClient, CarBrand, CarBrandModel, CreateBrandDto, CreateModelDto } from '../api-client';

export const carBrandsApi = {
  getPublic: () =>
    apiClient.get<CarBrand[]>('/car-brands'),

  getPublicModels: (brandId: string) =>
    apiClient.get<CarBrandModel[]>(`/car-brands/${brandId}/models`),

  getAll: () =>
    apiClient.get<CarBrand[]>('/admin/car-brands'),

  create: (data: CreateBrandDto) =>
    apiClient.post<CarBrand>('/admin/car-brands', data),

  update: (id: string, data: Partial<CreateBrandDto>) =>
    apiClient.patch<CarBrand>(`/admin/car-brands/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/admin/car-brands/${id}`),

  reorder: (brandIds: string[]) =>
    apiClient.post<void>('/admin/car-brands/reorder', { brandIds }),

  createModel: (brandId: string, data: CreateModelDto) =>
    apiClient.post<CarBrandModel>(`/admin/car-brands/${brandId}/models`, data),

  updateModel: (id: string, data: Partial<CreateModelDto>) =>
    apiClient.patch<CarBrandModel>(`/admin/car-brands/models/${id}`, data),

  deleteModel: (id: string) =>
    apiClient.delete<void>(`/admin/car-brands/models/${id}`),

  reorderModels: (brandId: string, modelIds: string[]) =>
    apiClient.post<void>(`/admin/car-brands/${brandId}/models/reorder`, { modelIds }),
};