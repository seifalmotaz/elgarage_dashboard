import { useCarDetail } from './useCars';
import { useListingRequestDetail } from './useListingRequests';
import { useInspectionByCarId } from './useAdminInspections';
import type { Car } from '@/lib/api/types';
import type { InspectionReportItem, ListingRequestDetail } from '@/lib/api/listing-requests';

export interface UseCarWithInspectionReturn {
  car: Car | null | undefined;
  inspectionReport: InspectionReportItem | null | undefined;
  listingRequest: ListingRequestDetail | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCarWithInspection(carId: string): UseCarWithInspectionReturn {
  const carQuery = useCarDetail(carId);

  const listingRequestId = carQuery.data?.listingRequestId;

  // For imported cars: fetch inspection via listing request
  const listingRequestQuery = useListingRequestDetail(listingRequestId || '');

  // For manual cars: fetch inspection directly by carId
  const directInspectionQuery = useInspectionByCarId(listingRequestId ? undefined : carId);

  const isLoading = carQuery.isLoading;
  const isError = carQuery.isError;
  const error = carQuery.error;
  const car = carQuery.data;

  // Determine which inspection source to use
  const listingRequest = listingRequestId ? listingRequestQuery.data : undefined;
  const inspectionReport = listingRequestId
    ? listingRequestQuery.data?.inspectionReport
    : directInspectionQuery.data;

  const refetch = () => {
    carQuery.refetch();
    if (listingRequestId) {
      listingRequestQuery.refetch();
    } else {
      directInspectionQuery.refetch();
    }
  };

  return {
    car,
    inspectionReport: inspectionReport || null,
    listingRequest: listingRequest || null,
    isLoading,
    isError,
    error: error || null,
    refetch,
  };
}