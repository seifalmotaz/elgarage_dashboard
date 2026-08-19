import { useQuery } from "@tanstack/react-query";
import { fetchEgyptCities } from "@/lib/api/cities";
import { EGYPT_CITIES } from "@/lib/egypt-cities";
import { queryKeys } from "@/lib/query-keys";

export function useEgyptCities() {
  return useQuery({
    queryKey: queryKeys.cars.cities(),
    queryFn: fetchEgyptCities,
    staleTime: 24 * 60 * 60 * 1000,
    placeholderData: EGYPT_CITIES,
  });
}
