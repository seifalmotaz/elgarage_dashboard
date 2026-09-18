"use client";

import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import SummaryCard from "../../../components/dashboard/SummaryCard";
import InspectionSettingsManager from "../../../components/dashboard/inspection/InspectionSettingsManager";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatsGrid } from "@/components/dashboard/layout/StatsGrid";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { TabToggle } from "@/components/dashboard/common/TabToggle";
import { DateRangeFilter } from "@/components/dashboard/filters/DateRangeFilter";
import {
  STATUS_MAP,
  STATUS_OPTIONS,
} from "../../../lib/api/listing-requests";
import type { ListingRequestListItem, ListingRequestsStats } from "../../../lib/api/listing-requests";
import { useListingRequests, useListingRequestsStats } from "../../../hooks/queries/useListingRequests";
import { useCancelRequestMutation } from "../../../hooks/mutations/useListingRequests";
import { formatDate } from "../../../lib/utils/date";
import { truncateId } from "../../../lib/utils/string";
import { calculateSuccessRate } from "../../../lib/utils/stats";

export default function SalesRequestsPage() {
  const [activeToggle, setActiveToggle] = useState<"requests" | "config">("requests");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  // Advanced filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // React Query hooks
  const { data: requestsData, isLoading: requestsLoading } = useListingRequests({
    status: statusFilter || undefined,
    search: searchText || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit: 20,
  });

  const cancelMutation = useCancelRequestMutation();

  const { data: statsData } = useListingRequestsStats();

  const requests = requestsData?.items ?? [];
  const total = requestsData?.total ?? 0;
  const totalPages = requestsData?.totalPages ?? 1;
  const limit = requestsData?.limit ?? 20;
  const stats = statsData ?? null;

  const handleSearch = () => {
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const inspectorName = (req: ListingRequestListItem) => {
    const insp = req.assignedInspector;
    if (!insp) return null;
    return [insp.firstName, insp.lastName].filter(Boolean).join(" ") || "--";
  };

  const clientName = (req: ListingRequestListItem) => {
    const u = req.user;
    return [u.firstName, u.lastName].filter(Boolean).join(" ") || "--";
  };

  const handleCancel = async (reqId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء الطلب؟")) return;
    await cancelMutation.mutateAsync({ requestId: reqId });
  };

  // Check if any advanced filter is active
  const hasAdvancedFilters = fromDate || toDate;

  // Reset advanced filters
  const handleResetAdvancedFilters = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <PageContainer>
      <PageHeader
        title={
          activeToggle === "config"
            ? "تهيئة بيانات الفحص"
            : "طلبات البيع و الفحص"
        }
      />

      {activeToggle === "requests" ? (
        <StatsGrid columns={4}>
          <SummaryCard
            title="طلبات فحص جديدة"
            value={stats ? String(stats.pending) : "0"}
            iconSrc="/assets/dashboard/sales-requests/note-2.svg"
          />
          <SummaryCard
            title="بانتظار التعيين"
            value={stats ? String(stats.assigned) : "0"}
            iconSrc="/assets/dashboard/sales-requests/user-add.svg"
          />
          <SummaryCard
            title="فحوصات مكتملة"
            value={stats ? String(stats.inspected) : "0"}
            iconSrc="/assets/dashboard/sales-requests/tick-circle.svg"
          />
          <SummaryCard
            title="نسبة اعتمادات النجاح"
            value={calculateSuccessRate(stats)}
            iconSrc="/assets/dashboard/sales-requests/copy-success.svg"
          />
        </StatsGrid>
      ) : null}

      <ContentCard className="p-6">
        <TabToggle
          tabs={[
            { id: "requests", label: "طلبات الفحص", icon: "/assets/dashboard/sales-requests/scanner.svg" },
            { id: "config", label: "أسئلة الفحص", icon: "/assets/dashboard/sales-requests/note-2.svg" },
          ]}
          activeTab={activeToggle}
          onTabChange={(id) => setActiveToggle(id as "requests" | "config")}
        />

        {activeToggle === "requests" ? (
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-semibold text-[#002ec1]">
              طلبات البيع والفحص ({total})
            </h3>

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_120px] gap-4 items-end">
              <Select
                label="الحالة"
                value={statusFilter}
                options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                onChange={handleStatusChange}
              />

              <div className="flex flex-col gap-2">
                <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5]">
                  البحث
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث الان.."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full h-[50px] bg-white border border-[#f2f2f2] rounded-[16px] px-10 text-[12px] font-light text-[#1a1a1a] focus:border-[#002ec1] outline-none"
                  />
                  <img
                    src="/assets/dashboard/search.svg"
                    alt="search"
                    width={18}
                    height={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="h-[50px] border-[#002ec1] text-[#002ec1] rounded-[16px] font-semibold"
                onClick={handleSearch}
              >
                بحث
              </Button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-[14px] text-[#002ec1] hover:text-[#001a8f] transition-colors self-start"
            >
              <span>فلاتر متقدمة</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {hasAdvancedFilters && (
                <span className="bg-[#002ec1] text-white text-[10px] px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="bg-[#fafafa] rounded-[16px] p-6 border border-[#f2f2f2]">
                <DateRangeFilter
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromChange={(val) => {
                    setFromDate(val);
                    setPage(1);
                  }}
                  onToChange={(val) => {
                    setToDate(val);
                    setPage(1);
                  }}
                  label="تاريخ الطلب"
                  onClear={() => {
                    setFromDate("");
                    setToDate("");
                    setPage(1);
                  }}
                  width="w-full"
                />
                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAdvancedFilters}
                  >
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            )}

            {/* Table */}
            {requestsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-[14px] text-[#6b7280]">جاري التحميل...</div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="bg-[#f9fafb] border-b border-[#f2f2f2]">
                        <th className="px-6 py-4 text-start text-[12px] font-medium text-[#6b7280]">
                          رقم الطلب
                        </th>
                        <th className="px-6 py-4 text-start text-[12px] font-medium text-[#6b7280]">
                          السيارة
                        </th>
                        <th className="px-6 py-4 text-start text-[12px] font-medium text-[#6b7280]">
                          العميل
                        </th>
                        <th className="px-6 py-4 text-start text-[12px] font-medium text-[#6b7280]">
                          المنطقة
                        </th>
                        <th className="px-6 py-4 text-start text-[12px] font-medium text-[#6b7280]">
                          المفتش المعين
                        </th>
                        <th className="px-6 py-4 text-start text-[12px] font-medium text-[#6b7280]">
                          التاريخ
                        </th>
                        <th className="px-6 py-4 text-start text-[12px] font-medium text-[#6b7280]">
                          الحالة
                        </th>
                        <th className="px-6 py-4 text-center text-[12px] font-medium text-[#6b7280]">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-[14px] text-[#8286ab]">
                            لا توجد طلبات
                          </td>
                        </tr>
                      ) : (
                        requests.map((req) => {
                          const statusStyle = STATUS_MAP[req.status];
                          return (
                            <tr
                              key={req.id}
                              className="border-b border-[#f2f2f2] hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-6 py-6 text-[14px] font-semibold text-[#1a1a1a]">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#002ec1"
                                      strokeWidth="2"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                      <line x1="16" y1="13" x2="8" y2="13" />
                                      <line x1="16" y1="17" x2="8" y2="17" />
                                    </svg>
                                  </div>
                                  <span>{truncateId(req.id)}</span>
                                </div>
                              </td>
                              <td className="px-6 py-6 text-[14px] text-[#4b5563] font-normal">
                                {req.brand} {req.model} {req.year}
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-[14px] text-[#1a1a1a] font-normal">
                                    {clientName(req)}
                                  </span>
                                  <span className="text-[12px] text-[#8286ab] font-light">
                                    {req.user.phone}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6 text-[14px] text-[#4b5563] font-normal">
                                {req.address || "--"}
                              </td>
                              <td className="px-6 py-6">
                                {inspectorName(req) ? (
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="text-[14px] text-[#1a1a1a] font-normal">
                                      {inspectorName(req)}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-12 h-0.5 bg-[#e5e7eb] rounded-full"></div>
                                )}
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-[14px] text-[#1a1a1a] font-normal">
                                    {formatDate(req.scheduledDate)}
                                  </span>
                                  <span className="text-[12px] text-[#8286ab] font-light">
                                    {req.scheduledTime}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <span
                                  className={`px-4 py-1.5 rounded-[12px] text-[12px] font-medium ${statusStyle.bg} ${statusStyle.text}`}
                                >
                                  {statusStyle.label}
                                </span>
                              </td>
                              <td className="px-6 py-6 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <a
                                    href={`/dashboard/sales-requests/${req.id}`}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-flex"
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#6b7280"
                                      strokeWidth="1.5"
                                    >
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="12" cy="5" r="1" />
                                      <circle cx="12" cy="19" r="1" />
                                    </svg>
                                  </a>
                                  {['PENDING', 'ASSIGNED'].includes(req.status) && (
                                    <button
                                      onClick={() => handleCancel(req.id)}
                                      disabled={cancelMutation.isPending}
                                      className="p-2 hover:bg-red-50 rounded-full transition-colors inline-flex"
                                      title="إلغاء الطلب"
                                    >
                                      <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#EF4444"
                                        strokeWidth="1.5"
                                      >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-[#f2f2f2]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        aria-label="الصفحة السابقة"
                        className="w-10 h-10 rounded-[12px] border border-[#f2f2f2] flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                      >
                        <img
                          src="/assets/dashboard/cars/car-arrow-left.svg"
                          alt="prev"
                          width={16}
                          height={16}
                        />
                      </button>
                      <div className="flex items-center gap-2 px-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => Math.abs(p - page) <= 2)
                          .map((p) => (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              aria-label={`الصفحة ${p}`}
                              aria-current={p === page ? "page" : undefined}
                              className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[14px] ${
                                p === page
                                  ? "bg-[#002ec1] text-white font-semibold"
                                  : "text-[#8286ab]"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                      </div>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        aria-label="الصفحة التالية"
                        className="w-10 h-10 rounded-[12px] border border-[#f2f2f2] flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                      >
                        <img
                          src="/assets/dashboard/cars/car-arrow-left.svg"
                          alt="next"
                          width={16}
                          height={16}
                          className="rotate-180"
                        />
                      </button>
                    </div>
                    <span className="text-[14px] text-[#8286ab] font-light">
                      عرض {((page - 1) * limit) + 1} إلى {Math.min(page * limit, total)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <InspectionSettingsManager />
        )}
      </ContentCard>
    </PageContainer>
  );
}