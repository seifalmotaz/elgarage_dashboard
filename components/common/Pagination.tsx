"use client";

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  // Don't show pagination if only one page
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    pages.push(1);

    // Show ellipsis if needed
    if (showEllipsisStart) {
      pages.push('...');
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis if needed
    if (showEllipsisEnd) {
      pages.push('...');
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {/* Page info */}
      <div className="text-[14px] text-[#6b7280]">
        عرض {((currentPage - 1) * 10) + 1} إلى{' '}
        {Math.min(currentPage * 10, totalItems)} من {totalItems} نتيجة
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 rounded-full border border-[#f2f2f2] text-[14px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          السابق
        </button>

        {/* Page numbers */}
        <div className="flex gap-2">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-[#6b7280]">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className={`w-10 h-10 rounded-full text-[14px] transition-colors ${
                  page === currentPage
                    ? 'bg-[#002ec1] text-white shadow-md'
                    : 'bg-white border border-[#f2f2f2] hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 rounded-full border border-[#f2f2f2] text-[14px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          التالي
        </button>
      </div>
    </div>
  );
}