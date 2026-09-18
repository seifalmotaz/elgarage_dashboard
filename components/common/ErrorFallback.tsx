"use client";

import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  onRetry?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary, onRetry }: ErrorFallbackProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (resetErrorBoundary) {
      resetErrorBoundary();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-white rounded-[24px] p-8" dir="rtl">
      <div className="text-[#ef4444] text-[20px] font-semibold text-center">
        حدث خطأ في تحميل البيانات
      </div>
      <div className="text-[#6b7280] text-[14px] text-center max-w-md">
        {error.message || 'يرجى المحاولة مرة أخرى'}
      </div>
      <button
        onClick={handleRetry}
        className="px-8 py-3 bg-[#002ec1] text-white rounded-full hover:bg-[#0026a3] transition-colors font-medium text-[14px]"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}