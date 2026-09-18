import React from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";

interface InspectorCardProps {
  id: string;
  name: string;
  phone: string;
  totalInspections: number;
  cancelled: number;
  inProgress: number;
  completed: number;
  avatarSrc?: string;
}

export default function InspectorCard({
  id,
  name,
  phone,
  totalInspections,
  cancelled,
  inProgress,
  completed,
  avatarSrc,
}: InspectorCardProps) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-[24px] p-[16px] flex flex-col gap-[20px]  border border-gray-100 hover:shadow-md transition-all duration-300" dir="rtl">

      {/* Top Header Section */}
      <div className="flex items-start justify-between w-full h-[52px]">
        {/* Right side in RTL: Avatar & Name/Phone */}
        <div className="flex items-center gap-[12px] h-full">
          <div className="w-[52px] h-[52px] bg-[#ebf1ff] rounded-full flex items-center justify-center border border-white overflow-hidden relative shrink-0">
            <img src={(avatarSrc && avatarSrc.trim().length != 0) ? avatarSrc : "/assets/full-user.svg"} alt={name} className={`absolute inset-0 w-full h-full ${(avatarSrc && avatarSrc.trim().length != 0) ? 'object-cover' : 'p-3 opacity-40'}`} />
          </div>
          <div className="flex flex-col items-start justify-center h-full">
            <h4 className="text-[16px] text-[#1a1a1a] font-medium leading-tight mb-1">{name}</h4>
            <span className="text-[14px] text-[#4b5563] font-light leading-none">{phone}</span>
          </div>
        </div>

        {/* Left side in RTL: Total Inspections */}
        <div className="flex items-baseline gap-[4px] text-[#4b5563] font-light text-[12px] h-full pt-1">
          <span className="text-[16px] font-normal text-[#1a1a1a]">{totalInspections}</span>
          <span> : الفحص الكلي</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-[12px] p-[12px] flex items-center justify-between border border-gray-100 ">
        {/* Completed */}
        <div className="flex flex-col items-center flex-1">
          <span className="text-[12px] text-[#6b7280] font-light mb-1">مكتملة</span>
          <span className="text-[20px] text-[#262626] font-medium">{completed}</span>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-[44px] bg-gray-200 opacity-50"></div>

        {/* In Progress */}
        <div className="flex flex-col items-center flex-1">
          <span className="text-[12px] text-[#6b7280] font-light mb-1">جارية</span>
          <span className="text-[20px] text-[#262626] font-medium">{inProgress}</span>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-[44px] bg-gray-200 opacity-50"></div>

        {/* Cancelled */}
        <div className="flex flex-col items-center flex-1">
          <span className="text-[12px] text-[#6b7280] font-light mb-1">ملغية</span>
          <span className="text-[20px] text-[#262626] font-medium">{cancelled}</span>
        </div>
      </div>

      {/* View Appointments Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full border-[#2f71e3] text-[#2f71e3] hover:bg-[#2f71e3] hover:text-white"
        onClick={() => router.push(`/dashboard/inspectors/${id}`)}
      >
        عرض جدول المواعيد
      </Button>
    </div>
  );
}
