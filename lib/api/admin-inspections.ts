import { apiClient } from '../api-client';
import type { InspectionReportItem } from './listing-requests';

// Types for admin inspection management
export interface AdminInspectionReport {
  id: string;
  versionId: string;
  userId: string;
  listingRequestId: string | null;
  carId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminInspectionResponse {
  id: string;
}

export interface SubmitResponsePayload {
  questionId: string;
  answerValue: string;
  answerText?: string;
  /** `null` explicitly removes a previously saved note. */
  notes?: string | null;
}

export interface SubmitSectionNotePayload {
  sectionId: string;
  /** `null` explicitly removes a previously saved note. */
  notes?: string | null;
}

export interface BulkSavePayload {
  responses?: SubmitResponsePayload[];
  sectionNotes?: SubmitSectionNotePayload[];
  /** Question responses to remove from this report. */
  deletedResponseQuestionIds?: string[];
  /** Section notes to remove from this report. */
  deletedSectionNoteSectionIds?: string[];
}

export const adminInspectionsApi = {
  /**
   * Create a new inspection report for a car
   */
  create: (carId: string) =>
    apiClient.post<CreateAdminInspectionResponse>('/admin/inspections', { carId }),

  /**
   * Get inspection report by car ID
   */
  getByCarId: (carId: string) =>
    apiClient.get<InspectionReportItem>(`/admin/inspections/by-car/${carId}`),

  /**
   * Get inspection report by ID
   */
  getById: (id: string) =>
    apiClient.get<InspectionReportItem>(`/admin/inspections/${id}`),

  /**
   * Submit or update a question response
   */
  submitResponse: (reportId: string, data: SubmitResponsePayload) =>
    apiClient.patch(`/admin/inspections/${reportId}/responses`, data),

  /**
   * Submit or update section notes
   */
  submitSectionNote: (reportId: string, data: SubmitSectionNotePayload) =>
    apiClient.patch(`/admin/inspections/${reportId}/section-notes`, data),

  /**
   * Bulk save question responses and section notes
   */
  bulkSave: (reportId: string, data: BulkSavePayload) =>
    apiClient.patch<{ success: boolean }>(`/admin/inspections/${reportId}/bulk`, data),


  /**
   * Upload a photo to the inspection report
   */
  uploadPhoto: async (
    reportId: string,
    file: File,
    sectionId?: string,
    questionId?: string,
    description?: string,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (sectionId) formData.append('sectionId', sectionId);
    if (questionId) formData.append('questionId', questionId);
    if (description) formData.append('description', description);

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app').replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/admin/inspections/${reportId}/photos`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  /**
   * Delete a photo from the inspection report
   */
  deletePhoto: (reportId: string, photoId: string) =>
    apiClient.delete(`/admin/inspections/${reportId}/photos/${photoId}`),

  /**
   * Mark inspection as completed
   */
  complete: (reportId: string) =>
    apiClient.patch(`/admin/inspections/${reportId}/complete`, {}),
};
