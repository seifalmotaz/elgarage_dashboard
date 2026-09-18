import React from "react";
import Button from "../../ui/Button";
import Select from "../../ui/Select";

export type CarsFilterTab = "all" | "draft" | "published" | "sold" | "special";
export type CarsStatusFilter = "all" | "DRAFT" | "PUBLISHED" | "SOLD";

interface FilterBarProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  activeTab?: CarsFilterTab;
  onTabChange?: (tab: CarsFilterTab) => void;
  statusFilter?: CarsStatusFilter;
  onStatusFilterChange?: (status: CarsStatusFilter) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: () => void;
}

const STATUS_OPTIONS = [
  { label: "الكل", value: "all" },
  { label: "منشورة", value: "PUBLISHED" },
  { label: "مسودة", value: "DRAFT" },
  { label: "مباعة", value: "SOLD" },
];

export default function FilterBar({
  viewMode,
  onViewModeChange,
  activeTab = "all",
  onTabChange,
  statusFilter = "all",
  onStatusFilterChange,
  searchQuery = "",
  onSearchChange,
  onSearch,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div className="flex items-center gap-2 bg-white rounded-full p-[6px] border border-[#f2f2f2] overflow-x-auto no-scrollbar max-w-full">
          <Button
            variant={activeTab === "all" ? "primary" : "ghost"}
            size="md"
            className="gap-2 px-6 shrink-0"
            onClick={() => onTabChange?.("all")}
            iconPosition="right"
          >
            الكل
          </Button>

          <Button
            variant={activeTab === "draft" ? "primary" : "ghost"}
            size="md"
            className="group shrink-0"
            onClick={() => onTabChange?.("draft")}
            iconPosition="right"
          >
            <span className="text-start">مسودة</span>
          </Button>

          <Button
            variant={activeTab === "published" ? "primary" : "ghost"}
            size="md"
            className="group shrink-0"
            onClick={() => onTabChange?.("published")}
            iconPosition="right"
          >
            <span className="text-start">منشورة</span>
          </Button>

          <Button
            variant={activeTab === "sold" ? "primary" : "ghost"}
            size="md"
            className="group shrink-0"
            onClick={() => onTabChange?.("sold")}
            iconPosition="right"
          >
            <span className="text-start">مباعة</span>
          </Button>

          <Button
            variant={activeTab === "special" ? "primary" : "ghost"}
            size="md"
            className="group shrink-0"
            onClick={() => onTabChange?.("special")}
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={activeTab === "special" ? "#FFD700" : "none"}
                stroke={activeTab === "special" ? "#FFD700" : "#6B7280"}
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
            iconPosition="right"
          >
            <span className="text-start">مميزة</span>
          </Button>
        </div>
      </div>

      {/* Main Filter Inputs Row */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 w-full flex-wrap">
        {/* View Toggle */}
        <div className="flex flex-col gap-2 shrink-0">
          <label className="text-[14px] text-[#1a1a1a] font-normal px-1 text-start">
            طريقة العرض
          </label>
          <div className="bg-white p-1 rounded-[12px] border border-[#f2f2f2] flex items-center gap-1 h-[50px]">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              aria-label="عرض شبكي"
              className={`w-10 h-10 flex items-center justify-center rounded-[8px] transition-colors ${viewMode === "grid" ? "bg-[#f9fafb] border border-[#e5e7eb]" : "hover:bg-gray-50"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3333 7.09984V3.3165C18.3333 2.1415 17.8 1.6665 16.475 1.6665H13.1083C11.7833 1.6665 11.25 2.1415 11.25 3.3165V7.0915C11.25 8.27484 11.7833 8.7415 13.1083 8.7415H16.475C17.8 8.74984 18.3333 8.27484 18.3333 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.3333 16.475V13.1083C18.3333 11.7833 17.8 11.25 16.475 11.25H13.1083C11.7833 11.25 11.25 11.7833 11.25 13.1083V16.475C11.25 17.8 11.7833 18.3333 13.1083 18.3333H16.475C17.8 18.3333 18.3333 17.8 18.3333 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.7513 7.09984V3.3165C8.7513 2.1415 8.21797 1.6665 6.89297 1.6665H3.5263C2.2013 1.6665 1.66797 2.1415 1.66797 3.3165V7.0915C1.66797 8.27484 2.2013 8.7415 3.5263 8.7415H6.89297C8.21797 8.74984 8.7513 8.27484 8.7513 7.09984Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.7513 16.475V13.1083C8.7513 11.7833 8.21797 11.25 6.89297 11.25H3.5263C2.2013 11.25 1.66797 11.7833 1.66797 13.1083V16.475C1.66797 17.8 2.2013 18.3333 3.5263 18.3333H6.89297C8.21797 18.3333 8.7513 17.8 8.7513 16.475Z" stroke="#0C0507" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              aria-label="عرض جدول"
              className={`w-10 h-10 flex items-center justify-center rounded-[8px] transition-colors ${viewMode === "table" ? "bg-[#f9fafb] border border-[#e5e7eb]" : "hover:bg-gray-50"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5013 18.3332H12.5013C16.668 18.3332 18.3346 16.6665 18.3346 12.4998V7.49984C18.3346 3.33317 16.668 1.6665 12.5013 1.6665H7.5013C3.33464 1.6665 1.66797 3.33317 1.66797 7.49984V12.4998C1.66797 16.6665 3.33464 18.3332 7.5013 18.3332Z" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.3346 8.3335H1.66797" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 8.3335V18.3335" stroke="#D1D5DB" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2 w-full sm:w-[250px] shrink-0">
          <Select
            label="الحالة"
            value={statusFilter}
            options={STATUS_OPTIONS}
            placeholder="الكل"
            onChange={(value) => onStatusFilterChange?.(value as CarsStatusFilter)}
          />
        </div>

        {/* Search Input */}
        <div className="flex flex-col gap-2 flex-1 min-w-[220px]">
          <label className="text-[14px] text-[#1a1a1a] font-normal px-1 text-start">
            البحث
          </label>
          <div className="bg-white h-[50px] rounded-full flex items-center p-[4px] border border-[#f2f2f2] focus-within:border-blue-400 transition-colors gap-3 relative">
            <input
              type="text"
              placeholder="ابحث بالماركة أو الموديل.."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearch?.();
                }
              }}
              className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-700 placeholder-[#d1d5db] h-full px-4 text-start pe-[40px]"
              aria-label="البحث عن سيارة"
            />
            <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <img
                src="/assets/dashboard/search.svg"
                alt=""
                width={20}
                height={20}
                className="opacity-30"
              />
            </div>
            <Button
              variant="outline"
              size="md"
              className="h-[42px] px-8 font-semibold shrink-0"
              onClick={() => onSearch?.()}
            >
              بحث
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
