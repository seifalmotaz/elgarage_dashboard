"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useFAQ } from "@/hooks/queries/useFAQ";
import { useUpdateFAQMutation } from "@/hooks/mutations/useFAQ";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditFAQPage({ params }: PageProps) {
  const router = useRouter();
  const updateMutation = useUpdateFAQMutation();

  const [id, setId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [answerEn, setAnswerEn] = useState("");
  const [category, setCategory] = useState("");

  // Unwrap params and fetch FAQ data
  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  const { data: faqData, isLoading } = useFAQ(id);

  // Populate form when FAQ data is fetched
  useEffect(() => {
    if (faqData) {
      setQuestion(faqData.question);
      setAnswer(faqData.answer);
      setQuestionEn(faqData.questionEn || "");
      setAnswerEn(faqData.answerEn || "");
      setCategory(faqData.category);
    }
  }, [faqData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim() || !category.trim()) {
      return;
    }

    updateMutation.mutate(
      {
        id,
        data: {
          question: question.trim(),
          answer: answer.trim(),
          questionEn: questionEn.trim() || null,
          answerEn: answerEn.trim() || null,
          category: category.trim(),
        },
      },
      {
        onSuccess: () => {
          router.push("/dashboard/faq");
        },
      }
    );
  };

  const handleCancel = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-11 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[16px] h-[200px] animate-pulse" />
          <div className="lg:col-span-2 bg-white p-6 rounded-[16px] h-[300px] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[#000a2a]">
          تعديل السؤال
        </h1>
        <Link
          href="/dashboard/faq"
          className="flex items-center gap-2 bg-white border border-[#f2f2f2] px-4 py-2 rounded-full text-[#1a1a1a] text-[14px] hover:bg-gray-50 transition-colors"
        >
          <span className="text-start">عودة</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rotate-0"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* RIGHT Column in RTL: Settings */}
        <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-6 shadow-sm">
          <h2 className="text-[16px] font-semibold text-[#002ec1] border-b border-[#f2f2f2] pb-3 text-start">
            الاعدادات
          </h2>

          <div className="flex flex-col gap-4">
            <Select
              label="التصنيف"
              value={category}
              onChange={setCategory}
              options={[
                { label: "شراء سيارة", value: "شراء سيارة" },
                { label: "بيع سيارة", value: "بيع سيارة" },
              ]}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-[#f2f2f2] mt-2">
            <Button
              variant="primary"
              className="flex-[2] h-[44px] rounded-full"
              onClick={handleSubmit}
              loading={updateMutation.isPending}
              disabled={updateMutation.isPending}
              icon={
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              }
              iconPosition="left"
            >
              {updateMutation.isPending ? 'جاري التحديث...' : 'تحديث السؤال'}
            </Button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-[#fff5f5] text-[#ef4444] border border-[#ffe4e4] rounded-full h-[44px] text-[14px] font-medium hover:bg-[#ffeaea] transition-colors"
            >
              الغاء
            </button>
          </div>
        </div>

        {/* LEFT Column in RTL: Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Question (Arabic) */}
          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
            <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
              السؤال (عربي) <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="اكتب السؤال هنا..."
                className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
              />
            </div>
          </div>

          {/* Answer (Arabic) */}
          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
            <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
              الاجابة (عربي) <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-white border border-[#f2f2f2] rounded-[16px] flex flex-col overflow-hidden focus-within:border-[#002ec1] transition-colors">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="اكتب الاجابة هنا..."
                className="bg-transparent border-none outline-none p-4 text-[12px] text-gray-700 min-h-[200px] resize-none placeholder-[#d1d5db] text-start"
              />
            </div>
          </div>

          {/* Question (English) */}
          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
            <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
              السؤال (انجليزي)
            </label>
            <div className="w-full bg-white border border-[#f2f2f2] h-[50px] rounded-[16px] px-4 flex items-center focus-within:border-[#002ec1] transition-colors">
              <input
                type="text"
                value={questionEn}
                onChange={(e) => setQuestionEn(e.target.value)}
                placeholder="Write the question in English..."
                dir="ltr"
                className="bg-transparent border-none outline-none flex-1 text-[12px] text-gray-700 placeholder-[#d1d5db] h-full text-start"
              />
            </div>
          </div>

          {/* Answer (English) */}
          <div className="bg-white p-6 rounded-[16px] border border-[#f2f2f2] flex flex-col gap-2 shadow-sm">
            <label className="text-[14px] text-[#1a1a1a] font-medium leading-[1.5] text-start">
              الاجابة (انجليزي)
            </label>
            <div className="w-full bg-white border border-[#f2f2f2] rounded-[16px] flex flex-col overflow-hidden focus-within:border-[#002ec1] transition-colors">
              <textarea
                value={answerEn}
                onChange={(e) => setAnswerEn(e.target.value)}
                placeholder="Write the answer in English..."
                dir="ltr"
                className="bg-transparent border-none outline-none p-4 text-[12px] text-gray-700 min-h-[200px] resize-none placeholder-[#d1d5db] text-start"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}