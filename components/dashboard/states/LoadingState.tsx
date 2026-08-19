interface LoadingStateProps {
  type?: 'page' | 'card' | 'table' | 'grid';
  count?: number;
  className?: string;
}

export function LoadingState({ type = 'page', count = 6, className }: LoadingStateProps) {
  // Full page spinner
  if (type === 'page') {
    return (
      <div className={`flex justify-center items-center min-h-screen ${className || ""}`} dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002ec1]"></div>
      </div>
    );
  }

  // Card skeletons in grid
  if (type === 'grid' || type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ""}`}>
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[24px] p-[16px] border border-gray-100 animate-pulse"
          >
            <div className="h-[160px] bg-gray-200 rounded-[12px] mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Table skeleton
  if (type === 'table') {
    return (
      <div className={`flex flex-col gap-3 ${className || ""}`}>
        {/* Header */}
        <div className="bg-gray-100 rounded-[12px] h-12 flex items-center gap-4 px-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
        {/* Rows */}
        {[...Array(count || 5)].map((_, i) => (
          <div key={i} className="bg-white rounded-[12px] h-16 flex items-center gap-4 px-6 border border-gray-100">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-100 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return null;
}