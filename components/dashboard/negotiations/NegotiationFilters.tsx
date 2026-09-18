"use client";

import React from "react";
import { FilterGroup } from "@/components/dashboard/filters";
import { StatusFilter } from "@/components/dashboard/filters";
import { DateRangeFilter } from "@/components/dashboard/filters";
import { SearchBar } from "@/components/dashboard/filters";
import Button from "@/components/ui/Button";
import type { NegotiationStatus } from "@/lib/api/negotiations";

interface NegotiationFiltersProps {
  selectedStatus: NegotiationStatus | undefined;
  onStatusChange: (status: NegotiationStatus | undefined) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function NegotiationFilters({
  selectedStatus,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  searchQuery,
  onSearchChange,
  onSearch,
  onReset,
}: NegotiationFiltersProps) {
  return (
    <FilterGroup className="flex-wrap">
      {/* Status Dropdown */}
      <StatusFilter
        value={selectedStatus || ""}
        options={[
          { label: "الكل", value: "" },
          { label: "قيد الانتظار", value: "PENDING" },
          { label: "جاري التواصل", value: "CONNECTED" },
          { label: "مكتمل", value: "COMPLETED" },
          { label: "ملغي", value: "CANCELLED" },
        ]}
        onChange={(value) => onStatusChange(value as NegotiationStatus | undefined)}
        label="الحالة"
        width="w-[200px]"
      />

      {/* Date Range Filter */}
      <DateRangeFilter
        fromDate={dateFrom}
        toDate={dateTo}
        onFromChange={onDateFromChange}
        onToChange={onDateToChange}
        label="التاريخ"
        width="w-[240px]"
      />

      {/* Price Range Filter */}
      <div className="flex flex-col gap-[4px] shrink-0 w-[200px]">
        <label className="text-[14px] text-[#1A1A1A] font-normal">
          السعر
        </label>
        <div className="flex items-center gap-[8px]">
          <div className="flex flex-col gap-[4px] flex-1">
            <span className="text-[12px] text-[#6B7280]">الحد الأدنى</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0"
              className="bg-white border border-[#f2f2f2] rounded-full h-[48px] px-[16px] text-[14px] text-[#1A1A1A] font-light outline-none"
            />
          </div>
          <div className="flex flex-col gap-[4px] flex-1">
            <span className="text-[12px] text-[#6B7280]">الحد الأقصى</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="∞"
              className="bg-white border border-[#f2f2f2] rounded-full h-[48px] px-[16px] text-[14px] text-[#1A1A1A] font-light outline-none"
            />
          </div>
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="flex items-end gap-[8px]">
        <Button
          variant="ghost"
          size="lg"
          className="h-[48px] px-[24px] text-[#6B7280]"
          onClick={onReset}
        >
          إعادة تعيين
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        onSearch={onSearch}
        placeholder="ابحث بالسيارة أو المشتري..."
        showButton
        buttonText="بحث"
      />
    </FilterGroup>
  );
}