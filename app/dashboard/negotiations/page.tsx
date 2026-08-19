"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SummaryCard from "../../../components/dashboard/SummaryCard";
import Table, { ColumnDef } from "../../../components/ui/Table";
import { useNegotiations, useNegotiationStats } from "../../../hooks/queries/useNegotiations";
import { Negotiation, NegotiationStatus } from "../../../lib/api/negotiations";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatsGrid } from "@/components/dashboard/layout/StatsGrid";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import { NegotiationFilters } from "@/components/dashboard/negotiations/NegotiationFilters";

const STATUS_MAP: Record<NegotiationStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'قيد الانتظار', bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  CONNECTED: { label: 'جاري التواصل', bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' },
  COMPLETED: { label: 'مكتمل', bg: 'bg-[#D1FAE5]', text: 'text-[#16A34A]' },
  CANCELLED: { label: 'ملغي', bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

const getStatusBadge = (status: NegotiationStatus) => {
  const config = STATUS_MAP[status];
  return (
    <div
      className={`inline-flex items-center justify-center px-[12px] py-[4px] rounded-[128px] text-[12px] font-light ${config.bg} ${config.text}`}
    >
      {config.label}
    </div>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const getColumns = (onView: (id: string) => void): ColumnDef<Negotiation>[] => [
  {
    header: "رقم المفاوضة",
    accessorKey: "id",
    cell: (row) => (
      <span className="font-medium text-[#111] text-[14px]">
        {row.id.substring(0, 8)}...
      </span>
    ),
  },
  {
    header: "السيارة",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="text-[#111] text-[14px] font-medium">
          {row.car.brand} {row.car.model}
        </span>
        <span className="text-[#6B7280] text-[12px]">{row.car.year}</span>
      </div>
    ),
  },
  {
    header: "المشتري",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="text-[#111] text-[14px]">
          {row.buyer.firstName && row.buyer.lastName
            ? `${row.buyer.firstName} ${row.buyer.lastName}`
            : 'غير محدد'}
        </span>
        <span className="text-[#6B7280] text-[12px]">{row.buyer.phone}</span>
      </div>
    ),
  },
  {
    header: "السعر المطلوب",
    cell: (row) => (
      <span className="text-[#111] text-[14px]">{formatPrice(row.askingPrice)}</span>
    ),
  },
  {
    header: "العرض الأولي",
    cell: (row) => (
      <span className="text-[#111] text-[14px]">{formatPrice(row.initialOffer)}</span>
    ),
  },
  {
    header: "السعر النهائي",
    cell: (row) => (
      <span className="text-[14px]">
        {row.finalPrice ? formatPrice(row.finalPrice) : '-'}
      </span>
    ),
  },
  {
    header: "الحالة",
    cell: (row) => getStatusBadge(row.status),
  },
  {
    header: "التاريخ",
    cell: (row) => (
      <span className="text-[#4B5563] text-[14px]">{formatDate(row.createdAt)}</span>
    ),
  },
  {
    header: "الإجراءات",
    cell: (row) => (
      <button
        className="text-gray-400 hover:text-gray-800 transition-colors px-[8px] flex items-center justify-center w-full"
        onClick={() => onView(row.id)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    ),
  },
];

export default function NegotiationsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<NegotiationStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const { data, isLoading, isError, refetch } = useNegotiations({
    page: currentPage,
    limit: 10,
    status: selectedStatus,
    search: searchQuery || undefined,
  });

  const { data: stats } = useNegotiationStats();

  const negotiations = data?.items || [];
  const meta = data ? {
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  } : null;

  const filteredNegotiations = negotiations.filter((n) => {
    // Date filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      const createdAt = new Date(n.createdAt);
      if (createdAt < fromDate) return false;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      const createdAt = new Date(n.createdAt);
      if (createdAt > toDate) return false;
    }
    // Price filters (filter by askingPrice or finalPrice if available)
    const priceToCompare = n.finalPrice || n.askingPrice;
    if (minPrice && priceToCompare < parseFloat(minPrice)) return false;
    if (maxPrice && priceToCompare > parseFloat(maxPrice)) return false;
    return true;
  });

  useEffect(() => {
    // React Query refetches automatically when variables change
  }, [currentPage, selectedStatus]);

  if (isError) {
    return (
      <PageContainer>
        <PageHeader title="المفاوضات" />
        <ErrorState onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="المفاوضات" />

      <StatsGrid columns={4}>
        <SummaryCard
          title="إجمالي المفاوضات"
          value={stats?.total.toString() || "0"}
          iconSrc="/assets/dashboard/negotiations.svg"
        />
        <SummaryCard
          title="قيد الانتظار"
          value={stats?.pending.toString() || "0"}
          iconSrc="/assets/dashboard/cards/clock.svg"
        />
        <SummaryCard
          title="جاري التواصل"
          value={stats?.connected.toString() || "0"}
          iconSrc="/assets/dashboard/cards/clock.svg"
        />
        <SummaryCard
          title="مكتملة"
          value={stats?.completed.toString() || "0"}
          iconSrc="/assets/dashboard/cards/check-circle.svg"
        />
      </StatsGrid>

      <ContentCard
        title="المفاوضات الحالية"
        titleCount={meta?.total || 0}
        filters={
          <NegotiationFilters
            selectedStatus={selectedStatus}
            onStatusChange={(status) => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={() => {
              setCurrentPage(1);
              refetch();
            }}
            onReset={() => {
              setDateFrom("");
              setDateTo("");
              setMinPrice("");
              setMaxPrice("");
            }}
          />
        }
      >
        <Table
          data={filteredNegotiations}
          columns={getColumns((id) => router.push(`/dashboard/negotiations/${id}`))}
          loading={isLoading}
          pagination={
            meta
              ? {
                  currentPage,
                  totalPages: meta.totalPages,
                  totalItems: meta.total,
                  itemsPerPage: meta.limit,
                  onPageChange: setCurrentPage,
                }
              : undefined
          }
        />
      </ContentCard>
    </PageContainer>
  );
}