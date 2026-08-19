"use client";

import React, { useState } from "react";

interface TestimonialCardProps {
  id: string;
  name: string;
  carInfo: string | null;
  comment: string;
  avatar: string | null;
  rating: number | null;
  order: number;
  isActive: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
}

export default function TestimonialCard({
  name,
  carInfo,
  comment,
  avatar,
  rating,
  order,
  isActive,
  onDelete,
  onEdit,
  onToggle,
}: TestimonialCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white border border-[#f2f2f2] rounded-[16px] px-6 py-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-[#EBF1FF] border border-[#f2f2f2] overflow-hidden shrink-0 flex items-center justify-center">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#002ec1] font-semibold text-sm">
                {name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0 text-start">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[16px] font-semibold text-[#000a2a]">
                {name}
              </h3>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                  isActive
                    ? "bg-[#ecfdf5] text-[#059669] border-[#d1fae5]"
                    : "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]"
                }`}
              >
                {isActive ? "نشط" : "غير نشط"}
              </span>
              <span className="text-[11px] text-[#9ca3af]">ترتيب: {order}</span>
              {rating != null && (
                <span className="text-[11px] text-[#f59e0b]">★ {rating}</span>
              )}
            </div>
            {carInfo && (
              <p className="text-[12px] text-[#6b7280] truncate">{carInfo}</p>
            )}
            <p className="text-[13px] text-[#374151] leading-relaxed line-clamp-3 mt-1">
              {comment}
            </p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-[#f2f2f2]"
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/dashboard/more-horizontal.svg"
              alt="More"
              width={20}
              height={20}
              className="opacity-40"
            />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#f2f2f2] rounded-[12px] shadow-xl z-20 overflow-hidden py-1 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.();
                  }}
                  className="w-full px-4 py-3 text-[14px] text-[#4b5563] hover:bg-[#f0f7ff] hover:text-[#002ec1] text-right transition-colors"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onToggle?.();
                  }}
                  className="w-full px-4 py-3 text-[14px] text-[#4b5563] hover:bg-[#f0f7ff] hover:text-[#002ec1] text-right transition-colors"
                >
                  {isActive ? "إلغاء التفعيل" : "تفعيل"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.();
                  }}
                  className="w-full px-4 py-3 text-[14px] text-[#ef4444] hover:bg-[#fff5f5] text-right transition-colors"
                >
                  حذف
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
