'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCarDetail } from '@/hooks/queries/useCars';
import { useInspectionByCarId, useInspectionById } from '@/hooks/queries/useAdminInspections';
import { AdminInspectionForm } from '@/components/dashboard/inspection/AdminInspectionForm';
import { InspectionReport } from '@/components/dashboard/inspection/InspectionReport';
import { transformInspectionReport } from '@/lib/utils/inspection-transformers';

export default function EditInspectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const carId = params.id as string;
  const reportIdParam = searchParams.get('reportId');

  const { data: car, isLoading: carLoading } = useCarDetail(carId);

  // For manual cars: fetch inspection by carId
  const directInspection = useInspectionByCarId(reportIdParam ? undefined : carId);
  // For direct reportId access
  const directReport = useInspectionById(reportIdParam || undefined);

  const isLoading = carLoading || directInspection.isLoading || directReport.isLoading;

  // Determine the actual report ID
  const effectiveReportId = reportIdParam || directInspection.data?.id;
  const report = reportIdParam ? directReport.data : directInspection.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002ec1]" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-[#dc2626] text-[14px]">لم يتم العثور على السيارة</p>
        <Link href="/dashboard/cars" className="text-[#002ec1] text-[14px] underline">
          العودة لقائمة السيارات
        </Link>
      </div>
    );
  }

  // If no report exists and no reportId was provided, redirect to create
  if (!effectiveReportId && !reportIdParam) {
    router.push(`/dashboard/cars/${carId}/inspection/new`);
    return null;
  }

  // If report was provided but not found
  if (reportIdParam && !directReport.data && !directReport.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-[#dc2626] text-[14px]">لم يتم العثور على تقرير الفحص</p>
        <Link href={`/dashboard/cars/${carId}`} className="text-[#002ec1] text-[14px] underline">
          العودة لصفحة السيارة
        </Link>
      </div>
    );
  }

  const isCompleted = report?.status === 'COMPLETED';

  return (
    <div className="flex flex-col gap-8 pb-20" dir="rtl">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[14px]">
        <Link href="/dashboard" className="text-[#8286ab] font-light">الرئيسية</Link>
        <span className="text-[#8286ab]">/</span>
        <Link href="/dashboard/cars" className="text-[#8286ab] font-light">السيارات</Link>
        <span className="text-[#8286ab]">/</span>
        <Link href={`/dashboard/cars/${carId}`} className="text-[#8286ab] font-light">
          {car.brand} {car.model}
        </Link>
        <span className="text-[#8286ab]">/</span>
        <span className="text-[#111] font-semibold">تعديل تقرير الفحص</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold text-[#000A2A]">
          تعديل تقرير الفحص
        </h1>
        <span className={`px-4 py-1.5 rounded-[12px] text-[12px] font-medium ${
          isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {isCompleted ? 'مكتمل' : 'قيد التنفيذ'}
        </span>
      </div>

      {effectiveReportId ? (
        <AdminInspectionForm
          reportId={effectiveReportId}
          carId={carId}
          returnUrl={`/dashboard/cars/${carId}`}
          carInfo={{ brand: car.brand, model: car.model, year: car.year }}
        />
      ) : null}
    </div>
  );
}