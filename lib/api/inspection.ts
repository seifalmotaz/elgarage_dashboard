import { apiClient } from '../api-client';
import type {
  InspectionSection,
  CreateInspectionSectionDto,
  UpdateInspectionSectionDto,
  OptionSemanticType,
} from '../api-client';

export async function getSections(): Promise<InspectionSection[]> {
  const response = await apiClient.get<Array<InspectionSection & { _count: { draftQuestions: number } }>>(
    '/admin/inspection/sections'
  );
  return response;
}

export async function getSection(id: string): Promise<InspectionSection> {
  return apiClient.get<InspectionSection>(`/admin/inspection/sections/${id}`);
}

export async function createSection(data: CreateInspectionSectionDto): Promise<InspectionSection> {
  return apiClient.post<InspectionSection>('/admin/inspection/sections', data);
}

export async function updateSection(id: string, data: UpdateInspectionSectionDto): Promise<InspectionSection> {
  return apiClient.patch<InspectionSection>(`/admin/inspection/sections/${id}`, data);
}

export async function deleteSection(id: string): Promise<void> {
  return apiClient.delete(`/admin/inspection/sections/${id}`);
}

export async function updateSectionOptions(
  sectionId: string,
  options: { label: string; value: string; semanticType: OptionSemanticType }[]
): Promise<void> {
  return apiClient.post(`/admin/inspection/sections/${sectionId}/options`, { options });
}

export async function createQuestion(data: {
  sectionId: string;
  questionText: string;
  questionTextEn?: string;
  questionKey: string;
  options?: { label: string; value: string; semanticType: OptionSemanticType }[];
}): Promise<void> {
  return apiClient.post('/admin/inspection/questions', {
    ...data,
    answerType: 'OPTIONS',
    isRequired: true,
  });
}

export async function updateQuestion(
  id: string,
  data: { questionText?: string; questionTextEn?: string | null; options?: { label: string; value: string; semanticType: OptionSemanticType }[] }
): Promise<void> {
  return apiClient.patch(`/admin/inspection/questions/${id}`, data);
}

export async function deleteQuestion(id: string): Promise<void> {
  return apiClient.delete(`/admin/inspection/questions/${id}`);
}

export async function reorderSections(sectionId: string, newOrder: number): Promise<void> {
  return apiClient.post('/admin/inspection/sections/reorder', { sectionId, newOrder });
}

export async function reorderQuestions(sectionId: string, questionId: string, newOrder: number): Promise<void> {
  return apiClient.post('/admin/inspection/questions/reorder', { sectionId, questionId, newOrder });
}

export async function publishVersion(name: string, description?: string): Promise<{ id: string; versionNumber: number }> {
  return apiClient.post('/admin/inspection/versions/publish', { name, description });
}