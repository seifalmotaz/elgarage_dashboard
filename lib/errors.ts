export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "تعذر الاتصال بالخادم",
  UNAUTHORIZED: "غير مصرح لك بهذا الإجراء",
  NOT_FOUND: "البيانات غير موجودة",
  VALIDATION_ERROR: "البيانات المدخلة غير صحيحة",
  SERVER_ERROR: "حدث خطأ في الخادم",
  UNKNOWN_ERROR: "حدث خطأ غير متوقع",
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const errorCode = (error as any).code || 'UNKNOWN_ERROR';
    return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}