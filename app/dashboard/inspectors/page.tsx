"use client";

import React, { useState, useEffect, useCallback } from "react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import InspectorCard from "@/components/dashboard/InspectorCard";
import Table, { ColumnDef } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import AddInspectorModal from "@/components/dashboard/AddInspectorModal";
import { useInspectors, useInspectorStats } from "@/hooks/queries/useInspectors";
import WeeklyTimeline from "@/components/dashboard/WeeklyTimeline";
import { InspectorListItem } from "@/lib/api/inspectors";

export default function InspectorsPage() {
  const [activeTab, setActiveTab] = useState("inspectors");
  const [viewType, setViewType] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const buildFilters = useCallback(() => ({
    page: currentPage,
    limit: 12,
    search: searchQuery || undefined,
    status: (statusFilter || "all") as "active" | "inactive" | "all",
  }), [currentPage, searchQuery, statusFilter]);

  const { data: inspectorsData, isLoading, isError, error, refetch } = useInspectors(buildFilters());
  const { data: statsData } = useInspectorStats();

  const inspectors = inspectorsData?.items || [];
  const meta = inspectorsData ? {
    total: inspectorsData.total,
    page: inspectorsData.page,
    limit: inspectorsData.limit,
    totalPages: inspectorsData.totalPages,
  } : null;
  const stats = statsData;

  useEffect(() => {
    refetch();
  }, [currentPage, statusFilter, searchQuery]);

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const listColumns: ColumnDef<InspectorListItem>[] = [
    {
      header: "الاسم",
      cell: (row) =>
        `${row.firstName || ""} ${row.lastName || ""}`.trim() || "—",
    },
    {
      header: "الهاتف",
      accessorKey: "phone",
    },
    {
      header: "إجمالي الفحوصات",
      cell: (row) => row.stats.totalInspections,
    },
    {
      header: "المكتملة",
      cell: (row) => row.stats.completed,
    },
    {
      header: "قيد التنفيذ",
      cell: (row) => row.stats.inProgress,
    },
    {
      header: "الملغية",
      cell: (row) => row.stats.cancelled,
    },
    {
      header: "الحالة",
      cell: (row) => (
        <span
          className={`px-[12px] py-[4px] rounded-full text-[12px] font-medium ${row.isActive
            ? "bg-[#F0FDF4] text-[#16A34A]"
            : "bg-gray-100 text-gray-500"
            }`}
        >
          {row.isActive ? "نشط" : "غير نشط"}
        </span>
      ),
    },
  ];

  return (
    <div
      className="flex flex-col w-full h-full max-w-[1200px] mx-auto gap-[24px]"
      dir="rtl"
    >
      {/* Top Header Section with Breadcrumbs and Add Button */}
      <div className="flex flex-col gap-[16px]">
        {/* Title and Add Button Row */}
        <div className="flex items-center justify-between w-full">
          <h1 className="text-[32px] font-bold text-[#111]">المفتشين</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#002ec1] hover:bg-[#0025a1] text-white h-[44px] px-[24px] rounded-[12px] flex items-center gap-[8px] transition-all duration-300"
          >
            <div className="bg-white/20 w-[24px] h-[24px] rounded-full flex items-center justify-center">
              <span className="text-[18px] font-bold">+</span>
            </div>
            <span className="text-[14px] font-medium">اضافة مفتش</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px] w-full">
        <SummaryCard
          title="جمالي الفحوصات المكتملة"
          value={stats?.totalCompletedInspections?.toString() || "0"}
          iconSrc="/assets/dashboard/cards/user-tick.svg"
          isPositive={true}
        />
        <SummaryCard
          title="مهام مجدولة لليوم"
          value={stats?.scheduledToday?.toString() || "0"}
          iconSrc="/assets/dashboard/cards/shop.svg"
          isPositive={true}
        />
        <SummaryCard
          title="متاح الآن للمواعيد"
          value={stats?.availableNow?.toString() || "0"}
          iconSrc="/assets/dashboard/cards/user-tick.svg"
          isPositive={true}
        />
        <SummaryCard
          title="اجمالي المفتشين"
          value={stats?.totalInspectors?.toString() || "0"}
          iconSrc="/assets/dashboard/cards/profile.svg"
          isPositive={true}
        />
      </div>
      <div className="bg-white px-8 py-4 rounded-xl">
        {/* Tabs Toggle (Pill shaped) */}
        <div className="flex justify-start w-full mt-[16px]">
          <div className="bg-white p-[4px] rounded-[999px] flex items-center gap-[4px] border border-[#f3f3f3] h-[60px]">
            <button
              onClick={() => setActiveTab("inspectors")}
              className={`h-[48px] px-[20px] rounded-[999px] text-[14px] font-medium transition-all duration-300 flex items-center gap-[8px] ${activeTab === "inspectors" ? "bg-[#002ec1] text-white" : "text-[#6b7280]"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.001 1.5415C14.6664 1.5415 18.4598 5.33414 18.46 9.99951C18.46 14.665 14.6665 18.4585 10.001 18.4585C5.3356 18.4583 1.54297 14.6649 1.54297 9.99951C1.54304 8.14167 2.13164 6.3804 3.24902 4.90088L3.25 4.90186C3.28805 4.85165 3.36522 4.83621 3.4248 4.88135C3.48454 4.92668 3.4907 5.00627 3.45312 5.05615C2.37064 6.48468 1.79304 8.19899 1.79297 9.99951C1.79297 14.5255 5.47498 18.2083 10.001 18.2085C14.5271 18.2085 18.21 14.5257 18.21 9.99951C18.2098 5.47352 14.527 1.7915 10.001 1.7915C9.97093 1.79142 9.93961 1.77897 9.91406 1.75342C9.88853 1.7278 9.87598 1.69659 9.87598 1.6665C9.87598 1.63642 9.88853 1.6052 9.91406 1.57959C9.93961 1.55404 9.97093 1.54159 10.001 1.5415Z" stroke="white" />
                <path d="M10.001 4.0415C13.2831 4.0415 15.9598 6.71747 15.96 9.99951C15.96 13.2817 13.2832 15.9585 10.001 15.9585C6.71893 15.9583 4.04297 13.2816 4.04297 9.99951C4.04306 9.96946 4.0555 9.93815 4.08105 9.9126C4.10667 9.88706 4.13789 9.87451 4.16797 9.87451C4.19805 9.87451 4.22927 9.88706 4.25488 9.9126C4.28043 9.93815 4.29288 9.96946 4.29297 9.99951C4.29297 13.1505 6.84998 15.7083 10.001 15.7085C13.1521 15.7085 15.71 13.1507 15.71 9.99951C15.7098 6.84852 13.152 4.2915 10.001 4.2915C9.97093 4.29142 9.93961 4.27897 9.91406 4.25342C9.88853 4.2278 9.87598 4.19659 9.87598 4.1665C9.87598 4.13642 9.88853 4.1052 9.91406 4.07959C9.93961 4.05404 9.97093 4.04159 10.001 4.0415Z" stroke="white" />
                <path d="M10 6.5415C11.9071 6.5415 13.4578 8.09247 13.458 9.99951C13.458 11.9067 11.9072 13.4585 10 13.4585C9.96992 13.4585 9.9387 13.4459 9.91309 13.4204C9.88753 13.3949 9.87509 13.3635 9.875 13.3335C9.875 13.3034 9.88755 13.2722 9.91309 13.2466C9.93873 13.2209 9.96985 13.2085 10 13.2085C11.7678 13.2085 13.208 11.7673 13.208 9.99951C13.2078 8.23185 11.7677 6.7915 10 6.7915C9.96985 6.7915 9.93873 6.77906 9.91309 6.75342C9.88744 6.72777 9.875 6.69665 9.875 6.6665C9.875 6.63636 9.88744 6.60523 9.91309 6.57959C9.93873 6.55395 9.96985 6.5415 10 6.5415Z" stroke="white" />
              </svg>
              <span className="text-[14px]">المفتشين</span>

            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`h-[48px] px-[20px] rounded-[999px] text-[14px] font-medium transition-all duration-300 flex items-center gap-[8px] ${activeTab === "calendar" ? "bg-[#002ec1] text-white" : "text-[#6b7280]"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.66797 1.6665V4.1665" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.332 1.6665V4.1665" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.91797 7.5752H17.0846" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17.5 7.08317V14.1665C17.5 16.6665 16.25 18.3332 13.3333 18.3332H6.66667C3.75 18.3332 2.5 16.6665 2.5 14.1665V7.08317C2.5 4.58317 3.75 2.9165 6.66667 2.9165H13.3333C16.25 2.9165 17.5 4.58317 17.5 7.08317Z" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.0801 11.4167H13.0875" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.0801 13.9167H13.0875" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.99803 11.4167H10.0055" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.99803 13.9167H10.0055" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.91209 11.4167H6.91957" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.91209 13.9167H6.91957" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[14px]">تقويم الفحص</span>

            </button>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="flex items-start gap-[12px] w-full">
          {/* View Toggle */}
          <div className="flex flex-col gap-[4px] shrink-0 w-[100px]">
            <label className="text-[14px] text-[#1a1a1a] font-normal text-right w-full">
              طريقة العرض
            </label>
            <div className="bg-white h-[48px] w-full rounded-[12px] flex items-center justify-center p-[4px] border border-[#f2f2f2] gap-[4px]">
              <button
                onClick={() => setViewType("grid")}
                className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center transition-all ${viewType === "grid" ? "bg-[#f9fafb] border border-[#e5e7eb]" : "hover:bg-gray-50"}`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.3333 7.09984V3.3165C18.3333 2.1415 17.8 1.6665 16.475 1.6665H13.1083C11.7833 1.6665 11.25 2.1415 11.25 3.3165V7.0915C11.25 8.27484 11.7833 8.7415 13.1083 8.7415H16.475C17.8 8.74984 18.3333 8.27484 18.3333 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.3333 16.475V13.1083C18.3333 11.7833 17.8 11.25 16.475 11.25H13.1083C11.7833 11.25 11.25 11.7833 11.25 13.1083V16.475C11.25 17.8 11.7833 18.3333 13.1083 18.3333H16.475C17.8 18.3333 18.3333 17.8 18.3333 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.7513 7.09984V3.3165C8.7513 2.1415 8.21797 1.6665 6.89297 1.6665H3.5263C2.2013 1.6665 1.66797 2.1415 1.66797 3.3165V7.0915C1.66797 8.27484 2.2013 8.7415 3.5263 8.7415H6.89297C8.21797 8.74984 8.7513 8.27484 8.7513 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.7513 16.475V13.1083C8.7513 11.7833 8.21797 11.25 6.89297 11.25H3.5263C2.2013 11.25 1.66797 11.7833 1.66797 13.1083V16.475C1.66797 17.8 2.2013 18.3333 3.5263 18.3333H6.89297C8.21797 18.3333 8.7513 17.8 8.7513 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

              </button>
              <button
                onClick={() => setViewType("list")}
                className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center transition-all ${viewType === "list" ? "bg-[#f9fafb] border border-[#e5e7eb]" : "hover:bg-gray-50"}`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5013 18.3332H12.5013C16.668 18.3332 18.3346 16.6665 18.3346 12.4998V7.49984C18.3346 3.33317 16.668 1.6665 12.5013 1.6665H7.5013C3.33464 1.6665 1.66797 3.33317 1.66797 7.49984V12.4998C1.66797 16.6665 3.33464 18.3332 7.5013 18.3332Z" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.3346 8.3335H1.66797" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 8.3335V18.3335" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

              </button>
            </div>
          </div>
          {/* Status Dropdown */}
          <div className="flex flex-col gap-[4px] shrink-0 w-[250px]">
            <label className="text-[14px] text-[#1a1a1a] font-normal text-right w-full">
              الحالة
            </label>
            <Select
              value={statusFilter}
              options={[
                { label: "الكل", value: "" },
                { label: "نشط", value: "active" },
                { label: "غير نشط", value: "inactive" },
              ]}
              onChange={handleStatusChange}
            />
          </div>

          {/* Search */}
          <div className="flex flex-col gap-[4px] flex-1">
            <label className="text-[14px] text-[#1a1a1a] font-normal text-right w-full">
              البحث
            </label>
            <div className="flex items-center gap-[8px] w-full">
              {/* Search Input Container */}
              <div className="bg-white h-[48px] flex-1 rounded-[16px] flex items-center px-[16px] border border-[#f2f2f2]">
                <input
                  type="text"
                  placeholder="ابحث الان.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-700 placeholder-[#d1d5db] h-full font-light px-3 text-right"
                />
                <img
                  src="/assets/dashboard/search.svg"
                  alt="Search"
                  width={20}
                  height={20}
                  className="opacity-30 shrink-0"
                />
              </div>
              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-white border border-[#f2f2f2] h-[48px] w-[120px] rounded-[999px] text-[#002ec1] text-[14px] font-semibold hover:bg-gray-50 transition-all shrink-0"
              >
                بحث
              </button>
            </div>
          </div>

        </div>

        {/* Content Area */}
        {activeTab === "inspectors" && (
          <div className="flex flex-col gap-[20px] mt-[8px]">
            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
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
                <p className="text-gray-600 text-lg">حدث خطأ أثناء تحميل البيانات</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    refetch();
                  }}
                >
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && viewType === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[24px] p-[16px] shadow-sm border border-gray-100 animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-[20px]">
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[52px] h-[52px] bg-gray-200 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24" />
                          <div className="h-3 bg-gray-200 rounded w-32" />
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="h-[60px] bg-gray-100 rounded-[12px]" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && inspectors.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">لا يوجد مفتشين</p>
              </div>
            )}

            {/* Grid View */}
            {!isLoading && !isError && viewType === "grid" && inspectors.length > 0 && (
              <>
                <h2 className="text-[18px] font-semibold text-[#111]">
                  المفتشين ({meta?.total || 0})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                  {inspectors.map((inspector) => (
                    <InspectorCard
                      key={inspector.id}
                      id={inspector.id}
                      name={`${inspector.firstName || ""} ${inspector.lastName || ""}`.trim() || "—"}
                      phone={inspector.phone}
                      totalInspections={inspector.stats.totalInspections}
                      completed={inspector.stats.completed}
                      inProgress={inspector.stats.inProgress}
                      cancelled={inspector.stats.cancelled}
                      avatarSrc={inspector.avatar ?? undefined}
                    />
                  ))}
                </div>
              </>
            )}

            {/* List View */}
            {!isLoading && !isError && viewType === "list" && (
              <>
                <h2 className="text-[18px] font-semibold text-[#111]">
                  المفتشين ({meta?.total || 0})
                </h2>
                <Table
                  data={inspectors}
                  columns={listColumns}
                  loading={isLoading}
                  pagination={
                    meta && meta.totalPages > 1
                      ? {
                        currentPage: currentPage,
                        totalPages: meta.totalPages,
                        onPageChange: setCurrentPage,
                        totalItems: meta.total,
                        itemsPerPage: meta.limit,
                      }
                      : undefined
                  }
                />
              </>
            )}

            {/* Pagination for Grid View */}
            {!isLoading && !isError && viewType === "grid" && meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-[8px] mt-[16px]" dir="ltr">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-[40px] h-[40px] flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                {[...Array(meta.totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-[40px] h-[40px] flex items-center justify-center rounded-full text-[14px] font-medium transition-colors ${currentPage === page
                        ? "bg-[#002ec1] text-white shadow-md shadow-blue-900/20"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(meta.totalPages, currentPage + 1))}
                  disabled={currentPage === meta.totalPages}
                  className="w-[40px] h-[40px] flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <WeeklyTimeline />
        )}

        {/* Add Inspector Modal */}
        <AddInspectorModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      </div></div>
  );
}
