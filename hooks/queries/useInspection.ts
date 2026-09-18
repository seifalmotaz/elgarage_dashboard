import { useQuery } from '@tanstack/react-query';
import { inspectionApi } from '@/lib/api/inspection.api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Get all inspection sections with question counts and full details
 */
export function useInspectionSections() {
  return useQuery({
    queryKey: queryKeys.listingRequests.inspectionSections(),
    queryFn: async () => {
      // First get the list of sections
      const sections = await inspectionApi.getSections();
      // Then fetch full details (with questions and options) for each section
      const sectionsWithQuestions = await Promise.all(
        sections.map((section) => inspectionApi.getSection(section.id))
      );
      return sectionsWithQuestions;
    },
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Live published version vs unpublished draft changes
 */
export function useInspectionPublishStatus() {
  return useQuery({
    queryKey: queryKeys.listingRequests.inspectionPublishStatus(),
    queryFn: () => inspectionApi.getPublishStatus(),
    staleTime: 15_000,
  });
}

/**
 * Get inspection section details by ID
 */
export function useInspectionSection(sectionId: string) {
  return useQuery({
    queryKey: [...queryKeys.listingRequests.inspectionSections(), sectionId],
    queryFn: () => inspectionApi.getSection(sectionId),
    enabled: !!sectionId, // Only run if sectionId is provided
    staleTime: 60_000, // 1 minute
  });
}