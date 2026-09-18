import { AuthMiddleware } from './generated/auth-middleware';

/**
 * Listing Request status type
 */
export type ListingRequestStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_INSPECTION'
  | 'INSPECTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

/**
 * Status display configuration for UI
 */
export const STATUS_MAP: Record<ListingRequestStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'بانتظار التعيين', bg: 'bg-[#FEF3C7]', text: 'text-[#CA8A04]' },
  ASSIGNED: { label: 'تم التعيين', bg: 'bg-[#E0F2FE]', text: 'text-[#2563EB]' },
  IN_INSPECTION: { label: 'جاري الفحص', bg: 'bg-[#E0F2FE]', text: 'text-[#2563EB]' },
  INSPECTED: { label: 'تم الفحص', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  APPROVED: { label: 'معتمد', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  REJECTED: { label: 'مرفوض', bg: 'bg-[#FFE0DE]', text: 'text-[#AF1208]' },
  CANCELLED: { label: 'ملغي', bg: 'bg-[#FFE0DE]', text: 'text-[#AF1208]' },
};

/**
 * Status filter options for UI
 */
export const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'الكل', value: '' },
  { label: 'بانتظار التعيين', value: 'PENDING' },
  { label: 'تم التعيين', value: 'ASSIGNED' },
  { label: 'جاري الفحص', value: 'IN_INSPECTION' },
  { label: 'تم الفحص', value: 'INSPECTED' },
  { label: 'معتمد', value: 'APPROVED' },
  { label: 'مرفوض', value: 'REJECTED' },
  { label: 'ملغي', value: 'CANCELLED' },
];

/**
 * Timeline steps for request progress
 */
export const TIMELINE_STEPS = [
  { key: 'created', label: 'تم استلام الطلب', icon: '/assets/dashboard/sales-requests/note-2.svg' },
  { key: 'assigned', label: 'تم تعيين المفتش', icon: '/assets/dashboard/cards/chart.svg' },
  { key: 'inspection', label: 'تنفيذ الفحص', icon: '/assets/dashboard/sales-requests/scanner.svg' },
  { key: 'report_uploaded', label: 'رفع التقرير', icon: '/assets/dashboard/cars/car-model.svg' },
];

/**
 * Listing request list item
 */
export interface ListingRequestListItem {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  latitude: number;
  longitude: number;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: ListingRequestStatus;
  assignedInspectorId: string | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
  };
  assignedInspector: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

/**
 * Paginated listing requests response
 */
export interface ListingRequestsListResponse {
  items: ListingRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Inspection option item
 */
export interface InspectionOptionItem {
  id: string;
  questionId?: string;
  label: string;
  value: string;
  semanticType: 'GOOD' | 'WARN' | 'BAD';
  order: number;
}

/**
 * Inspection question item
 */
export interface InspectionQuestionItem {
  id: string;
  sectionId: string;
  questionText: string;
  questionKey: string;
  answerType: string;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  answerOptions: InspectionOptionItem[];
}

/**
 * Inspection section item
 */
export interface InspectionSectionItem {
  id: string;
  versionId: string;
  title: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  questions: InspectionQuestionItem[];
}

/**
 * Inspection version item
 */
export interface InspectionVersionItem {
  id: string;
  versionNumber: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isLatest: boolean;
  sections: InspectionSectionItem[];
}

/**
 * Inspection response item
 */
export interface InspectionResponseItem {
  id: string;
  reportId: string;
  questionId: string;
  answerValue: string;
  answerText: string | null;
  notes: string | null;
  createdAt: string;
  question?: {
    id: string;
    questionText: string;
    questionKey: string;
  };
}

/**
 * Inspection photo item
 */
export interface InspectionPhotoItem {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  sectionId: string | null;
  questionId: string | null;
  createdAt: string;
}

/**
 * Inspection report item
 */
export interface InspectionReportItem {
  id: string;
  versionId: string;
  userId: string;
  listingRequestId: string | null;
  carId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  startedAt: string;
  completedAt: string | null;
  version?: InspectionVersionItem;
  responses?: InspectionResponseItem[];
  photos?: InspectionPhotoItem[];
  sectionNotes?: {
    id: string;
    reportId: string;
    sectionId: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
}

/**
 * User list item (for inspector assignment)
 */
export interface UserListItem {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
}

/**
 * Listing request detail - extends list item with more details
 */
export interface ListingRequestDetail extends ListingRequestListItem {
  user: {
    id: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  assignedInspector: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
  inspectionReport: InspectionReportItem | null;
  inspectionReportId: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

/**
 * Listing requests statistics
 */
export interface ListingRequestsStats {
  pending: number;
  assigned: number;
  inInspection: number;
  inspected: number;
  approved: number;
  rejected: number;
  cancelled: number;
  total: number;
}

/**
 * Timeline step for UI
 */
export interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  completed: boolean;
  date: string | null;
}

/**
 * Filters for listing requests
 */
export interface ListingRequestFilters {
  status?: string;
  inspectorId?: string;
  search?: string;
  /** Filter requests created after this date (YYYY-MM-DD) */
  fromDate?: string;
  /** Filter requests created before this date (YYYY-MM-DD) */
  toDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Listing Requests API v2 - Using AuthMiddleware
 */
export const listingRequestsApi = {
  /**
   * Get paginated list of listing requests with optional filters
   */
  getList: async (filters?: ListingRequestFilters): Promise<ListingRequestsListResponse> => {
    const params = new URLSearchParams();

    if (filters?.status) params.set('status', filters.status);
    if (filters?.inspectorId) params.set('inspectorId', filters.inspectorId);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.fromDate) params.set('fromDate', filters.fromDate);
    if (filters?.toDate) params.set('toDate', filters.toDate);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    const endpoint = query ? `/admin/listing-requests?${query}` : '/admin/listing-requests';

    return AuthMiddleware.get<ListingRequestsListResponse>(endpoint);
  },

