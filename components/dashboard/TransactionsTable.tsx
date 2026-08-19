"use client";

import React, { useState } from "react";
import Table, { ColumnDef } from "../ui/Table";
import { useListingRequests } from "../../hooks/queries/useListingRequests";
import { STATUS_MAP } from "../../lib/api/listing-requests";

interface TransactionRow {
  id: string;
  customerName: string;
  car: string;
  inspectorName: string;
  status: { label: string; bg: string; text: string };
  date: string;
  time: string;
}

const columns: ColumnDef<TransactionRow>[] = [
  {
    header: "رقم الطلب",
    accessorKey: "id",
    cell: (row) => <span className="font-medium text-gray-800">{row.id}</span>,
  },
  {
    header: "اسم العميل",
    cell: (row) => (
      <div className="flex items-center gap-[8px]">
        <div className="w-[24px] h-[24px] bg-[#ebf1ff] rounded-full overflow-hidden flex items-center justify-center border border-white">
           <img src="/assets/dashboard/users.svg" alt="Avatar" width={12} height={12} className="opacity-40" />
        </div>
        <span>{row.customerName}</span>
      </div>
    ),
  },
  {
    header: "السيارة",
    accessorKey: "car",
  },
  {
    header: "المفتش المعين",
    cell: (row) => (
      <div className="flex items-center gap-[8px]">
        <div className="w-[24px] h-[24px] bg-[#ebf1ff] rounded-full overflow-hidden flex items-center justify-center border border-white">
           <img src="/assets/dashboard/users.svg" alt="Avatar" width={12} height={12} className="opacity-40" />
        </div>
        <span>{row.inspectorName}</span>
      </div>
    ),
  },
  {
    header: "الحالة",
    cell: (row) => (
      <div className={`inline-flex items-center justify-center px-[12px] py-[4px] rounded-[10px] text-[10px] font-medium ${row.status.bg} ${row.status.text}`}>
        {row.status.label}
      </div>
    ),
  },
  {
    header: "تاريخ الطلب",
    cell: (row) => (
      <div className="flex flex-col text-[12px]">
        <span className="text-gray-800">{row.time}</span>
        <span className="text-gray-500 font-light">{row.date}</span>
      </div>
    ),
  },
  {
    header: "الإجراءات",
    cell: () => (
      <button className="text-gray-400 hover:text-gray-800 transition-colors px-[8px]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
        </svg>
      </button>
    ),
  },
];

export default function TransactionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useListingRequests({ page: currentPage, limit: 8 });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;
  const itemsPerPage = data?.limit ?? 8;

  const tableData: TransactionRow[] = items.map((item) => {
    const statusConfig = STATUS_MAP[item.status] || { label: item.status, bg: "bg-gray-50", text: "text-gray-600" };
    const customerName = [item.user?.firstName, item.user?.lastName].filter(Boolean).join(" ") || item.user?.phone || "—";
    const inspectorName = [item.assignedInspector?.firstName, item.assignedInspector?.lastName].filter(Boolean).join(" ") || "—";
    const createdAt = new Date(item.createdAt);
    return {
      id: item.id,
      customerName,
      car: `${item.brand} ${item.model} ${item.year}`,
      inspectorName,
      status: statusConfig,
      date: createdAt.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }),
      time: createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };
  });

  return (
    <div className="mt-[32px] mb-[24px] flex flex-col gap-[16px]">
      <h2 className="text-[16px] text-[#002ec1] font-semibold pr-[8px]">
        سجل الطلبات
      </h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002ec1]" />
        </div>
      ) : tableData.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          لا توجد طلبات حالياً
        </div>
      ) : (
        <Table
          data={tableData}
          columns={columns}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        />
      )}
    </div>
  );
}
