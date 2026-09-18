import React from "react";
import { CarCardProps, PublicationStatusLabel } from "../../../lib/utils/car-transformers";

// Extended props for backward compatibility with legacy `image` prop and click handler
interface CarCardComponentProps extends CarCardProps {
  image?: string; // Legacy prop for backward compatibility
  onCardClick?: () => void;
  onEdit?: () => void;
  isFeatured?: boolean;
  onToggleFeatured?: () => void;
}

const FALLBACK_IMAGE = "/assets/dashboard/cars/car-sample.png";

function getPublicationRibbonStyles(status: PublicationStatusLabel): string {
  switch (status) {
    case "منشورة":
      return "bg-[#f0fdf4] text-[#16a34a]";
    case "مرفوضة":
      return "bg-[#ffe0de] text-[#af1208]";
    case "مباعة":
      return "bg-[#eff6ff] text-[#2563eb]";
    case "مسودة":
    case "قيد المراجعة":
      return "bg-[#fef3c7] text-[#ca8a04]";
    default:
      return "bg-[#fef3c7] text-[#ca8a04]";
  }
}

export default function CarCard({
  image, // Legacy prop
  images,
  price,
  installment,
  title,
  trim,
  year,
  mileage,
  location,
  status,
  isGarageCertified = true,
  onCardClick,
  onEdit,
  isFeatured,
  onToggleFeatured,
}: CarCardComponentProps) {
  // Use legacy `image` prop if provided, otherwise use first image from array, else fallback
  const displayImage = image || (images && images.length > 0 ? images[0] : FALLBACK_IMAGE);

  return (
    <div
      className={`bg-white border border-[#f2f2f2] rounded-[16px] overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 h-full ${onCardClick ? "cursor-pointer" : ""}`}
      onClick={onCardClick}
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onCardClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onCardClick();
        }
      }}
    >
      {/* Image Section */}
      <div className="p-[8px] pb-0">
        <div className="relative h-[172px] w-full overflow-hidden rounded-[12px]">
          <img
            src={displayImage || ""}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-[12px]"
          />

          {/* Publication status ribbon (Top Right in RTL) */}
          {status && (
            <div
              className={`absolute top-3 right-0 px-3 py-1 rounded-l-[4px] ${getPublicationRibbonStyles(status)}`}
            >
              <span className="text-[12px] font-medium leading-[1.7]">{status}</span>
            </div>
          )}

          {/* Actions - Top Left in RTL */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
                title="تعديل"
                aria-label="تعديل السيارة"
              >
                <img
                  src="/assets/dashboard/cars/edit.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="opacity-70"
                />
              </button>
            )}
            {onToggleFeatured && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
                title={isFeatured ? "إزالة من المميزة" : "إضافة للمميزة"}
              >
                {isFeatured ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-2 pt-4 pb-3 flex flex-col gap-4 flex-1">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between gap-4 px-1">
          {/* Title (1st Child -> RIGHT in RTL) */}
          <h3 className="text-[#1a1a1a] text-[16px] font-medium leading-[1.5] line-clamp-2 text-start flex-1">
            {title}
          </h3>

          {/* Price/Installment (2nd Child -> LEFT in RTL) */}
          <div className="flex flex-col gap-1 shrink-0 items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-[#4b84e7] text-[14px]">ج.م</span>
              <span className="text-[#1851b4] text-[16px] font-semibold leading-[1.5]">{price}</span>
            </div>
            <span className="text-[#6b7280] text-[14px] font-light">{installment} شهر</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="flex flex-col gap-3 mt-auto px-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1">
              <img src="/assets/dashboard/cars/car-trim.svg" alt="Trim" width={20} height={20} className="opacity-70" />
              <span className="text-[#6b7280] text-[12px] font-light text-start leading-[1.5]">{trim}</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="/assets/dashboard/cars/car-calendar.svg" alt="Year" width={20} height={20} className="opacity-70" />
              <span className="text-[#6b7280] text-[12px] font-light text-start leading-[1.5]">{year}</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="/assets/dashboard/cars/car-speedometer.svg" alt="Mileage" width={20} height={20} className="opacity-70" />
              <span className="text-[#6b7280] text-[12px] font-light text-start leading-[1.5]">{mileage}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 w-full">
            <img src="/assets/dashboard/cars/car-location.svg" alt="Location" width={20} height={20} className="opacity-70" />
            <span className="text-[#6b7280] text-[12px] font-light text-start leading-none">{location}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto bg-gradient-to-r from-[#002ec1] to-[#00165b] pt-[12px] pb-[8px] px-4 flex items-center justify-between rounded-bl-[20px] rounded-br-[20px]">
        {/* Right side in RTL (1st child) - Garage Certified */}
        {isGarageCertified && (
          <div className="flex items-center gap-2">
            <div className="relative w-[18px] h-[18px]">
              <img src="/assets/dashboard/cars/garage-logo-mini.svg" alt="Certified" className="absolute inset-0 w-full h-full object-contain" />
            </div>
            <span className="text-white text-[12px] font-medium text-start leading-[1.5]">معتمدة من جراج</span>
          </div>
        )}

        {/* Left side in RTL (2nd child) - Inspection Info */}
        <button className="flex items-center gap-2 group/btn">
          <span className="text-white text-[10px] font-normal text-start leading-[1.5]">معلومات عن الفحص</span>
          <div className="w-[20px] h-[20px] flex items-center justify-center transition-transform group-hover/btn:-translate-x-1">
            <img src="/assets/dashboard/cars/car-arrow-left.svg" alt="Arrow" width={16} height={16} className="rotate-45" />
          </div>
        </button>
      </div>
    </div>
  );
}
