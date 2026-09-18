"use client";

import React, { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = "600px" }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        style={{ maxWidth, maxHeight: 'calc(100vh - 80px)' }}
        className="relative w-full max-h-full bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="bg-[#fafafa] border-b border-[#f2f2f2] px-6 py-6 flex items-center justify-between">
          {/* Title on the RIGHT (first in DOM for RTL) */}
          <h2 className="text-[16px] font-semibold text-[#002ec1] leading-[1.5]">{title}</h2>
          
          {/* Close button on the LEFT (second in DOM for RTL) */}
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-[#e9f0fc] rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <img src="/assets/dashboard/cars/close-outline.svg" alt="close" width={14} height={14} className="blue-filter" style={{ filter: 'invert(16%) sepia(85%) saturate(3860%) hue-rotate(224deg) brightness(84%) contrast(106%)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#f2f2f2]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
