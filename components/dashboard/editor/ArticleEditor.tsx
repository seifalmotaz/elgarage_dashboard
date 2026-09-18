"use client";

import React, { useRef } from "react";
import EditorToolbar from "./EditorToolbar";
import RichTextEditor from "./RichTextEditor";

interface ArticleEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function ArticleEditor({
  value,
  onChange,
  placeholder = "اكتب محتوى المقال هنا ...",
  minHeight = "200px",
}: ArticleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full bg-white border border-[#f2f2f2] rounded-[16px] overflow-hidden shadow-sm focus-within:border-[#002ec1] transition-colors">
      <EditorToolbar editorRef={editorRef} />
      <RichTextEditor
        ref={editorRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minHeight={minHeight}
      />
    </div>
  );
}