import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/lib/api/availability";
import { queryKeys } from "@/lib/query-keys";
import { cacheConfig } from "@/config/cache.config";

export function useAvailabilityRules() {
  return useQuery({
    queryKey: queryKeys.availability.rules(),
    queryFn: () => availabilityApi.listRules(),
    staleTime: cacheConfig.staleTime,
  });
}

export function useAvailabilityCalendar(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.availability.calendar(from, to),
    queryFn: () => availabilityApi.calendar(from, to),
    enabled: Boolean(from && to),
    staleTime: cacheConfig.staleTime,
  });
}
