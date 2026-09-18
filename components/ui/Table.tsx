import React from "react";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, rowIndex: number) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function Table<T>({ data, columns, loading, pagination }: TableProps<T>) {
  return (
    <div className="w-full bg-white rounded-[24px] shadow-sm border border-gray-50 flex flex-col">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-right" dir="rtl">
          <thead>
            <tr className="border-b border-gray-100 bg-[#f8fafc]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-[24px] py-[16px] text-[12px] font-medium text-gray-500 whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, rowIdx) => (
                <tr
                  key={`skeleton-${rowIdx}`}
                  className="border-b border-gray-50 last:border-b-0 animate-pulse"
                >
                  {columns.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-[24px] py-[20px] whitespace-nowrap"
                    >
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-[24px] py-[32px] text-center text-gray-400 text-[14px]"
                >
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-[24px] py-[20px] text-[14px] text-gray-800 whitespace-nowrap"
                    >
                      {col.cell ? col.cell(row, rowIdx) : (col.accessorKey ? row[col.accessorKey] as React.ReactNode : null)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-gray-100 bg-white">
          <div className="text-[12px] text-gray-500">
            عرض {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} إلى {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
          </div>

          <div className="flex items-center gap-[8px]" dir="ltr">
            <button
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`w-[32px] h-[32px] flex items-center justify-center rounded-full text-[12px] font-medium transition-colors ${
                    pagination.currentPage === page
                      ? "bg-[#002ec1] text-white shadow-md shadow-blue-900/20"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
