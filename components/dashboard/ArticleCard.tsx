"use client";

import React from "react";

interface ArticleCardProps {
  id: string;
  image: string;
  date: string;
  title: string;
  description: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  viewCount?: number;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function ArticleCard({
  id,
  image,
  date,
  title,
  description,
  category,
  status,
  viewCount,
  onDelete,
  onEdit,
}: ArticleCardProps) {
  const isPublished = status === "PUBLISHED";

  return (
    <div className="relative w-full h-[353px] rounded-[16px] overflow-hidden group">
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#06142d]/90" />

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`px-3 py-1 rounded-full text-[12px] font-medium ${
            isPublished
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {isPublished ? "منشور" : "مسودة"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={onEdit}
            className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
            title="تعديل"
          >
            <img
              src="/icons/clipboard-text.png"
              alt="Edit"
              width={18}
              height={18}
            />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-[40px] h-[40px] bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
            title="حذف"
          >
            <img
              src="/icons/close-circle.png"
              alt="Delete"
              width={18}
              height={18}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4">
        {/* Category Tag */}
        <div className="flex items-center justify-between">
          <span className="bg-[#002ec1]/80 text-white text-[12px] px-3 py-1 rounded-full">
            {category}
          </span>
          {/* Date */}
          <div className="flex items-center gap-2">
            {viewCount != null && (
              <span className="text-white/80 text-[12px] font-light">
                {viewCount} مشاهدة
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-white text-[14px] font-light">{date}</span>
              <img
                src="/assets/dashboard/calendar.svg"
                alt="Calendar"
                width={16}
                height={16}
                className="opacity-100"
              />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white text-[20px] font-semibold text-right leading-[1.5]">
            {title}
          </h3>
          <p className="text-white/70 text-[14px] font-light text-right leading-normal line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
