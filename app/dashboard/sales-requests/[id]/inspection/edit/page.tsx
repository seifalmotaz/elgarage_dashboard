'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useListingRequestDetail } from '@/hooks/queries/useListingRequests';
import { useStartInspectionMutation } from '@/hooks/mutations/useListingRequests';
import { AdminInspectionForm } from '@/components/dashboard/inspection/AdminInspectionForm';
import Button from '@/components/ui/Button';

export default function SalesRequestInspectionEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: request, isLoading, isError, error } = useListingRequestDetail(id);
  const startInspectionMutation = useStartInspectionMutation();

  const reportId = request?.inspectionReport?.id;
  const isCompleted = request?.inspectionReport?.status === 'COMPLETED';

  // If inspection report does not exist, provide easy one-click initialization
  const handleStartInspection = () => {
    startInspectionMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002ec1]" />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" dir="rtl">
        <p className="text-[#dc2626] text-[14px]">
          {error instanceof Error ? error.message : 'لم يتم العثور على طلب الفحص'}
        </p>
        <Link href="/dashboard/sales-requests" className="text-[#002ec1] text-[14px] underline">
          العودة لقائمة طلبات الفحص
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20" dir="rtl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[14px] flex-wrap">
        <Link href="/dashboard" className="text-[#8286ab] font-light hover:text-[#002ec1] transition-colors">
          الرئيسية
        </Link>
        <span className="text-[#8286ab]">/</span>
        <Link href="/dashboard/sales-requests" className="text-[#8286ab] font-light hover:text-[#002ec1] transition-colors">
          طلبات البيع و الفحص
        </Link>
        <span className="text-[#8286ab]">/</span>
        <Link href={`/dashboard/sales-requests/${id}`} className="text-[#8286ab] font-light hover:text-[#002ec1] transition-colors">
          {request.brand} {request.model} ({request.year})
        </Link>
        <span className="text-[#8286ab]">/</span>
        <span className="text-[#111] font-semibold">تعديل تقرير الفحص</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-[16px] p-5 border border-[#f2f2f2] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#002ec1]/5 rounded-[12px] flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-[#000A2A]">
              تعديل تقرير الفحص — {request.brand} {request.model} {request.year}
            </h1>
            <p className="text-[13px] text-[#8286ab] font-light mt-0.5">
              صاحب السيارة: {request.user?.firstName} {request.user?.lastName} ({request.user?.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {reportId && (
            <span className={`px-4 py-1.5 rounded-[200px] text-[12px] font-bold ${
              isCompleted
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              {isCompleted ? 'تقرير مكتمل' : 'قيد الفحص'}
            </span>
          )}
          <Link
            href={`/dashboard/sales-requests/${id}`}
            className="px-4 py-2 rounded-[200px] border border-[#e5e7eb] hover:bg-gray-50 text-[#6b7280] text-[13px] font-medium transition-all"
          >
            العودة لتفاصيل الطلب
          </Link>
        </div>
      </div>

      {/* Main Inspection Form or Start Action */}
      {reportId ? (
        <AdminInspectionForm
          reportId={reportId}
          returnUrl={`/dashboard/sales-requests/${id}`}
          carInfo={{ brand: request.brand, model: request.model, year: request.year }}
        />
      ) : (
        <div className="bg-white rounded-[16px] p-12 border border-[#f2f2f2] flex flex-col items-center justify-center text-center gap-4 shadow-sm">
          <div className="w-16 h-16 bg-[#002ec1]/5 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h2 className="text-[18px] font-bold text-[#1a1a1a]">لم يتم إنشاء تقرير فحص لهذا الطلب بعد</h2>
            <p className="text-[13px] text-[#6b7280] font-light">
              يمكنك كمسؤول بدء تقرير الفحص وتعبئة البيانات والتقييمات والملاحظات والصور مباشرة.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartInspection}
            disabled={startInspectionMutation.isPending}
            className="rounded-[200px] px-8 h-[48px] text-[14px] font-bold shadow-md"
          >
            {startInspectionMutation.isPending ? 'جاري بدء الفحص...' : 'بدء إدخال تقرير الفحص الآن'}
          </Button>
        </div>
      )}
    </div>
  );
}
