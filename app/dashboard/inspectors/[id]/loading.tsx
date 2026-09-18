"use client";

import React from "react";

export default function Loading() {
  return (
    <div
      className="flex flex-col w-full h-full max-w-[1200px] mx-auto gap-[24px]"
      dir="rtl"
    >
      {/* Breadcrumbs Placeholder */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[4px] text-[14px]">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="opacity-40">
            <div className="w-3 h-3 bg-gray-200 rounded" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>

      {/* Header Placeholder */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[12px]">
          <div className="w-[44px] h-[44px] bg-gray-200 rounded-[12px]" />
          <div className="h-8 bg-gray-200 rounded w-40" />
        </div>
        <div className="h-[44px] w-[100px] bg-gray-200 rounded-[12px]" />
      </div>

      {/* Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[24px] p-[20px] shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-[16px]" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Content Placeholder */}
      <div className="bg-white rounded-[24px] p-[24px] shadow-sm border border-gray-100 animate-pulse">
        <div className="h-[200px] bg-gray-100 rounded-[16px]" />
      </div>
    </div>
  );
}