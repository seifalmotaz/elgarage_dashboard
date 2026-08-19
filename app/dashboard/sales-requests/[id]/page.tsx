"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { STATUS_MAP, TIMELINE_STEPS } from "@/lib/api/listing-requests";
import type { ListingRequestDetail, TimelineStep } from "@/lib/api/listing-requests";
import { useListingRequestDetail } from "@/hooks/queries/useListingRequests";
import { useAssignInspectorMutation, useApproveRequestMutation, useRejectRequestMutation, useCancelRequestMutation } from "@/hooks/mutations/useListingRequests";
import { useInspectorsForAssignment } from "@/hooks/queries/useListingRequests";
import { formatDate } from "@/lib/utils/date";
import { Timeline } from "@/components/dashboard/inspection/Timeline";
import { InspectionReport } from "@/components/dashboard/inspection/InspectionReport";

function buildTimeline(data: ListingRequestDetail): TimelineStep[] {
  return TIMELINE_STEPS.map((step) => {
    switch (step.key) {
      case "created":
        return { ...step, completed: true, date: data.createdAt };
      case "assigned":
        return { ...step, completed: !!data.assignedAt, date: data.assignedAt };
      case "inspection":
        return {
          ...step,
          completed: !!data.inspectionReport,
          date: data.inspectionReport?.startedAt || null,
        };
      case "report_uploaded":
        return {
          ...step,
          completed: data.inspectionReport?.status === "COMPLETED" || data.status === "INSPECTED" || data.status === "APPROVED",
          date: data.inspectionReport?.completedAt || null,
        };
      default:
        return { ...step, completed: false, date: null };
    }
  });
}

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useListingRequestDetail(id);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Mutations
  const assignInspectorMutation = useAssignInspectorMutation();
  const approveRequestMutation = useApproveRequestMutation();
  const rejectRequestMutation = useRejectRequestMutation();
  const cancelRequestMutation = useCancelRequestMutation();

  // Fetch inspectors for assignment dropdown
  const { data: inspectorsData } = useInspectorsForAssignment();
  const inspectors = inspectorsData?.data ?? [];

  const actionLoading =
    assignInspectorMutation.isPending ||
    approveRequestMutation.isPending ||
    rejectRequestMutation.isPending ||
    cancelRequestMutation.isPending;

  const openAssignModal = () => {
    setSelectedInspector("");
    setAssignModalOpen(true);
  };

  const onAssign = async () => {
    if (!selectedInspector) return;
    const success = await assignInspectorMutation.mutateAsync({
      requestId: id,
      inspectorId: selectedInspector,
    });
    if (success) {
      setAssignModalOpen(false);
    }
  };

  const onApprove = async () => {
    if (!confirm("هل أنت متأكد من اعتماد طلب الفحص؟ سيتم إنشاء سيارة في حالة مسودة.")) return;
    await approveRequestMutation.mutateAsync({ requestId: id });
  };

  const onCancel = async () => {
    if (!confirm("هل أنت متأكد من إلغاء الطلب؟")) return;
    await cancelRequestMutation.mutateAsync({ requestId: id });
  };

  const onReject = async () => {
    if (rejectionReason.trim().length < 10) return;
    const success = await rejectRequestMutation.mutateAsync({
      requestId: id,
      reason: rejectionReason.trim(),
    });
    if (success) {
      setRejectModalOpen(false);
      setRejectionReason("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <div className="text-[14px] text-[#6b7280]">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !data) {
    const errorMessage = error instanceof Error ? error.message : error || "الطلب غير موجود";
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4" dir="rtl">
        <p className="text-[14px] text-[#dc2626]">{errorMessage}</p>
        <Link href="/dashboard/sales-requests" className="text-[#002ec1] text-[14px] underline">
          العودة للقائمة
        </Link>
      </div>
    );
  }

  const timeline = buildTimeline(data);
  const statusStyle = STATUS_MAP[data.status];
  const clientFullName = [data.user.firstName, data.user.lastName].filter(Boolean).join(" ") || "--";
  const inspectorFullName = data.assignedInspector
    ? [data.assignedInspector.firstName, data.assignedInspector.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="flex flex-col gap-6 pb-10" dir="rtl">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-[14px]">
          <Link href="/dashboard" className="text-[#94A3B8] font-medium">
            الرئيسية
          </Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 9L4.5 6L7.5 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link href="/dashboard/cars" className="text-[#94A3B8] font-medium">
            السيارات و المعروضات
          </Link>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 9L4.5 6L7.5 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Link href="/dashboard/sales-requests" className="text-[#94A3B8] font-medium">
            طلبات البيع و الفحص
          </Link>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[24px] font-semibold text-[#000A2A]">تفاصيل طلب الفحص</h1>
            <span className={`px-4 py-1.5 rounded-[12px] text-[12px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>
          <Link
            href="/dashboard/sales-requests"
            className="bg-white px-4 h-[44px] rounded-[200px] flex items-center justify-center gap-2 transition-all"
          >
            <span className="text-[12px] text-[#6B7280] font-normal">عودة</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Car Info Card */}
        <div className="bg-white rounded-[16px] px-4 py-5 flex flex-col gap-4 border border-[#F2F2F2]">
          <h3 className="text-[16px] font-semibold text-[#002EC1] text-right">السيارة</h3>

          <div className="flex flex-col md:flex-row items-center justify-start gap-6">
            <div className="relative w-[120px] h-[120px] rounded-[6px] overflow-hidden shrink-0 border border-[#F2F2F2] bg-[#f9fafb] flex items-center justify-center">
              <img src="/assets/dashboard/cars/stats-car.svg" alt="car" width={48} height={48} className="opacity-40" />
            </div>

            <div className="flex flex-col gap-4 flex-1 w-full">
              <h4 className="text-[20px] font-bold text-[#1A1A1A] text-right leading-none mt-1">
                {data.brand} {data.model} {data.year}
              </h4>

              <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4">
                {[
                  { label: "العميل", value: clientFullName, icon: "user" },
                  { label: "رقم العميل", value: data.user.phone, icon: "phone" },
                  { label: "المفتش", value: inspectorFullName || "--", icon: "inspector" },
                  { label: "الوقت", value: data.scheduledTime, icon: "clock" },
                  { label: "التاريخ", value: formatDate(data.scheduledDate), icon: "calendar" },
                  { label: "المنطقة", value: data.address || "--", icon: "location" },
                  { label: "المسافة", value: data.mileage ? `${data.mileage.toLocaleString()} كم` : "--", icon: "mileage" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="relative w-5 h-5 shrink-0 flex items-center justify-center text-[#002EC1]">
                      {item.icon === "user" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                      {item.icon === "phone" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      )}
                      {item.icon === "inspector" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <polyline points="16 11 18 13 22 9" />
                        </svg>
                      )}
                      {item.icon === "clock" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      )}
                      {item.icon === "calendar" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      {item.icon === "location" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      )}
                      {item.icon === "mileage" && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2a10 10 0 1 0 10 10h-10V2z" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-[12px] text-[#6B7280] font-light">{item.label}</span>
                      <span className="text-[14px] text-[#1A1A1A] font-medium">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Timeline steps={timeline} />

        {/* Inspection Report Results */}
        <InspectionReport report={data.inspectionReport} />

        {/* Rejection Reason */}
        {data.status === "REJECTED" && data.rejectionReason && (
          <div className="bg-white rounded-[16px] px-4 py-5 flex flex-col gap-3 border border-[#FFE0DE] bg-[#FEF2F2]">
            <h3 className="text-[16px] font-semibold text-[#AF1208] text-right">سبب الرفض</h3>
            <p className="text-[14px] text-[#1a1a1a]">{data.rejectionReason}</p>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white rounded-[16px] px-4 pt-3 pb-5 flex flex-col border border-[#F2F2F2]">
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-[#F2F2F2]">
            {data.status === "PENDING" && (
              <>
                <Button
                  variant="primary"
                  onClick={openAssignModal}
                  className="w-full sm:w-auto min-w-[199px] h-[44px] rounded-[200px] text-[12px] font-semibold"
                >
                  تعيين مفتش
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={actionLoading}
                  className="w-full sm:w-auto min-w-[199px] h-[44px] rounded-[200px] border-red-400 text-red-600 hover:bg-red-50 text-[12px] font-semibold"
                >
                  {cancelRequestMutation.isPending ? "جاري الإلغاء..." : "إلغاء الطلب"}
                </Button>
              </>
            )}

            {data.status === "ASSIGNED" && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={actionLoading}
                className="w-full sm:w-auto min-w-[199px] h-[44px] rounded-[200px] border-red-400 text-red-600 hover:bg-red-50 text-[12px] font-semibold"
              >
                {cancelRequestMutation.isPending ? "جاري الإلغاء..." : "إلغاء الطلب"}
              </Button>
            )}

            {data.status === "INSPECTED" && (
              <>
                <Button
                  variant="primary"
                  onClick={onApprove}
                  disabled={actionLoading}
                  className="w-full sm:w-auto min-w-[199px] h-[44px] rounded-[200px] bg-green-600 hover:bg-green-700 text-[12px] font-semibold"
                >
                  اعتماد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRejectModalOpen(true)}
                  className="w-full sm:w-auto min-w-[190px] h-[44px] rounded-[200px] border-red-400 text-red-600 hover:bg-red-50 text-[12px] font-semibold"
                >
                  رفض
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assign Inspector Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="تعيين مفتش"
        footer={
          <div className="flex items-center gap-4 justify-start">
            <Button
              variant="primary"
              onClick={onAssign}
              disabled={actionLoading || !selectedInspector}
              className="w-[180px] h-[44px] rounded-full text-[12px] font-semibold"
            >
              {actionLoading ? "جاري التعيين..." : "تأكيد التعيين"}
            </Button>
            <button
              onClick={() => setAssignModalOpen(false)}
              className="w-[120px] h-[44px] bg-[#fef2f2] text-[#dc2626] rounded-full text-[12px] font-semibold hover:bg-red-100 transition-all"
            >
              إلغاء
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4" dir="rtl">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-normal text-start">
              اختر المفتش
            </label>
            <select
              value={selectedInspector}
              onChange={(e) => setSelectedInspector(e.target.value)}
              className="h-[48px] rounded-[12px] px-4 text-[14px] border border-[#f2f2f2] outline-none focus:border-[#002ec1] bg-white"
            >
              <option value="">-- اختر مفتشا --</option>
              {inspectors.map((insp) => (
                <option key={insp.id} value={insp.id}>
                  {[insp.firstName, insp.lastName].filter(Boolean).join(" ")} ({insp.phone})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="رفض طلب الفحص"
        footer={
          <div className="flex items-center gap-4 justify-start">
            <Button
              variant="primary"
              onClick={onReject}
              disabled={actionLoading || rejectionReason.trim().length < 10}
              className="w-[180px] h-[44px] rounded-full text-[12px] font-semibold bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "جاري الرفض..." : "تأكيد الرفض"}
            </Button>
            <button
              onClick={() => setRejectModalOpen(false)}
              className="w-[120px] h-[44px] bg-[#fef2f2] text-[#dc2626] rounded-full text-[12px] font-semibold hover:bg-red-100 transition-all"
            >
              إلغاء
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4" dir="rtl">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] text-[#1a1a1a] font-normal text-start">
              سبب الرفض
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setRejectionReason(value);
                }
              }}
              placeholder="اكتب سبب الرفض..."
              maxLength={500}
              className="w-full min-h-[100px] bg-white border border-[#f2f2f2] rounded-[16px] p-4 text-[12px] text-[#1a1a1a] font-light outline-none resize-none leading-[1.7] text-right"
            />
            <small className="text-[12px] text-[#9ca3af]">
              {rejectionReason.length}/500 (الحد الأدنى 10 أحرف)
            </small>
          </div>
        </div>
      </Modal>
    </div>
  );
}