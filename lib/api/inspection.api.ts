import { AuthMiddleware } from './generated/auth-middleware';
import type { OptionSemanticType } from './types';

/**
 * Inspection section - matches backend DraftSectionResponseDto
 */
export interface InspectionSection {
  id: string;
  title: string;
  titleEn?: string | null;
  icon?: string;
  order: number;
  enablePhotos: boolean;
  enableNotes: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  draftQuestions?: InspectionQuestion[];
  _count?: { draftQuestions: number };
}

/**
 * Inspection question - matches backend DraftQuestionResponseDto
 */
export interface InspectionQuestion {
  id: string;
  draftSectionId: string;
  questionText: string;
  questionTextEn?: string | null;
  questionKey: string;
  answerType: 'OPTIONS';
  isRequired: boolean;
  order: number;
  isActive: boolean;
  draftOptions?: InspectionOption[];
}

/**
 * Inspection option - matches backend DraftOptionResponseDto
 */
export interface InspectionOption {
  id: string;
  draftQuestionId: string;
  label: string;
  value: string;
  semanticType: OptionSemanticType;
  order: number;
}

/**
 * Inspection version - matches backend VersionResponseDto
 */
export interface InspectionVersion {
  id: string;
  versionNumber: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionPublishStatus {
  activeVersion: {
    id: string;
    versionNumber: number;
    name: string;
    description: string | null;
    createdAt: string;
    sectionCount: number;
    questionCount: number;
  } | null;
  draft: {
    sectionCount: number;
    questionCount: number;
  };
  hasUnpublishedChanges: boolean;
  unpublishedSummary: {
    addedSections: string[];
    removedSections: string[];
    changedSections: string[];
  };
}

/**
 * Payload for creating a new section
 */
export interface CreateSectionPayload {
  title: string;
  titleEn?: string;
  icon?: string;
  enablePhotos?: boolean;
  enableNotes?: boolean;
}

/**
 * Payload for updating a section
 */
export interface UpdateSectionPayload {
  title?: string;
  titleEn?: string | null;
  icon?: string;
  enablePhotos?: boolean;
  enableNotes?: boolean;
}

/**
 * Payload for creating a question
 */
export interface CreateQuestionPayload {
  sectionId: string;
  questionText: string;
  questionTextEn?: string;
  questionKey: string;
  options?: { label: string; value: string; semanticType: OptionSemanticType }[];
}

/**
 * Payload for updating a question
 */
export interface UpdateQuestionPayload {
  questionText?: string;
  questionTextEn?: string | null;
  options?: { label: string; value: string; semanticType: OptionSemanticType }[];
}

/**
 * Payload for updating section options
 */
export interface UpdateSectionOptionsPayload {
  options: { label: string; value: string; semanticType: OptionSemanticType }[];
}

/**
 * Inspection API v2 - Using AuthMiddleware
 */
export const inspectionApi = {
  /**
   * Get all draft sections with question counts
   */
  getSections: async (): Promise<InspectionSection[]> => {
    return AuthMiddleware.get<InspectionSection[]>('/admin/inspection/sections');
  },

  /**
   * Get section with questions
   */
  getSection: async (id: string): Promise<InspectionSection> => {
    return AuthMiddleware.get<InspectionSection>(`/admin/inspection/sections/${id}`);
  },

  /**
   * Create a new draft section
   */
  createSection: async (data: CreateSectionPayload): Promise<InspectionSection> => {
    return AuthMiddleware.post<InspectionSection>('/admin/inspection/sections', data);
  },

  /**
   * Update draft section
   */
  updateSection: async (id: string, data: UpdateSectionPayload): Promise<InspectionSection> => {
    return AuthMiddleware.patch<InspectionSection>(`/admin/inspection/sections/${id}`, data);
  },

  /**
   * Soft delete section
   */
  deleteSection: async (id: string): Promise<void> => {
    return AuthMiddleware.delete(`/admin/inspection/sections/${id}`);
  },

  /**
   * Update options for ALL questions in a section
   */
  updateSectionOptions: async (
    sectionId: string,
    options: { label: string; value: string; semanticType: OptionSemanticType }[]
  ): Promise<void> => {
    return AuthMiddleware.post(`/admin/inspection/sections/${sectionId}/options`, { options });
  },

  /**
   * Reorder sections
   */
  reorderSections: async (sectionId: string, newOrder: number): Promise<void> => {
    return AuthMiddleware.post('/admin/inspection/sections/reorder', { sectionId, newOrder });
  },

  /**
   * Create a new draft question
   */
  createQuestion: async (data: CreateQuestionPayload): Promise<InspectionQuestion> => {
    return AuthMiddleware.post<InspectionQuestion>('/admin/inspection/questions', {
      ...data,
      answerType: 'OPTIONS',
      isRequired: true,
    });
  },

  /**
   * Get questions for a section
   */
  getQuestions: async (sectionId: string): Promise<InspectionQuestion[]> => {
    return AuthMiddleware.get<InspectionQuestion[]>(
      `/admin/inspection/sections/${sectionId}/questions`
    );
  },

  /**
   * Update draft question
   */
  updateQuestion: async (id: string, data: UpdateQuestionPayload): Promise<InspectionQuestion> => {
    return AuthMiddleware.patch<InspectionQuestion>(`/admin/inspection/questions/${id}`, data);
  },

  /**
   * Soft delete question
   */
  deleteQuestion: async (id: string): Promise<void> => {
    return AuthMiddleware.delete(`/admin/inspection/questions/${id}`);
  },

  /**
   * Reorder questions in section
   */
  reorderQuestions: async (sectionId: string, questionId: string, newOrder: number): Promise<void> => {
    return AuthMiddleware.post('/admin/inspection/questions/reorder', {
      sectionId,
      questionId,
      newOrder,
    });
  },

  /**
   * Publish drafts as new version
   */
  publishVersion: async (
    name: string,
    description?: string
  ): Promise<{
    id: string;
    versionNumber: number;
    name: string;
    alreadyPublished?: boolean;
  }> => {
    return AuthMiddleware.post('/admin/inspection/versions/publish', { name, description });
  },

  /**
   * Compare drafts with the live inspector version
   */
  getPublishStatus: async (): Promise<InspectionPublishStatus> => {
    return AuthMiddleware.get<InspectionPublishStatus>('/admin/inspection/versions/status');
  },

  /**
   * Get all versions
   */
  getVersions: async (): Promise<InspectionVersion[]> => {
    return AuthMiddleware.get<InspectionVersion[]>('/admin/inspection/versions');
  },

  /**
   * Get active version with full tree
   */
  getActiveVersion: async (): Promise<InspectionVersion & { sections: InspectionSection[] }> => {
    return AuthMiddleware.get('/admin/inspection/versions/active');
  },

  /**
   * Get version by ID with sections and questions
   */
  getVersion: async (id: string): Promise<InspectionVersion> => {
    return AuthMiddleware.get<InspectionVersion>(`/admin/inspection/versions/${id}`);
  },

  /**
   * Set version as active
   */
  activateVersion: async (id: string): Promise<InspectionVersion> => {
    return AuthMiddleware.patch<InspectionVersion>(`/admin/inspection/versions/${id}/activate`);
  },
};
