"use client";

import React, { useState } from "react";
import Switch from "@/components/ui/Switch";

interface BannerCardProps {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  dateRange: string;
  link: string;
  isActive: boolean;
  aspectClass?: string;
  onToggle: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function BannerCard({
  id,
  image,
  title,
  subtitle,
  dateRange,
  link,
  isActive: initialActive,
  aspectClass = "aspect-[670/328]",
  onToggle,
  onDelete,
  onEdit,
}: BannerCardProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = (val: boolean) => {
    setIsActive(val);
    onToggle();
  };

  return (
    <div className="bg-white border border-[#f2f2f2] rounded-[16px] p-4 flex flex-col gap-4 shadow-sm relative">
      {/* Banner Image */}
      <div className={`relative ${aspectClass} w-full rounded-[12px] overflow-hidden bg-[#f3f4f6]`}>
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      <div className="flex flex-col gap-4">
        {/* Header Info */}
        <div className="flex items-start justify-between gap-4">
          {/* Title and Switch (FIRST = RIGHT in RTL) */}
          <div className="flex-1 flex flex-col gap-1 items-start">
            <div className="flex items-center gap-4 justify-start w-full">
              <h3 className="text-[16px] font-semibold text-[#262626] text-start">
                {title}
              </h3>
              <Switch checked={isActive} onChange={handleToggle} />
            </div>
            <p className="text-[14px] font-light text-[#4b5563] text-start">
              {subtitle}
            </p>
          </div>

          {/* More Menu (LAST = LEFT in RTL) */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-50 hover:bg-gray-50 transition-colors shrink-0"
            >
              <img
                src="/assets/dashboard/more-horizontal.svg"
                alt="More"
                width={20}
                height={20}
              />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute left-0 top-full mt-2 bg-white rounded-[12px] shadow-lg border border-[#f2f2f2] overflow-hidden z-10 min-w-[140px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.();
                  }}
                  className="w-full px-4 py-3 text-[14px] text-[#1a1a1a] hover:bg-gray-50 flex items-center gap-2 text-start border-b border-[#f2f2f2]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.();
                  }}
                  className="w-full px-4 py-3 text-[14px] text-[#ef4444] hover:bg-red-50 flex items-center gap-2 text-start"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span>حذف</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Range (Icon FIRST = RIGHT in RTL) */}
        <div className="flex items-center gap-2 justify-start text-[#9ca3af]">
          <img
            src="/assets/dashboard/calendar-outline.svg"
            alt="Calendar"
            width={18}
            height={18}
            className="opacity-60"
          />
          <span className="text-[12px] font-light">{dateRange}</span>
        </div>

        {/* Link Input Display (Text FIRST = RIGHT in RTL) */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center overflow-hidden">
            <span className="text-[12px] text-[#1a1a1a] font-light truncate text-start">
              {link}
            </span>
          </div>
          <img
            src="/assets/dashboard/link.svg"
            alt="Link"
            width={20}
            height={20}
            className="shrink-0 opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
