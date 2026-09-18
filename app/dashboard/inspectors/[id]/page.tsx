"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import EditInspectorModal from "@/components/dashboard/EditInspectorModal";
import CreateAppointmentModal from "@/components/dashboard/CreateAppointmentModal";
import WeeklyTimeline from "@/components/dashboard/WeeklyTimeline";
import { useInspectorDetail } from "@/hooks/queries/useInspectors";
import { InspectorListItem } from "@/lib/api/inspectors";

export default function InspectorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectorId = params.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "calendar">("overview");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createAppointmentModalOpen, setCreateAppointmentModalOpen] = useState(false);

  const { data: inspector, isLoading, isError, error, refetch } = useInspectorDetail(inspectorId);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    refetch();
  };

  const handleCreateAppointmentSuccess = () => {
    setCreateAppointmentModalOpen(false);
    refetch();
  };

  const inspectorName = inspector
    ? `${inspector.firstName || ""} ${inspector.lastName || ""}`.trim() || "—"
    : "";

  return (
    <div
      className="flex flex-col w-full max-w-[1200px] mx-auto gap-[24px]"

    >

      {/* Header Row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[12px]">
          <h1 className="text-[32px] font-bold text-[#111]">{inspectorName}</h1>
        </div>
        {!isLoading && !isError && inspector && (
          <button
            onClick={() => setEditModalOpen(true)}
            className="bg-[#002ec1] hover:bg-[#0025a1] text-white h-[44px] px-[24px] rounded-[12px] flex items-center gap-[8px] transition-all duration-300"
          >
            <span className="text-[14px] font-medium">تعديل</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-[24px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] p-[20px]  border border-gray-100 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-24 mb-[16px]" />
                <div className="h-8 bg-gray-200 rounded w-32" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-[24px] p-[24px] shadow-sm border border-gray-100 animate-pulse">
            <div className="h-[200px] bg-gray-100 rounded-[16px]" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-gray-600 text-lg">{error?.message || String(error)}</p>
          <Button variant="primary" onClick={() => refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && inspector && (
        <>
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {/* Card 1: Email + Phone */}
            <div className="bg-white rounded-[24px] p-[20px]  border border-gray-100">
              <h3 className="text-[16px] font-semibold text-[#111] mb-[16px]">
                معلومات الاتصال
              </h3>
              <div className="flex flex-col gap-[12px]">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">البريد الإلكتروني</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {inspector.email || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">رقم الهاتف</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {inspector.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: City + Region */}
            <div className="bg-white rounded-[24px] p-[20px]  border border-gray-100">
              <h3 className="text-[16px] font-semibold text-[#111] mb-[16px]">
                الموقع
              </h3>
              <div className="flex flex-col gap-[12px]">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">المدينة</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {inspector.city || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">المنطقة</span>
                  <span className="text-[14px] text-[#111] font-medium">
                    {inspector.region || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Status */}
            <div className="bg-white rounded-[24px] p-[20px]  border border-gray-100">
              <h3 className="text-[16px] font-semibold text-[#111] mb-[16px]">
                الحالة
              </h3>
              <div className="flex flex-col gap-[4px]">
                <span
                  className={`px-[12px] py-[4px] rounded-full text-[14px] font-medium w-fit ${inspector.isActive
                    ? "bg-[#F0FDF4] text-[#16A34A]"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {inspector.isActive ? "نشط" : "غير نشط"}
                </span>
              </div>
            </div>

            {/* Card 4: Stats */}
            <div className="bg-white rounded-[24px] p-[20px]  border border-gray-100">
              <h3 className="text-[16px] font-semibold text-[#111] mb-[16px]">
                الاحصائيات
              </h3>
              <div className="grid grid-cols-2 gap-[12px]">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">إجمالي الفحوصات</span>
                  <span className="text-[20px] text-[#111] font-bold">
                    {inspector.stats.totalInspections}
                  </span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">المكتملة</span>
                  <span className="text-[20px] text-[#16A34A] font-bold">
                    {inspector.stats.completed}
                  </span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">قيد التنفيذ</span>
                  <span className="text-[20px] text-[#2563EB] font-bold">
                    {inspector.stats.inProgress}
                  </span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#6b7280]">الملغية</span>
                  <span className="text-[20px] text-[#DC2626] font-bold">
                    {inspector.stats.cancelled}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-start w-full mt-[16px]">
            <div className="bg-white p-[4px] rounded-[999px] flex items-center gap-[4px] border border-[#f3f3f3] h-[60px]">
              <button
                onClick={() => setActiveTab("overview")}
                className={`h-[48px] px-[20px] rounded-[999px] text-[14px] font-medium transition-all duration-300 flex items-center gap-[8px] ${activeTab === "overview" ? "bg-[#002ec1] text-white" : "text-[#6b7280]"
                  }`}
              >
                <img
                  src="/assets/dashboard/cards/chart.svg"
                  alt="Overview"
                  width={20}
                  height={20}
                  className={
                    activeTab === "overview" ? "brightness-0 invert" : "opacity-60"
                  }
                />                <span className="text-[14px]">نظرة عامة</span>

              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`h-[48px] px-[20px] rounded-[999px] text-[14px] font-medium transition-all duration-300 flex items-center gap-[8px] ${activeTab === "calendar" ? "bg-[#002ec1] text-white" : "text-[#6b7280]"
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.66797 1.6665V4.1665" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.332 1.6665V4.1665" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.91797 7.5752H17.0846" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.5 7.08317V14.1665C17.5 16.6665 16.25 18.3332 13.3333 18.3332H6.66667C3.75 18.3332 2.5 16.6665 2.5 14.1665V7.08317C2.5 4.58317 3.75 2.9165 6.66667 2.9165H13.3333C16.25 2.9165 17.5 4.58317 17.5 7.08317Z" stroke="#6B7280" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.0801 11.4167H13.0875" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.0801 13.9167H13.0875" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.99803 11.4167H10.0055" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.99803 13.9167H10.0055" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.91209 11.4167H6.91957" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.91209 13.9167H6.91957" stroke="#6B7280" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[14px]">التقويم</span>

              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-[24px] p-[24px] border border-gray-100">
              <h3 className="text-[18px] font-semibold text-[#111] mb-[20px]">
                بيانات المفتش
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[14px] text-[#6b7280]">الاسم الكامل</span>
                  <span className="text-[16px] text-[#111] font-medium">
                    {inspectorName}
                  </span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[14px] text-[#6b7280]">رقم الهاتف</span>
                  <span className="text-[16px] text-[#111] font-medium">
                    {inspector.phone}
                  </span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[14px] text-[#6b7280]">البريد الإلكتروني</span>
                  <span className="text-[16px] text-[#111] font-medium">
                    {inspector.email || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[14px] text-[#6b7280]">المدينة</span>
                  <span className="text-[16px] text-[#111] font-medium">
                    {inspector.city || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[14px] text-[#6b7280]">المنطقة</span>
                  <span className="text-[16px] text-[#111] font-medium">
                    {inspector.region || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <span className="text-[14px] text-[#6b7280]">تاريخ التسجيل</span>
                  <span className="text-[16px] text-[#111] font-medium">
                    {new Date(inspector.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <WeeklyTimeline
              inspectorId={inspectorId}
              inspectorName={inspectorName}
            />
          )}
        </>
      )}

      {/* Edit Modal */}
      {inspector && (
        <EditInspectorModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          inspector={inspector}
        />
      )}

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={createAppointmentModalOpen}
        onClose={() => setCreateAppointmentModalOpen(false)}
        onSuccess={handleCreateAppointmentSuccess}
        inspectorId={inspectorId}
        inspectorName={inspectorName}
      />
    </div>
  );
}