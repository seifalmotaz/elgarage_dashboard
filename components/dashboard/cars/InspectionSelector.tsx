'use client';

import { useState, useEffect, useRef } from 'react';
import { useAvailableInspections } from '@/hooks/useAvailableInspections';
import { adminCarsApi } from '@/lib/api/admin-cars';
import type { InspectionDetails } from '@/lib/api/admin-cars';
import toast from 'react-hot-toast';

interface InspectionSelectorProps {
  value: string; // Selected listingRequestId
  onChange: (listingRequestId: string) => void;
  onInspectionLoad: (inspection: InspectionDetails) => void;
  onError?: (error: string) => void;
}

export function InspectionSelector({
  value,
  onChange,
  onInspectionLoad,
  onError,
}: InspectionSelectorProps) {
  const {
    inspections,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filteredInspections,
  } = useAvailableInspections();

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<{
    brand: string;
    model: string;
    year: number;
  } | null>(null);

  // Use refs to store callbacks to avoid re-triggering useEffect
  const onInspectionLoadRef = useRef(onInspectionLoad);
  const onErrorRef = useRef(onError);

  // Update refs when props change
  useEffect(() => {
    onInspectionLoadRef.current = onInspectionLoad;
    onErrorRef.current = onError;
  }, [onInspectionLoad, onError]);

  // Track the last fetched value to prevent duplicate fetches
  const lastFetchedValueRef = useRef<string | null>(null);

  // Fetch inspection details when value changes
  useEffect(() => {
    if (!value) {
      setSelectedInfo(null);
      lastFetchedValueRef.current = null;
      return;
    }

    // Skip if we already fetched this value
    if (lastFetchedValueRef.current === value) {
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const details = await adminCarsApi.getInspectionDetails(value);
        onInspectionLoadRef.current(details);
        setSelectedInfo({
          brand: details.brand,
          model: details.model,
          year: details.year,
        });
        lastFetchedValueRef.current = value;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'فشل في تحميل بيانات الفحص';
        toast.error(message);
        onErrorRef.current?.(message);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [value]); // Only depend on value, not the callbacks

  const handleSelect = (listingRequestId: string) => {
    onChange(listingRequestId);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSelectedInfo(null);
    setSearchTerm('');
    lastFetchedValueRef.current = null;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-center text-red-600">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="block mx-auto mt-2 text-sm underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن الماركة، الموديل، أو السنة..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 pr-10 text-[14px] text-[#1a1a1a] font-light leading-[1.7] outline-none focus:border-[#002ec1] transition-colors"
            disabled={isLoading || loadingDetails}
          />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Dropdown */}
        {showDropdown && filteredInspections.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-[#f2f2f2] rounded-[16px] shadow-lg max-h-[300px] overflow-y-auto">
            {filteredInspections.map((inspection) => (
              <button
                key={inspection.id}
                onClick={() => handleSelect(inspection.id)}
                className={`w-full flex items-center gap-3 p-3 text-right hover:bg-gray-50 transition-colors ${
                  value === inspection.id ? 'bg-blue-50 border-r-4 border-[#002ec1]' : ''
                }`}
              >
                {/* Thumbnail */}
                {inspection.thumbnail && (
                  <img
                    src={inspection.thumbnail}
                    alt={`${inspection.brand} ${inspection.model}`}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                )}

                {/* Car info */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-[14px] font-medium text-[#1a1a1a]">
                    {inspection.brand} {inspection.model} - {inspection.year}
                  </div>
                  <div className="text-[12px] text-gray-500">
                    {inspection.mileage.toLocaleString()} كم
                  </div>
                  <div className="text-[12px] text-gray-400">
                    {inspection.user.firstName} {inspection.user.lastName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {showDropdown && searchTerm && filteredInspections.length === 0 && inspections.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-[#f2f2f2] rounded-[16px] p-4 text-center text-gray-500">
            لا توجد نتائج مطابقة
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#002ec1]"></div>
          جاري التحميل...
        </div>
      )}

      {/* Loading details */}
      {loadingDetails && (
        <div className="flex items-center justify-center gap-2 text-gray-600 bg-blue-50 rounded-[16px] p-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#002ec1]"></div>
          جاري تحميل بيانات الفحص...
        </div>
      )}

      {/* Selected inspection info */}
      {selectedInfo && !loadingDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-[16px] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[14px] font-medium text-[#1a1a1a]">
              تم اختيار الفحص
            </div>
            <button
              onClick={handleClear}
              className="text-[12px] text-red-600 hover:underline"
            >
              إلغاء
            </button>
          </div>
          <div className="text-[12px] text-gray-600">
            {selectedInfo.brand} {selectedInfo.model} - {selectedInfo.year}
          </div>
        </div>
      )}

      {/* No inspections available */}
      {!isLoading && inspections.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-center text-gray-500 text-[14px]">
          لا توجد فحوصات معتمدة متاحة للاستيراد
        </div>
      )}
    </div>
  );
}
