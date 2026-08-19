'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateInspectionMutation } from '@/hooks/mutations/useAdminInspections';
import { useCarDetail } from '@/hooks/queries/useCars';
import toast from 'react-hot-toast';

export default function NewInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;
  const { data: car, isLoading: carLoading } = useCarDetail(carId);
  const createInspection = useCreateInspectionMutation();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const result = await createInspection.mutateAsync(carId);
      toast.success('تم إنشاء تقرير الفحص بنجاح');
      router.push(`/dashboard/cars/${carId}/inspection/edit?reportId=${result.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء تقرير الفحص';
      toast.error(message);
      setCreating(false);
    }
  };

  if (carLoading) {
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
        <span className="text-[#111] font-semibold">إنشاء فحص</span>
      </div>

      <div className="w-full max-w-xl mx-auto bg-white rounded-[16px] p-8 border border-[#f2f2f2] flex flex-col items-center gap-6 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-[#002ec1]/5 rounded-full flex items-center justify-center mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#002ec1" strokeWidth="2">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h2 className="text-[20px] font-semibold text-[#1a1a1a]">إنشاء تقرير فحص للسيارة</h2>
          <p className="text-[14px] text-[#6b7280] max-w-md font-medium">
            {car.brand} {car.model} - {car.year}
          </p>
          <p className="text-[12px] text-[#9ca3af] max-w-md leading-relaxed">
            سيتم إنشاء تقرير فحص باستخدام أحدث إصدار من أسئلة الفحص. يمكنك إكمال التقرير فور الإنشاء.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full justify-center mt-2">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-8 h-[48px] bg-[#002ec1] text-white rounded-[200px] text-[14px] font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md"
          >
            {creating ? 'جاري الإنشاء...' : 'إنشاء تقرير الفحص'}
          </button>
          <Link
            href={`/dashboard/cars/${carId}`}
            className="px-6 h-[48px] bg-white border border-[#e5e7eb] rounded-[200px] text-[14px] text-[#6b7280] font-medium flex items-center hover:bg-gray-50 transition-all"
          >
            إلغاء
          </Link>
        </div>
      </div>
    </div>
  );
}