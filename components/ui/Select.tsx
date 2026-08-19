"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectProps {
  label?: string;
  value: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  error?: boolean;
}

export default function Select({
  label,
  value,
  options,
  placeholder,
  onChange,
  className,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasValue = value && value !== '';
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      className={`flex flex-col gap-2 w-full ${className}`}
      ref={containerRef}
    >
      {label && (
        <label className="text-[14px] text-[#1a1a1a] text-start font-medium leading-[1.5]">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center justify-between cursor-pointer transition-all ${isOpen ? "border-[#002ec1]" : "hover:border-blue-200"} ${error ? 'border-red-300' : ''}`}
        >
          <span className={`text-[12px] font-light leading-[1.7] ${hasValue ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`}>
            {hasValue ? selectedOption?.label : (placeholder || options[0]?.label || 'اختر...')}
          </span>
          <img
            src="/assets/arrow-down.png"
            alt="arrow"
            width={12}
            height={12}
            className={`opacity-40 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-[58px] left-0 right-0 bg-white border border-[#f2f2f2] rounded-[16px] shadow-lg z-50 overflow-y-auto max-h-60 py-1 animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange?.(opt.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 text-[12px] cursor-pointer transition-colors ${opt.value === value ? "bg-[#f0f7ff] text-[#002ec1] font-medium" : "text-[#4b5563] hover:bg-gray-50"}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
