"use client";

import React, { useState } from "react";

interface FAQCardProps {
  id: string;
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function FAQCard({
  id,
  question,
  answer,
  category,
  isOpen: initialOpen = false,
  onDelete,
  onEdit,
}: FAQCardProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white border border-[#f2f2f2] rounded-[16px] px-6 py-5 flex flex-col gap-4 shadow-sm transition-all overflow-hidden">
      {/* Header Row: More Menu & Category Badge */}
      <div className="flex items-center justify-between">
        {/* RIGHT in RTL: Category Badge (FIRST in DOM) */}
        <div className="bg-[#f9fafb] border border-[#f3f4f6] px-4 py-1.5 rounded-full shrink-0">
          <span className="text-[12px] text-[#374151] font-medium">{category}</span>
        </div>

        {/* LEFT in RTL: Actions Menu (LAST in DOM) */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0 border border-[#f2f2f2]"
          >
            <img
              src="/assets/dashboard/more-horizontal.svg"
              alt="More"
              width={20}
              height={20}
              className="opacity-40"
            />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              {/* Menu */}
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#f2f2f2] rounded-[12px] shadow-xl z-20 overflow-hidden py-1 min-w-[160px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.();
                  }}
                  className="w-full px-4 py-3 text-[14px] text-[#4b5563] hover:bg-[#f0f7ff] hover:text-[#002ec1] text-right transition-colors flex items-center gap-3"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                  className="w-full px-4 py-3 text-[14px] text-red-500 hover:bg-red-50 text-right transition-colors flex items-center gap-3"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>حذف</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Row: Question & Toggle */}
      <div
        className="flex items-center justify-between gap-4 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* RIGHT in RTL: Question Text (FIRST in DOM) */}
        <h3 className="text-[16px] font-semibold text-[#1a1a1a] text-start leading-[1.5] flex-1">
          {question}
        </h3>

        {/* LEFT in RTL: Chevron (LAST in DOM) */}
        <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <img
            src="/assets/dashboard/chevron-down.svg"
            alt="Toggle"
            width={18}
            height={18}
            className="opacity-30 group-hover:opacity-60"
          />
        </div>
      </div>

      {/* Expandable Answer Area */}
      {isOpen && (
        <div className="pt-2 border-t border-transparent animate-in fade-in slide-in-from-top-1 duration-300">
          <p className="text-[14px] text-[#6b7280] text-start leading-[1.8] font-light">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}