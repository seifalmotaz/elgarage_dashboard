import React from "react";
import Table, { ColumnDef } from "../../ui/Table";
import {
  CarsTableRow,
  mapPublicationStatus,
  formatPrice,
  formatMileage,
} from "../../../lib/utils/car-transformers";

interface CarsTableProps {
  data: CarsTableRow[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "مميز":
      return "bg-[#f0fdf4] text-[#16a34a]";
    case "مستعملة":
    default:
      return "bg-[#fef3c7] text-[#ca8a04]";
  }
};

const getApprovalStyles = (status: string) => {
  switch (status) {
    case "منشورة":
      return "bg-[#F2FAF6] text-[#0C9D61]";
    case "مرفوضة":
      return "bg-[#FFE0DE] text-[#AF1208]";
    case "مباعة":
      return "bg-[#eff6ff] text-[#2563eb]";
    case "قيد المراجعة":
      return "bg-[#FFF8EB] text-[#F59E0B]";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const createColumns = (
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void,
  onView?: (id: string) => void
): ColumnDef<CarsTableRow>[] => [
  {
    header: "السيارة",
    cell: (row) => (
      <div className="flex items-center justify-end gap-3 min-w-[200px]">
        <div className="flex flex-col items-end">
          <span className="text-[#1a1a1a] text-[14px] font-medium text-right">
            {row.brand} {row.model}
          </span>
          <span className="text-[#6b7280] text-[12px] font-light">{row.year}</span>
        </div>
        <div className="w-[52px] h-[52px] rounded-[8px] overflow-hidden relative shrink-0">
          <img
            src={row.images?.[0] || "/assets/dashboard/cars/car-sample.png"}
            alt={`${row.brand} ${row.model}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    header: "الموديل",
    cell: (row) => <span className="text-[#4B5563] text-[14px]">{row.year}</span>,
  },
  {
    header: "اسم البائع",
    cell: (row) => (
      <div className="flex items-center justify-center gap-2">
        <span className="text-[#4B5563] text-[14px]">{row.address || "جراج"}</span>
        <div className="w-[24px] h-[24px] bg-[#ebf1ff] rounded-full flex items-center justify-center relative overflow-hidden">
          <img
            src="/assets/dashboard/users.svg"
            alt="User"
            width={12}
            height={12}
            className="opacity-40"
          />
        </div>
      </div>
    ),
  },
  {
    header: "الكيلو مترات",
    cell: (row) => (
      <div className="bg-[#f8fafc] px-3 py-1.5 rounded-full inline-block">
        <span className="text-[#4B5563] text-[12px]">{formatMileage(row.mileage)}</span>
      </div>
    ),
  },
  {
    header: "السعر",
    cell: (row) => (
      <div className="bg-[#f8fafc] px-3 py-1.5 rounded-full inline-block">
        <span className="text-[#1851b4] text-[12px] font-semibold">
          {formatPrice(row.price)} ج.م
        </span>
      </div>
    ),
  },
  {
    header: "حالة النشر",
    cell: (row) => (
      <div
        className={`inline-flex items-center justify-center px-[12px] py-[4px] rounded-full text-[12px] font-light ${getApprovalStyles(
          mapPublicationStatus(row.status)
        )}`}
      >
        {mapPublicationStatus(row.status)}
      </div>
    ),
  },
  {
    header: "الإجراءات",
    cell: (row) => (
      <div className="flex items-center justify-center gap-1">
        {onView && (
          <button
            onClick={() => onView(row.id)}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            title="عرض"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(row.id)}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            title="تعديل"
          >
            <img
              src="/assets/dashboard/cars/edit.svg"
              alt="Edit"
              width={20}
              height={20}
              className="opacity-50"
            />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(row.id)}
            className="p-2 hover:bg-red-50 rounded-full transition-colors"
            title="حذف"
          >
            <img
              src="/assets/dashboard/cars/remove.svg"
              alt="Delete"
              width={20}
              height={20}
              className="opacity-50"
            />
          </button>
        )}
      </div>
    ),
  },
];

export default function CarsTable({ data, onEdit, onDelete, onView }: CarsTableProps) {
  const columns = createColumns(onEdit, onDelete, onView);

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-8">
      <Table
        data={data}
        columns={columns}
        pagination={{
          currentPage: 1,
          totalPages: 4,
          totalItems: 32,
          itemsPerPage: 6,
          onPageChange: () => {},
        }}
      />
    </div>
  );
}