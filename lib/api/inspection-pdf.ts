import { AuthMiddleware } from './generated/auth-middleware';

export interface InspectionPdfResponse {
  success?: boolean;
  downloadUrl: string;
}

/**
 * Official Arabic inspection PDF — same public endpoint the website/mobile app use.
 * GET /api/v1/inspection/pdf/:reportId returns a cached or freshly generated download URL.
 */
export async function getInspectionPdfDownloadUrl(reportId: string): Promise<string> {
  const data = await AuthMiddleware.get<InspectionPdfResponse>(
    `/inspection/pdf/${encodeURIComponent(reportId)}`,
  );

  if (!data?.downloadUrl) {
    throw new Error('تعذر تحميل تقرير الفحص');
  }

  return data.downloadUrl;
}
