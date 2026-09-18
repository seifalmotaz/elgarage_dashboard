import { AuthMiddleware } from './generated/auth-middleware';
import type {
  Car,
  CreateCarDto,
  UpdateCarDto,
  CarBrand,
  CarBrandModel,
  FeatureSection,
  SpecType,
  ApiResponse,
} from './types';

// Re-export types for convenience
export type { Car, CreateCarDto, UpdateCarDto, CarBrand, CarBrandModel, FeatureSection, SpecType };

/**
 * Car status type
 */
export type CarStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD';

/**
 * Car filters for listing
 */
export interface CarFilters {
  status?: CarStatus;
  brand?: string;
  model?: string;
  /** Search brand or model (backend OR contains) */
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  /** Minimum mileage filter */
  minMileage?: number;
  /** Maximum mileage filter */
  maxMileage?: number;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Paginated cars response matching backend response format
 */
export interface CarsListResponse {
  data: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Car API v2 - Using AuthMiddleware
 */
export const carsApi = {
  /**
   * Get paginated list of cars with optional filters
   */
  getList: async (filters?: CarFilters): Promise<CarsListResponse> => {
    const params = new URLSearchParams();

    if (filters?.status) params.set('status', filters.status);
    if (filters?.brand) params.set('brand', filters.brand);
    if (filters?.model) params.set('model', filters.model);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.minYear) params.set('minYear', String(filters.minYear));
    if (filters?.maxYear) params.set('maxYear', String(filters.maxYear));
    if (filters?.minMileage) params.set('minMileage', String(filters.minMileage));
    if (filters?.maxMileage) params.set('maxMileage', String(filters.maxMileage));
    if (filters?.isFeatured !== undefined) {
      params.set('isFeatured', String(filters.isFeatured));
    }
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    const endpoint = query ? `/admin/cars?${query}` : '/admin/cars';

    const raw = await AuthMiddleware.get<
      CarsListResponse & {
        meta?: { total: number; page: number; limit: number; totalPages: number };
      }
    >(endpoint);

    // Backend returns { data, meta }; normalize to flat CarsListResponse
    if (raw?.meta) {
      return {
        data: raw.data || [],
        total: raw.meta.total,
        page: raw.meta.page,
        limit: raw.meta.limit,
        totalPages: raw.meta.totalPages,
      };
    }

    return {
      data: raw?.data || [],
      total: raw?.total ?? 0,
      page: raw?.page ?? 1,
      limit: raw?.limit ?? 10,
      totalPages: raw?.totalPages ?? 1,
    };
  },

  /**
   * Get car details by ID
   */
  getById: async (id: string): Promise<Car> => {
    return AuthMiddleware.get<Car>(`/admin/cars/${id}`);
  },

  /**
   * Create a new car
   */
  create: async (data: CreateCarDto): Promise<Car> => {
    return AuthMiddleware.post<Car>('/admin/cars', data);
  },

  /**
   * Update an existing car
   */
  update: async (id: string, data: UpdateCarDto): Promise<Car> => {
    return AuthMiddleware.patch<Car>(`/admin/cars/${id}`, data);
  },

  /**
   * Update car status
   */
  updateStatus: async (id: string, status: CarStatus): Promise<Car> => {
    return AuthMiddleware.patch<Car>(`/admin/cars/${id}/status`, { status });
  },

  /**
   * Delete a car
   */
  delete: async (id: string): Promise<void> => {
    return AuthMiddleware.delete<void>(`/admin/cars/${id}`);
  },

  /**
   * Toggle car featured status
   */
  toggleFeatured: async (id: string, isFeatured: boolean): Promise<Car> => {
    return AuthMiddleware.patch<Car>(`/admin/cars/${id}/featured`, { isFeatured });
  },

  /**
   * Get available inspections for car creation
   */
  getAvailableInspections: async () => {
    return AuthMiddleware.get<AvailableInspection[]>('/admin/cars/inspections');
  },

  /**
   * Get inspection details by listing request ID
   */
  getInspectionDetails: async (listingRequestId: string): Promise<InspectionDetails> => {
    return AuthMiddleware.get<InspectionDetails>(`/admin/cars/inspections/${listingRequestId}/details`);
  },
};

/**
 * Available inspection for car creation
 */
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

/**
 * Inspection photo
 */
export interface InspectionPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
}

/**
 * Inspection location
 */
export interface InspectionLocation {
  latitude: number;
  longitude: number;
  address: string;
}

/**
 * Inspection user
 */
export interface InspectionUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

/**
 * Inspection details for import
 */
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