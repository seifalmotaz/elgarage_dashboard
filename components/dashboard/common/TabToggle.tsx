"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  iconActive?: React.ReactNode;
  iconInactive?: React.ReactNode;
}

interface TabToggleProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function TabToggle({ tabs, activeTab, onTabChange, className }: TabToggleProps) {
  return (
    <div className={cn(
      "bg-white border border-[#f3f3f3] rounded-[29px] p-[6px] flex items-center gap-1 self-start",
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "h-[40px] px-6 rounded-[25000px] flex items-center gap-2 text-[14px] font-medium transition-all",
            activeTab === tab.id
              ? "bg-[#002ec1] text-white shadow-lg shadow-blue-900/20"
              : "bg-transparent text-[#6b7280] hover:bg-gray-50"
          )}
        >
          {tab.icon && (
            <img
              src={tab.icon}
              alt=""
              width={18}
              height={18}
              className={activeTab === tab.id ? "brightness-0 invert" : "opacity-40"}
            />
          )}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}