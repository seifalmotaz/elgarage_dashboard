import { apiClient, Car, CreateCarDto, UpdateCarDto, ApiResponse } from '../api-client';

// Inspection-related types
export interface AvailableInspection {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  thumbnail: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface InspectionPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
}

export interface InspectionLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface InspectionUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface InspectionDetails {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  location: InspectionLocation;
  user: InspectionUser;
  photos: InspectionPhoto[];
}

export interface CarFilters {
  status?: 'DRAFT' | 'PUBLISHED' | 'SOLD';
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  page?: number;
  limit?: number;
}

export const adminCarsApi = {
  getAll: (filters?: CarFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.model) params.append('model', filters.model);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minYear) params.append('minYear', filters.minYear.toString());
    if (filters?.maxYear) params.append('maxYear', filters.maxYear.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    return apiClient.get<ApiResponse<Car[]>>(`/admin/cars${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) =>
    apiClient.get<Car>(`/admin/cars/${id}`),

  create: (data: CreateCarDto) =>
    apiClient.post<Car>('/admin/cars', data),

  update: (id: string, data: UpdateCarDto) =>
    apiClient.patch<Car>(`/admin/cars/${id}`, data),

  updateStatus: (id: string, status: 'DRAFT' | 'PUBLISHED' | 'SOLD') =>
    apiClient.patch<Car>(`/admin/cars/${id}/status`, { status }),

  delete: (id: string) =>
    apiClient.delete<void>(`/admin/cars/${id}`),

  getAvailableInspections: () =>
    apiClient.get<AvailableInspection[]>('/admin/cars/inspections'),

  getInspectionDetails: (listingRequestId: string) =>
    apiClient.get<InspectionDetails>(`/admin/cars/inspections/${listingRequestId}/details`),

  // 360 View Management
  upload360View: async (carId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app').replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/cars/${carId}/360-view`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  remove360View: (carId: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/admin/cars/${carId}/360-view`),
};