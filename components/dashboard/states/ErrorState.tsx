import Button from "@/components/ui/Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] gap-4 ${className || ""}`}>
      <svg
        className="w-16 h-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-gray-600 text-lg">
        {message || "حدث خطأ أثناء تحميل البيانات"}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}