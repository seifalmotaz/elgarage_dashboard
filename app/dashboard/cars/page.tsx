"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SummaryCard from "../../../components/dashboard/SummaryCard";
import CarCard from "../../../components/dashboard/cars/CarCard";
import FilterBar from "../../../components/dashboard/cars/FilterBar";
import CarsTable from "../../../components/dashboard/cars/CarsTable";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import toast from "react-hot-toast";
import { useCars } from "../../../hooks/queries/useCars";
import { useDeleteCarMutation, useToggleFeaturedMutation } from "../../../hooks/mutations/useCars";
import {
  transformCarToCard,
  transformCarToTableRow,
  calculateStats,
} from "../../../lib/utils/car-transformers";
import type { CarFilters } from "@/lib/api/cars";
import { RangeFilter } from "@/components/dashboard/filters/RangeFilter";
import { useDebounce } from "@/hooks/useDebounce";

export default function CarsPage() {
  const router = useRouter();

  // View mode state
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter states
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "published" | "rejected" | "sold" | "special">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Advanced filter states
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minMileage, setMinMileage] = useState("");
  const [maxMileage, setMaxMileage] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced range filter values to prevent excessive re-fetching
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);
  const debouncedMinYear = useDebounce(minYear, 500);
  const debouncedMaxYear = useDebounce(maxYear, 500);
  const debouncedMinMileage = useDebounce(minMileage, 500);
  const debouncedMaxMileage = useDebounce(maxMileage, 500);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);

  // Build filters for query
  const filters = useMemo<CarFilters>(() => {
    const f: CarFilters = {};

    // Map tab to status filter
    if (activeTab === "draft") {
      f.status = "DRAFT";
    } else if (activeTab === "published") {
      f.status = "PUBLISHED";
    } else if (activeTab === "sold") {
      f.status = "SOLD";
    } else if (activeTab === "special") {
      f.isFeatured = true;
    }
    // 'all' and 'rejected' don't have direct status mapping

    if (searchQuery) {
      f.brand = searchQuery;
    }

    // Range filters
    if (debouncedMinPrice) f.minPrice = Number(debouncedMinPrice);
    if (debouncedMaxPrice) f.maxPrice = Number(debouncedMaxPrice);
    if (debouncedMinYear) f.minYear = Number(debouncedMinYear);
    if (debouncedMaxYear) f.maxYear = Number(debouncedMaxYear);
    if (debouncedMinMileage) f.minMileage = Number(debouncedMinMileage);
    if (debouncedMaxMileage) f.maxMileage = Number(debouncedMaxMileage);

    f.page = currentPage;
    f.limit = itemsPerPage;

    return f;
  }, [activeTab, searchQuery, currentPage, debouncedMinPrice, debouncedMaxPrice, debouncedMinYear, debouncedMaxYear, debouncedMinMileage, debouncedMaxMileage]);

  // Use the React Query hooks
  const { data: carsData, isLoading, error, refetch } = useCars(filters);
  const deleteCarMutation = useDeleteCarMutation();
  const toggleFeaturedMutation = useToggleFeaturedMutation();

  // Extract cars and meta from response
  const cars = carsData?.data || [];
  const meta = carsData ? {
    total: carsData.total,
    page: carsData.page,
    limit: carsData.limit,
    totalPages: carsData.totalPages,
  } : undefined;

  // Handle tab change
  const handleTabChange = (tab: "all" | "draft" | "published" | "rejected" | "sold" | "special") => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    // The useEffect will trigger fetch with new searchQuery
  };

  // Delete dialog handlers
  const openDeleteDialog = (id: string) => {
    setCarToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  // Handle delete car
  const handleDeleteCar = async () => {
    if (!carToDelete) return;

    try {
      await deleteCarMutation.mutateAsync(carToDelete);
      toast.success('تم حذف السيارة بنجاح');
      closeDeleteDialog();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل حذف السيارة';
      toast.error(message);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Reset advanced filters
  const handleResetAdvancedFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setMinMileage("");
    setMaxMileage("");
    setCurrentPage(1);
  };

  // Check if any advanced filter is active
  const hasAdvancedFilters = minPrice || maxPrice || minYear || maxYear || minMileage || maxMileage;

  // Calculate summary stats from cars
  const stats = calculateStats(cars);

  // Transform data for components
  const transformedCars = cars.map(transformCarToCard);
  const tableRows = cars.map(transformCarToTableRow);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002ec1]"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" dir="rtl">
        <p className="text-red-500 text-lg">حدث خطأ أثناء تحميل السيارات</p>
        <p className="text-gray-500 text-sm">{error.message}</p>
        <Button
          variant="primary"
          size="md"
          onClick={() => refetch()}
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 w-full max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        {/* 1st child -> RIGHT in RTL */}
        <h1 className="text-[32px] font-bold text-[#111]">السيارات</h1>
        {/* 2nd child -> LEFT in RTL */}
        <Link href="/dashboard/cars/new">
          <Button
            variant="primary"
            size="lg"
            icon={<img src="/assets/dashboard/cars/add.svg" alt="Add" width={20} height={20} />}
            iconPosition="right"
          >
            اضافة سيارة جديدة
          </Button>
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="إجمالي السيارات"
          value={stats.total.toString()}
          iconSrc="/assets/dashboard/cars/stats-car.svg"
        />
        <SummaryCard
          title="متاح للبيع"
          value={stats.published.toString()}
          iconSrc="/assets/dashboard/cars/stats-tick.svg"
        />
        <SummaryCard
          title="قيد المراجعة"
          value={stats.draft.toString()}
          iconSrc="/assets/dashboard/cars/stats-clock.svg"
        />
        <SummaryCard
          title="مبيعات الشهر"
          value={stats.sold.toString()}
          iconSrc="/assets/dashboard/cars/stats-chart.svg"
        />
      </div>
      <div className="bg-white px-8 py-4 rounded-xl">

        {/* Filter Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[20px] font-semibold text-[#111]">
            السيارات
          </h2>
          <FilterBar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
          />

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
                {[
                  minPrice || maxPrice,
                  minYear || maxYear,
                  minMileage || maxMileage,
                ].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className="bg-[#fafafa] rounded-[16px] p-6 border border-[#f2f2f2]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RangeFilter
                  label="السعر"
                  minValue={minPrice}
                  maxValue={maxPrice}
                  onMinChange={setMinPrice}
                  onMaxChange={setMaxPrice}
                  placeholderMin="الحد الأدنى"
                  placeholderMax="الحد الأقصى"
                  unit="ج.م"
                />
                <RangeFilter
                  label="سنة الصنع"
                  minValue={minYear}
                  maxValue={maxYear}
                  onMinChange={setMinYear}
                  onMaxChange={setMaxYear}
                  placeholderMin="من"
                  placeholderMax="إلى"
                />
                <RangeFilter
                  label="المسافة المقطوعة"
                  minValue={minMileage}
                  maxValue={maxMileage}
                  onMinChange={setMinMileage}
                  onMaxChange={setMaxMileage}
                  placeholderMin="الحد الأدنى"
                  placeholderMax="الحد الأقصى"
                  unit="كم"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetAdvancedFilters}
                >
                  مسح الفلاتر
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  className="rounded-full"
                >
                  تطبيق الفلاتر
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {cars.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <img
              src="/assets/dashboard/cars/stats-car.svg"
              alt="No cars"
              width={64}
              height={64}
              className="opacity-30"
            />
            <p className="text-gray-500 text-lg">لا توجد سيارات</p>
            <p className="text-gray-400 text-sm">
              {activeTab !== "all" || searchQuery
                ? "جرب تغيير معايير البحث"
                : "ابدأ بإضافة سيارة جديدة"}
            </p>
            {(activeTab !== "all" || searchQuery) && (
              <Button variant="outline" size="md" onClick={handleClearFilters}>
                مسح الفلاتر
              </Button>
            )}
          </div>
        ) : (
          /* Cars Content */
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {transformedCars.map((car) => (
                <CarCard
                  key={car.id}
                  {...car}
                  isFeatured={car.isFeatured}
                  onToggleFeatured={() => {
                    toggleFeaturedMutation.mutate({
                      id: car.id,
                      isFeatured: !car.isFeatured
                    });
                  }}
                  onCardClick={() => router.push(`/dashboard/cars/${car.id}`)}
                />
              ))}
            </div>
          ) : (
            <CarsTable
              data={tableRows}
              onDelete={openDeleteDialog}
              onView={(id) => router.push(`/dashboard/cars/${id}`)}
            />
          )
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        title="تأكيد الحذف"
        maxWidth="400px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={closeDeleteDialog}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleDeleteCar}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 text-base leading-relaxed">
          هل أنت متأكد من حذف هذه السيارة؟ هذا الإجراء لا يمكن التراجع عنه.
        </p>
      </Modal>
    </div>
  );
}