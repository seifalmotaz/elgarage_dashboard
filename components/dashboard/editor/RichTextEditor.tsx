"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Simple HTML sanitizer for pasted content
function sanitizePasteHTML(html: string): string {
  // Remove script tags and event handlers
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, "");

  // Only allow basic formatting tags
  clean = clean.replace(/<(?!(\/?(p|br|b|i|u|em|strong|ul|ol|li|a|span)\b|>))/gi, "");

  return clean;
}

// Check if editor content is effectively empty
function isEmptyHTML(html: string): boolean {
  const stripped = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<p\s*[^>]*>\s*<\/p>/gi, "")
    .replace(/\s*/g, "");
  return stripped === "";
}

const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder = "اكتب هنا...", minHeight = "200px" }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const isInternalRef = useRef(false);

    // Expose the internal ref to parent via forwarded ref
    useImperativeHandle(ref, () => internalRef.current!, []);

    // Track if user is currently typing to avoid cursor jumps
    const isUserTypingRef = useRef(false);

    const handleInput = () => {
      if (!internalRef.current) return;

      let html = internalRef.current.innerHTML;

      // Normalize empty content
      if (isEmptyHTML(html)) {
        html = "";
      }

      onChange(html);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();

      const text = e.clipboardData.getData("text/plain");
      const html = e.clipboardData.getData("text/html");

      // Insert plain text or sanitized HTML
      if (html) {
        const sanitized = sanitizePasteHTML(html);
        document.execCommand("insertHTML", false, sanitized);
      } else {
        document.execCommand("insertText", false, text);
      }

      // Trigger onChange after paste
      setTimeout(() => {
        handleInput();
      }, 0);
    };

    const handleBlur = () => {
      isUserTypingRef.current = false;
      handleInput();
    };

    const handleKeyDown = () => {
      isUserTypingRef.current = true;
    };

    // Update content when value prop changes from outside
    useEffect(() => {
      if (!internalRef.current) return;

      // Only update if the value is different and user isn't typing
      if (!isUserTypingRef.current && value !== internalRef.current.innerHTML) {
        // Save cursor position
        const selection = window.getSelection();
        let savedRange: Range | null = null;

        if (selection && selection.rangeCount > 0) {
          savedRange = selection.getRangeAt(0).cloneRange();
          // Move the range to start of editor content to prevent cursor jumps
          savedRange.collapse(true);
        }

        internalRef.current.innerHTML = value;

        // Restore cursor if possible
        if (savedRange) {
          try {
            selection?.removeAllRanges();
            selection?.addRange(savedRange);
          } catch {
            // Cursor restoration failed, place at end
            const range = document.createRange();
            const sel = window.getSelection();
            if (internalRef.current.childNodes.length > 0) {
              range.selectNodeContents(internalRef.current);
              range.collapse(false);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }
        }
      }
    }, [value]);

    return (
      <div
        ref={internalRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseUp={() => {
          // Update active states in toolbar
        }}
        onKeyUp={() => {
          // Update active states in toolbar
        }}
        data-placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none p-4 text-[12px] text-gray-700 min-h-[200px] resize-none placeholder-[#d1d5db] text-start focus:outline-none"
        style={{ minHeight }}
      />
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;