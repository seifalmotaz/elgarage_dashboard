import { apiClient, Car } from '../api-client';
import type { ListingRequestsListResponse } from './listing-requests';

// ============== USER'S LISTING REQUESTS ==============

export interface UserListingRequestsParams {
  userId: string;
  page?: number;
  limit?: number;
}

/**
 * Get all listing requests (inspection requests) for a specific user
 */
export async function getUserListingRequests(
  params: UserListingRequestsParams
): Promise<ListingRequestsListResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('userId', params.userId);
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  
  return apiClient.get<ListingRequestsListResponse>(
    `/admin/listing-requests?${queryParams.toString()}`
  );
}

// ============== USER'S CARS ==============

export interface UserCarsParams {
  userId: string;
  page?: number;
  limit?: number;
}

export interface UserCarsResponse {
  data: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all cars owned by a specific user
 */
export async function getUserCars(
  params: UserCarsParams
): Promise<UserCarsResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('userId', params.userId);
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  
  return apiClient.get<UserCarsResponse>(
    `/admin/cars?${queryParams.toString()}`
  );
}

// ============== USER'S NEGOTIATIONS ==============

export interface NegotiationItem {
  id: string;
  carId: string;
  buyerId: string;
  askingPrice: number;
  initialOffer: number;
  finalPrice: number | null;
  status: 'PENDING' | 'CONNECTED' | 'COMPLETED' | 'CANCELLED';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  connectedAt: string | null;
  completedAt: string | null;
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images: string[];
  };
  buyer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
}

export interface NegotiationsListResponse {
  items: NegotiationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserNegotiationsParams {
  userId: string;
  page?: number;
  limit?: number;
}

/**
 * Get all negotiations for a specific user (as buyer)
 */
export async function getUserNegotiations(
  params: UserNegotiationsParams
): Promise<NegotiationsListResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('userId', params.userId);
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  
  return apiClient.get<NegotiationsListResponse>(
    `/admin/negotiations?${queryParams.toString()}`
  );
}