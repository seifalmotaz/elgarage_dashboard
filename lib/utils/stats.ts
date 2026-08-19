import type { ListingRequestsStats } from '@/lib/api/listing-requests';

export function calculateSuccessRate(stats: ListingRequestsStats | null): string {
  if (!stats) return "0%";
  const total = stats.inspected + stats.approved;
  if (total === 0) return "0%";
  return Math.round((stats.approved / total) * 100) + "%";
}