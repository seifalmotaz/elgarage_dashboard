"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { getInspectionPdfDownloadUrl } from "@/lib/api/inspection-pdf";

type DownloadInspectionPdfButtonProps = {
  reportId: string | null | undefined;
  /** `button` for sidebar actions; `link` for inline report card footer. */
  variant?: "button" | "link";
  className?: string;
  children?: React.ReactNode;
};

/**
 * Downloads the official Arabic inspection PDF from GET /inspection/pdf/:reportId —
 * the same file the website and mobile app open.
 */
export function DownloadInspectionPdfButton({
  reportId,
  variant = "button",
  className = "",
  children,
}: DownloadInspectionPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!reportId) return null;

  const handleDownload = async () => {
    setError(null);
    setLoading(true);
    try {
      const downloadUrl = await getInspectionPdfDownloadUrl(reportId);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("تعذر تحميل تقرير الفحص. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "جاري تجهيز ملف PDF…"
    : (children ?? "تحميل التقرير كـ PDF");

  if (variant === "link") {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={loading}
          className={`text-[12px] text-[#6b7280] hover:text-[#002ec1] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait ${className}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{label}</span>
        </button>
        {error ? <p className="text-[11px] text-red-500">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Button
        type="button"
        variant="outline"
        size="md"
        className={`w-full h-[48px] rounded-full border-[#002ec1] text-[#002ec1] font-semibold ${className}`}
        loading={loading}
        disabled={loading}
        onClick={() => void handleDownload()}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        }
        iconPosition="right"
      >
        {label}
      </Button>
      {error ? <p className="text-[12px] text-red-500 text-center">{error}</p> : null}
    </div>
  );
}
