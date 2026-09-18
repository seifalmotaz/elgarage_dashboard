'use client';

import React from 'react';

interface DragHandleProps {
  className?: string;
}

export default function DragHandle({ className = '' }: DragHandleProps) {
  return (
    <div className={`w-5 h-5 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors ${className}`}>
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="3" cy="3" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
        <circle cx="13" cy="3" r="1.5" fill="currentColor"/>
        <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="3" cy="13" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
        <circle cx="13" cy="13" r="1.5" fill="currentColor"/>
      </svg>
    </div>
  );
}