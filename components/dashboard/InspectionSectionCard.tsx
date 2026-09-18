"use client";

import React, { useState } from "react";
import Switch from "@/components/ui/Switch";

interface InspectionSectionCardProps {
  title: string;
  icon: string;
  count: string;
  options: string[];
  parts: string[];
}

export default function InspectionSectionCard({
  title,
  icon,
  count,
  options,
  parts,
}: InspectionSectionCardProps) {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [photosEnabled, setPhotosEnabled] = useState(true);
  const [notesEnabled, setNotesEnabled] = useState(true);

  return (
    <div className="bg-white border border-[#f2f2f2] rounded-[24px] p-6 flex flex-col gap-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Right side: Icon and Title (FIRST in DOM) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f8fafc] rounded-[12px] flex items-center justify-center">
            <img src={icon} alt="" width={24} height={24} className="opacity-60" />
          </div>
          <span className="text-[18px] font-semibold text-[#1a1a1a]">{title}</span>
        </div>

        {/* Left side: Counter and More (LAST in DOM) */}
        <div className="flex items-center gap-4">
          <div className="bg-[#f1f5f9] px-3 py-1 rounded-full">
            <span className="text-[12px] text-[#64748b] font-medium">{count}</span>
          </div>
          <button className="opacity-20 hover:opacity-100 transition-opacity">
            <img src="/assets/dashboard/more-horizontal.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      {/* Evaluation Options */}
      <div className="flex flex-col gap-3">
        <label className="text-[14px] text-[#8286ab] font-light text-start">
          عناصر التقييم (خيارات التقييم لكل جزء)
        </label>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                selectedOption === option
                  ? "bg-[#002ec1] text-white border-[#002ec1]"
                  : "bg-[#f8fafc] text-[#64748b] border-transparent hover:border-[#cbd5e1]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Included Parts */}
      <div className="flex flex-col gap-3">
        <label className="text-[14px] text-[#8286ab] font-light text-start">
          الاجزاء المشمولة ضمن هذا التقييم:
        </label>
        <div className="grid grid-cols-2 gap-3">
          {parts.map((part, idx) => (
            <div
              key={idx}
              className="bg-[#f8fafc] p-3 rounded-[12px] flex items-center justify-between border border-transparent hover:border-[#f2f2f2] transition-all"
            >
              <span className="text-[13px] text-[#1a1a1a] font-medium">{part}</span>
              <img src="/assets/dashboard/sales-requests/tick-circle-linear.svg" alt="" width={16} height={16} className="opacity-40" />
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between pt-4 border-t border-[#f2f2f2]">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
            <span className="text-[14px] text-[#1a1a1a]">تفعيل الملاحظات</span>
            <Switch checked={notesEnabled} onChange={setNotesEnabled} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-[#1a1a1a]">تفعيل الصور</span>
            <Switch checked={photosEnabled} onChange={setPhotosEnabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
