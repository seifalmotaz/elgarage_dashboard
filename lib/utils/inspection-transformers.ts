import type {
  InspectionReportItem,
  InspectionQuestionItem,
  InspectionPhotoItem,
} from '@/lib/api/listing-requests';
import type { OptionSemanticType } from '@/lib/api/types';

export interface InspectionSectionUI {
  id: string;
  title: string;
  icon: string | null;
  order: number;
  goodCount: number;
  warnCount: number;
  badCount: number;
  unansweredCount: number;
  totalQuestions: number;
  questions: InspectionQuestionUI[];
}

export interface InspectionQuestionUI {
  id: string;
  questionText: string;
  order: number;
  response: {
    answerValue: string;
    label: string;
    semanticType: OptionSemanticType;
    notes: string | null;
  } | null;
  photos: InspectionPhotoItem[];
}

export interface InspectionReportUI {
  id: string;
  versionNumber: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedAt: string | null;
  sections: InspectionSectionUI[];
}

function getSemanticCounts(
  questions: InspectionQuestionUI[]
): { goodCount: number; warnCount: number; badCount: number; unansweredCount: number } {
  return questions.reduce(
    (acc, question) => {
      if (!question.response) {
        acc.unansweredCount++;
        return acc;
      }

      switch (question.response.semanticType) {
        case 'GOOD':
          acc.goodCount++;
          break;
        case 'WARN':
          acc.warnCount++;
          break;
        case 'BAD':
          acc.badCount++;
          break;
      }

      return acc;
    },
    { goodCount: 0, warnCount: 0, badCount: 0, unansweredCount: 0 }
  );
}

export function transformInspectionReport(
  report: InspectionReportItem | null | undefined
): InspectionReportUI | null {
  if (!report) {
    return null;
  }

  const version = report.version;
  if (!version) {
    return null;
  }

  const sections = version.sections || [];
  const responses = report.responses || [];
  const photos = report.photos || [];

  const responseMap = new Map(responses.map((r) => [r.questionId, r]));

  const transformedSections: InspectionSectionUI[] = sections
    .filter((section) => section.isActive)
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const sectionQuestions = section.questions || [];

      const transformedQuestions: InspectionQuestionUI[] = sectionQuestions
        .filter((question) => question.isActive)
        .sort((a, b) => a.order - b.order)
        .map((question: InspectionQuestionItem) => {
          const response = responseMap.get(question.id);
          const matchedOption = question.answerOptions?.find(
            (opt) => opt.value === response?.answerValue
          );

          const questionPhotos = photos.filter(
            (photo) => photo.questionId === question.id
          );

          return {
            id: question.id,
            questionText: question.questionText,
            order: question.order,
            response: response && matchedOption
              ? {
                  answerValue: response.answerValue,
                  label: matchedOption.label,
                  semanticType: matchedOption.semanticType,
                  notes: response.notes,
                }
              : null,
            photos: questionPhotos,
          };
        });

      const counts = getSemanticCounts(transformedQuestions);

      return {
        id: section.id,
        title: section.title,
        icon: section.icon,
        order: section.order,
        goodCount: counts.goodCount,
        warnCount: counts.warnCount,
        badCount: counts.badCount,
        unansweredCount: counts.unansweredCount,
        totalQuestions: transformedQuestions.length,
        questions: transformedQuestions,
      };
    });

  return {
    id: report.id,
    versionNumber: version.versionNumber,
    status: report.status,
    completedAt: report.completedAt,
    sections: transformedSections,
  };
}