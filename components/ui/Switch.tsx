"use client";

import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export default function Switch({ checked, onChange, className = "", disabled = false }: SwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-8 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#002ec1]" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <div
        className={`absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 transform ${
          checked ? "translate-x-0" : "-translate-x-3"
        }`}
      />
    </button>
  );
}
