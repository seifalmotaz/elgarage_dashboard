"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ActionsDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
}

export function ActionsDropdown({
  isOpen,
  onToggle,
  onViewDetails,
  onEdit,
}: ActionsDropdownProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 120; // Approximate height
      const viewportHeight = window.innerHeight;

      // Calculate position - show above if not enough space below
      const showAbove = rect.bottom + dropdownHeight > viewportHeight;
      const top = showAbove
        ? rect.top - dropdownHeight
        : rect.bottom;

      setDropdownPosition({
        top,
        left: rect.left,
      });
    }
  }, [isOpen]);

  const handleViewDetails = () => {
    onToggle();
    onViewDetails();
  };

  const handleEdit = () => {
    onToggle();
    onEdit();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        const dropdown = document.getElementById("actions-dropdown-portal");
        if (dropdown && !dropdown.contains(e.target as Node)) {
          onToggle();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onToggle]);

  const dropdown = isOpen ? (
    <div
      id="actions-dropdown-portal"
      className="fixed bg-white border border-[#f2f2f2] rounded-[12px] shadow-xl z-[9999] overflow-hidden py-1 min-w-[180px]"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
      }}
    >
      <button
        onClick={handleViewDetails}
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
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>عرض التفاصيل</span>
      </button>
      <button
        onClick={handleEdit}
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
        <span>تعديل بيانات</span>
      </button>
    </div>
  ) : null;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "text-gray-400 hover:text-gray-800 transition-colors px-[8px] flex items-center justify-center w-8 h-8 rounded-lg",
          isOpen ? "bg-gray-100" : ""
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
        </svg>
      </button>
      {mounted && dropdown && createPortal(dropdown, document.body)}
    </div>
  );
}