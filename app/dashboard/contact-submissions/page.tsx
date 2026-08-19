"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import Table, { ColumnDef } from "@/components/ui/Table";
import { StatusFilter } from "@/components/dashboard/filters/StatusFilter";
import {
  useContactSubmissions,
} from "@/hooks/queries/useContactSubmissions";
import { ContactSubmission, MESSAGE_TYPE_LABELS, MESSAGE_TYPE_FILTER_OPTIONS } from "@/lib/api/contact";
import { formatDate } from "@/lib/utils/date";

// Message type color mapping
const MESSAGE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  suggestion: { bg: "bg-blue-100", text: "text-blue-700" },
  complaint: { bg: "bg-red-100", text: "text-red-700" },
  inquiry: { bg: "bg-green-100", text: "text-green-700" },
};

// Modal for viewing message details
function MessageModal({
  isOpen,
  onClose,
  submission,
}: {
  isOpen: boolean;
  onClose: () => void;
  submission: ContactSubmission | null;
}) {
  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#f2f2f2] flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#1a1a1a]">تفاصيل الرسالة</h3>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Sender Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-[#6b7280]">الاسم</label>
              <p className="text-[#1a1a1a] font-medium">{submission.name}</p>
            </div>
            <div>
              <label className="text-sm text-[#6b7280]">البريد الإلكتروني</label>
              <p className="text-[#1a1a1a] font-medium" dir="ltr">{submission.email}</p>
            </div>
            <div>
              <label className="text-sm text-[#6b7280]">رقم الجوال</label>
              <p className="text-[#1a1a1a] font-medium" dir="ltr">
                {submission.phone || "غير محدد"}
              </p>
            </div>
            <div>
              <label className="text-sm text-[#6b7280]">نوع الرسالة</label>
              <span
                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm ${
                  MESSAGE_TYPE_COLORS[submission.messageType]?.bg || "bg-gray-100"
                } ${MESSAGE_TYPE_COLORS[submission.messageType]?.text || "text-gray-700"}`}
              >
                {MESSAGE_TYPE_LABELS[submission.messageType] || submission.messageType}
              </span>
            </div>
            <div>
              <label className="text-sm text-[#6b7280]">تاريخ الإرسال</label>
              <p className="text-[#1a1a1a] font-medium">{formatDate(submission.createdAt)}</p>
            </div>
            {submission.user && (
              <div>
                <label className="text-sm text-[#6b7280]">مرتبط بحساب</label>
                <p className="text-[#1a1a1a] font-medium">
                  {[submission.user.firstName, submission.user.lastName].filter(Boolean).join(" ") || submission.user.phone}
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm text-[#6b7280] mb-2 block">نص الرسالة</label>
            <div className="bg-[#fafafa] rounded-xl p-4 border border-[#f2f2f2]">
              <p className="text-[#1a1a1a] whitespace-pre-wrap">{submission.message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#f2f2f2] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#002ec1] text-white rounded-xl hover:bg-[#001a8f] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactSubmissionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [messageTypeFilter, setMessageTypeFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Build filters
  const filters = {
    page: currentPage,
    limit: 10,
    ...(messageTypeFilter && { messageType: messageTypeFilter as 'suggestion' | 'complaint' | 'inquiry' }),
  };

  const { data, isLoading, isError, refetch } = useContactSubmissions(filters);

  // View message handler
  const handleViewMessage = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  // Table columns
  const columns: ColumnDef<ContactSubmission>[] = [
    {
      header: "الاسم",
      cell: (row) => (
        <span className="font-medium text-[#1a1a1a]">{row.name}</span>
      ),
    },
    {
      header: "البريد الإلكتروني",
      cell: (row) => (
        <span className="text-[#4b5563] text-sm" dir="ltr">{row.email}</span>
      ),
    },
    {
      header: "رقم الجوال",
      cell: (row) => (
        <span className="text-[#4b5563] text-sm" dir="ltr">
          {row.phone || "-"}
        </span>
      ),
    },
    {
      header: "نوع الرسالة",
      cell: (row) => {
        const colors = MESSAGE_TYPE_COLORS[row.messageType] || { bg: "bg-gray-100", text: "text-gray-700" };
        return (
          <span
            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm ${colors.bg} ${colors.text}`}
          >
            {MESSAGE_TYPE_LABELS[row.messageType] || row.messageType}
          </span>
        );
      },
    },
    {
      header: "تاريخ الإرسال",
      cell: (row) => (
        <span className="text-[#4b5563] text-sm">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "الإجراءات",
      cell: (row) => (
        <button
          onClick={() => handleViewMessage(row)}
          className="flex items-center gap-2 text-[#002ec1] hover:text-[#001a8f] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-sm">عرض</span>
        </button>
      ),
    },
  ];

  // Pagination config
  const paginationConfig = data
    ? {
        currentPage: data.page,
        totalPages: data.totalPages,
        totalItems: data.total,
        itemsPerPage: data.limit,
        onPageChange: setCurrentPage,
      }
    : undefined;

  if (isLoading) {
    return <LoadingState type="page" />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} message="فشل تحميل رسائل التواصل" />;
  }

  return (
    <PageContainer>
      <PageHeader title="رسائل التواصل" />

      <ContentCard
        title="الرسائل المستلمة"
        titleCount={data?.total ?? 0}
        filters={
          <StatusFilter
            value={messageTypeFilter}
            options={MESSAGE_TYPE_FILTER_OPTIONS}
            onChange={(value) => {
              setMessageTypeFilter(value);
              setCurrentPage(1);
            }}
          />
        }
      >
        <Table
          data={data?.data ?? []}
          columns={columns}
          loading={isLoading}
          pagination={paginationConfig}
        />
      </ContentCard>

      {/* Message Detail Modal */}
      <MessageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
      />
    </PageContainer>
  );
}