  /**
   * Get listing request statistics
   */
  getStats: async (): Promise<ListingRequestsStats> => {
    return AuthMiddleware.get<ListingRequestsStats>('/admin/listing-requests/stats');
  },

  /**
   * Get listing request detail by ID
   */
  getById: async (id: string): Promise<ListingRequestDetail> => {
    return AuthMiddleware.get<ListingRequestDetail>(`/admin/listing-requests/${id}`);
  },

  /**
   * Assign inspector to a listing request
   */
  assignInspector: async (requestId: string, inspectorId: string): Promise<ListingRequestDetail> => {
    return AuthMiddleware.post<ListingRequestDetail>(`/admin/listing-requests/${requestId}/assign`, {
      inspectorId,
    });
  },

  /**
   * Approve a listing request (after inspection)
   */
  approve: async (requestId: string, idempotencyKey?: string): Promise<ListingRequestDetail> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return AuthMiddleware.post<ListingRequestDetail>(
      `/admin/listing-requests/${requestId}/approve`,
      {},
      { headers }
    );
  },

  /**
   * Reject a listing request
   */
  reject: async (
    requestId: string,
    reason: string,
    idempotencyKey?: string
  ): Promise<ListingRequestDetail> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return AuthMiddleware.post<ListingRequestDetail>(
      `/admin/listing-requests/${requestId}/reject`,
      { reason },
      { headers }
    );
  },

  /**
   * Cancel a listing request (admin)
   */
  cancel: async (requestId: string): Promise<ListingRequestDetail> => {
    return AuthMiddleware.post<ListingRequestDetail>(
      `/admin/listing-requests/${requestId}/cancel`,
      {},
    );
  },

  /**
   * Update listing request status
   */
  updateStatus: async (
    requestId: string,
    status: ListingRequestStatus
  ): Promise<ListingRequestDetail> => {
    return AuthMiddleware.patch<ListingRequestDetail>(`/admin/listing-requests/${requestId}`, {
      status,
    });
  },

  /**
   * Upload inspection photos
   */
  uploadInspectionPhotos: async (
    requestId: string,
    photos: { sectionId?: string; questionId?: string; url: string; description?: string }[]
  ): Promise<void> => {
    return AuthMiddleware.post(`/admin/listing-requests/${requestId}/photos`, { photos });
  },

  /**
   * Start or get inspection report for a listing request (admin)
   */
  startInspection: async (requestId: string): Promise<InspectionReportItem> => {
    return AuthMiddleware.post<InspectionReportItem>(
      `/admin/listing-requests/${requestId}/start-inspection`,
      {}
    );
  },

  /**
   * Get list of inspectors (for assignment dropdown)
   */
  getInspectors: async (
    page = 1,
    limit = 20
  ): Promise<{ data: UserListItem[]; total: number; totalPages: number }> => {
    const result = await AuthMiddleware.get<{
      data: UserListItem[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/users?role=INSPECTOR&isActive=true&page=${page}&limit=${limit}`);

    return {
      data: result.data,
      total: result.total,
      totalPages: result.totalPages,
    };
  },
};
