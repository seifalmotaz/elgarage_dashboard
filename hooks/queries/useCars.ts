import { useQuery } from '@tanstack/react-query';
import { carsApi } from '@/lib/api/cars';
import { carBrandsApi } from '@/lib/api/car-brands.api';
import { carFeaturesApi } from '@/lib/api/car-features.api';
import { carSpecsApi } from '@/lib/api/car-specs.api';
import type { CarFilters } from '@/lib/api/cars';
import { queryKeys } from '@/lib/query-keys';

/**
 * Get paginated list of cars with optional filters
 */
export function useCars(filters?: CarFilters) {
  return useQuery({
    queryKey: queryKeys.cars.list(filters as Record<string, unknown>),
    queryFn: () => carsApi.getList(filters),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Get car details by ID
 */
export function useCarDetail(carId: string) {
  return useQuery({
    queryKey: queryKeys.cars.detail(carId),
    queryFn: () => carsApi.getById(carId),
    enabled: !!carId,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get all car brands with their models
 */
export function useCarBrands() {
  return useQuery({
    queryKey: queryKeys.cars.brands(),
    queryFn: () => carBrandsApi.getList(),
    staleTime: 10 * 60_000, // 10 minutes - brands rarely change
  });
}

/**
 * Get models for a specific brand
 */
export function useCarModels(brandId: string) {
  return useQuery({
    queryKey: queryKeys.cars.models(brandId),
    queryFn: () => carBrandsApi.getModels(brandId),
    enabled: !!brandId,
    staleTime: 10 * 60_000, // 10 minutes - models rarely change
  });
}

/**
 * Get all feature sections with their items
 */
export function useCarFeatures() {
  return useQuery({
    queryKey: queryKeys.cars.features(),
    queryFn: () => carFeaturesApi.getSections(),
    staleTime: 10 * 60_000, // 10 minutes - features rarely change
  });
}

/**
 * Get all spec types with their options
 */
export function useCarSpecs() {
  return useQuery({
    queryKey: queryKeys.cars.specs(),
    queryFn: () => carSpecsApi.getTypes(),
    staleTime: 10 * 60_000, // 10 minutes - specs rarely change
  });
}

/**
 * Get available inspections for car creation
 */
export function useAvailableInspections() {
  return useQuery({
    queryKey: queryKeys.cars.availableInspections(),
    queryFn: () => carsApi.getAvailableInspections(),
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get inspection details by listing request ID
 */
export function useInspectionDetails(listingRequestId: string) {
  return useQuery({
    queryKey: ['cars', 'inspectionDetails', listingRequestId],
    queryFn: () => carsApi.getInspectionDetails(listingRequestId),
    enabled: !!listingRequestId,
    staleTime: 60_000,
  });
}