import { AuthMiddleware } from "./generated/auth-middleware";
import { EGYPT_CITIES, type EgyptCityOption } from "@/lib/egypt-cities";

export async function fetchEgyptCities(): Promise<EgyptCityOption[]> {
  try {
    const data = await AuthMiddleware.get<EgyptCityOption[]>("/cars/cities");
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // Public catalog is static; fall back if the API is an older deploy.
  }
  return EGYPT_CITIES;
}
