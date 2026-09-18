"use client";

import React, { useState, useEffect } from "react";

interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
}

function ToolbarButton({ onClick, isActive, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing focus from editor
        onClick();
      }}
      className={`p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors ${
        isActive ? "bg-gray-200 text-[#002ec1]" : ""
      }`}
      title={title}
    >
      {children}
    </button>
  );
}

export default function EditorToolbar({ editorRef }: EditorToolbarProps) {
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Update active states based on cursor position
  useEffect(() => {
    const updateActiveStates = () => {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    };

    // Add event listeners to track cursor changes
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("mouseup", updateActiveStates);
      editor.addEventListener("keyup", updateActiveStates);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("mouseup", updateActiveStates);
        editor.removeEventListener("keyup", updateActiveStates);
      }
    };
  }, [editorRef]);

  const handleBold = () => {
    document.execCommand("bold", false);
    editorRef.current?.focus();
  };

  const handleItalic = () => {
    document.execCommand("italic", false);
    editorRef.current?.focus();
  };

  const handleUnderline = () => {
    document.execCommand("underline", false);
    editorRef.current?.focus();
  };

  const handleUnorderedList = () => {
    document.execCommand("insertUnorderedList", false);
    editorRef.current?.focus();
  };

  const handleOrderedList = () => {
    document.execCommand("insertOrderedList", false);
    editorRef.current?.focus();
  };

  const handleLink = () => {
    const url = window.prompt("أدخل الرابط:");
    if (url && url.trim()) {
      // Validate URL
      let cleanUrl = url.trim();
      if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = "https://" + cleanUrl;
      }
      document.execCommand("createLink", false, cleanUrl);
    }
    editorRef.current?.focus();
  };

  const handleClearFormat = () => {
    document.execCommand("removeFormat", false);
    editorRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-[#f2f2f2] bg-gray-50/50 flex-wrap">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5 border-r border-[#f2f2f2] pr-2 ml-1">
        <ToolbarButton onClick={handleBold} isActive={activeFormats.bold} title="غامق (B)">
          <span className="font-bold text-[14px]">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={handleItalic} isActive={activeFormats.italic} title="مائل (I)">
          <span className="italic text-[14px]">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={handleUnderline} isActive={activeFormats.underline} title="تسطير (U)">
          <span className="underline text-[14px]">U</span>
        </ToolbarButton>
      </div>

      {/* List Buttons */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton onClick={handleUnorderedList} title="قائمة نقطية">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="9" y1="18" x2="3" y2="18" />
            <line x1="6" y1="12" x2="3" y2="12" />
            <line x1="9" y1="6" x2="3" y2="6" />
            <circle cx="17" cy="6" r="1" fill="currentColor" />
            <circle cx="17" cy="12" r="1" fill="currentColor" />
            <circle cx="17" cy="18" r="1" fill="currentColor" />
          </svg>
        </ToolbarButton>
        <ToolbarButton onClick={handleOrderedList} title="قائمة مرقمة">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="10" y1="18" x2="3" y2="18" />
            <line x1="7" y1="12" x2="3" y2="12" />
            <line x1="10" y1="6" x2="3" y2="6" />
            <text x="15" y="8" fontSize="8" fill="currentColor" stroke="none">1</text>
            <text x="15" y="14" fontSize="8" fill="currentColor" stroke="none">2</text>
            <text x="15" y="20" fontSize="8" fill="currentColor" stroke="none">3</text>
          </svg>
        </ToolbarButton>
      </div>

      {/* Link Button */}
      <div className="flex items-center gap-0.5 border-r border-[#f2f2f2] px-2 mx-1">
        <ToolbarButton onClick={handleLink} title="رابط">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Clear Format */}
      <ToolbarButton onClick={handleClearFormat} title="مسح التنسيق">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </ToolbarButton>
    </div>
  );
}