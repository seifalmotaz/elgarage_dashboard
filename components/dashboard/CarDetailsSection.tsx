import React from "react";
import { useCars } from "../../hooks/queries/useCars";
import { mapPublicationStatus } from "../../lib/utils/car-transformers";


export default function CarDetailsSection() {
  const { data: carsData, isLoading } = useCars({ status: "PUBLISHED", limit: 1 });
  const car = carsData?.data?.[0];

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 mt-8 animate-pulse" dir="rtl">
        <div className="w-full lg:w-[320px] h-[200px] bg-gray-200 rounded-[16px]" />
        <div className="flex-1 flex flex-col gap-5">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 mt-8 min-h-[200px]" dir="rtl">
        <img src="/assets/dashboard/cars/stats-car.svg" alt="No cars" width={64} height={64} className="opacity-30" />
        <p className="text-gray-500 text-lg">لا توجد سيارات منشورة حالياً</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 mt-8" dir="rtl">
      {/* Car Image */}
      <div className="relative w-full lg:w-[320px] h-[200px] rounded-[16px] overflow-hidden shrink-0">
        <img
          src={car.images?.[0] || "/assets/dashboard/cars/car-sample.png"}
          alt="Car Details"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Details Grid */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[20px] text-[#111111] font-bold">{`${car.brand} ${car.model} ${car.year}`}</h3>
          {(car as any).isFeatured && (
            <div className="flex items-center gap-2">
              <span className="bg-[#F0FDF4] text-[#16A34A] px-3 py-1 rounded-full text-[12px] font-medium">مميز</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">رقم اللوحة</span>
            <span className="text-[14px] text-[#111111] font-medium">{car.plateNumber ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">رقم الشاسيه (VIN)</span>
            <span className="text-[14px] text-[#111111] font-medium">{car.chassisNumber ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">المفتش</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[#EBF1FF] rounded-full flex items-center justify-center overflow-hidden relative">
                <img src="/assets/dashboard/users.svg" alt="Inspector" className="absolute inset-0 w-full h-full p-1 opacity-40" />
              </div>
              <span className="text-[14px] text-[#111111] font-medium">—</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">تاريخ الإضافة</span>
            <span className="text-[14px] text-[#111111] font-medium">
              {new Date(car.createdAt).toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">الممشى</span>
            <span className="text-[14px] text-[#111111] font-medium">{`${car.mileage.toLocaleString("ar-EG")} كم`}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">الموقع</span>
            <span className="text-[14px] text-[#111111] font-medium">{car.address ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">السعر</span>
            <span className="text-[14px] text-[#002EC1] font-bold">{`${car.price.toLocaleString("ar-EG")} ج.م`}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] text-[#8286AB] font-light">الحالة</span>
            <span className="text-[14px] text-[#16A34A] font-medium">{mapPublicationStatus(car.status)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
