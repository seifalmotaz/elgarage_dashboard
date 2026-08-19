"use client";

import React from "react";

interface TemplateCardProps {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
}

export function TemplateCard({ title, description, icon, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-start p-4 rounded-[12px] border border-[#f2f2f2] bg-white hover:border-[#002ec1]/20 hover:bg-[#f8fafc] transition-all flex flex-col gap-2 group relative shadow-sm"
    >
      <div className="flex items-center justify-start gap-3">
        <span className="text-[14px] font-semibold text-[#1a1a1a]">
          {title}
        </span>
        <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center border border-[#f2f2f2] shadow-sm transition-colors">
          <img
            src={icon}
            alt=""
            width={20}
            height={20}
            className="opacity-40"
          />
        </div>
      </div>
      <p className="text-[12px] text-[#8286ab] font-light leading-[1.6]">
        {description}
      </p>
    </button>
  );
}