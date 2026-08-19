"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useDashboardStats, TimePeriod } from '@/hooks/queries/useStatistics';
import { LineChartComponent } from './charts/LineChartComponent';
import { cn } from '@/lib/utils';

// Types
interface CarStatistics {
  published: number;
  verified: number;
  sold: number;
  bought: number;
}

// Skeleton for donut chart loading
function DonutSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "bg-white rounded-[24px] p-[24px] shadow-sm border border-gray-50 animate-pulse",
      className
    )}>
      <div className="flex items-center justify-between mb-[24px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[24px] h-[24px] bg-gray-200 rounded" />
          <div className="w-[120px] h-[18px] bg-gray-200 rounded" />
        </div>
        <div className="w-[200px] h-[44px] bg-gray-200 rounded-full" />
      </div>
      <div className="flex flex-row items-center justify-between flex-1 mt-[16px]">
        <div className="w-[190px] h-[190px] bg-gray-50 rounded-full" />
        <div className="flex-1 flex flex-col gap-[20px] items-end">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-[12px]">
              <div className="w-[100px] h-[14px] bg-gray-200 rounded" />
              <div className="w-[10px] h-[10px] bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Time filter buttons component
function TimeFilterButtons({ 
  period, 
  onPeriodChange 
}: { 
  period: TimePeriod; 
  onPeriodChange: (p: TimePeriod) => void;
}) {
  const PERIOD_LABELS: Record<TimePeriod, string> = {
    day: 'يوم',
    week: 'أسبوع',
    month: 'شهر',
    year: 'سنة',
  };

  return (
    <div className="bg-[#f5f7f9] border border-[#f3f3f3] rounded-[29px] flex items-center p-[4px] h-[44px]">
      {(['day', 'week', 'month', 'year'] as TimePeriod[]).map((p) => (
        <button
          key={p}
          onClick={() => onPeriodChange(p)}
          className={cn(
            "px-[20px] py-[8px] text-[12px] font-medium rounded-full transition-all",
            period === p
              ? "bg-[#002ec1] text-white shadow-sm"
              : "text-gray-400 hover:text-gray-800"
          )}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

// Donut Chart Card - CSS Gradient (keep existing approach)
function DonutChartCard({
  carStats,
  period,
  onPeriodChange,
  isLoading,
}: {
  carStats?: CarStatistics;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  isLoading?: boolean;
}) {
  const totalCars = carStats
    ? carStats.published + carStats.verified + carStats.sold + carStats.bought
    : 0;

  const getConicGradient = () => {
    if (!carStats || totalCars === 0) {
      return "conic-gradient(#e5e7eb 0% 100%)";
    }
    const publishedEnd = (carStats.published / totalCars) * 100;
    const verifiedEnd = publishedEnd + (carStats.verified / totalCars) * 100;
    const soldEnd = verifiedEnd + (carStats.sold / totalCars) * 100;

    return `conic-gradient(
      #1851b4 0% ${publishedEnd}%,
      #2f71e3 ${publishedEnd}% ${verifiedEnd}%,
      #93c5fd ${verifiedEnd}% ${soldEnd}%,
      #bfdbfe ${soldEnd}% 100%
    )`;
  };

  if (isLoading) {
    return <DonutSkeleton className="flex-[1]" />;
  }

  return (
    <div className="bg-white flex-[1] rounded-[24px] p-[24px] shadow-sm border border-gray-50 flex flex-col gap-[24px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <div className="relative shrink-0 size-[24px]">
            <img src="/assets/dashboard/charts/chart-2.svg" alt="" className="absolute inset-0 w-full h-full" />
          </div>
          <h3 className="text-[18px] text-[#002ec1] font-semibold">إحصائيات السيارات</h3>
        </div>

        {/* Individual Time Filter */}
        <TimeFilterButtons period={period} onPeriodChange={onPeriodChange} />
      </div>

      {/* Content Area */}
      <div className="flex flex-row items-center justify-between flex-1 mt-[16px]" dir="rtl">
        
        {/* Donut Chart (Right Side in RTL) */}
        <div className="relative w-[190px] h-[190px] flex items-center justify-center shrink-0">
          {/* Background ring */}
          <div className="absolute inset-0 rounded-full border-[18px] border-gray-50" />
          
          {/* Donut Slices - CSS Gradient */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              background: getConicGradient(),
              borderRadius: "50%",
              maskImage: "radial-gradient(transparent 58%, black 60%)",
              WebkitMaskImage: "radial-gradient(transparent 58%, black 60%)"
            }}
          />

          {/* Center Icon */}
          <div className="bg-gray-50 w-[64px] h-[62px] rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
            <img src="/assets/dashboard/charts/car.svg" alt="Car" width={24} height={24} />
            <div className="bg-white rounded-md shadow-md border border-gray-100 p-1 absolute -top-4 right-[10%] text-[10px] whitespace-nowrap">
              <span className="text-gray-400">مجموع</span> <br/>
              <span className="text-[#111] font-bold text-center block">{totalCars.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Legend (Left Side in RTL) */}
        <div className="flex flex-col gap-[20px] items-end justify-center flex-1">
          <div className="flex items-center gap-[12px]">
            <p className="text-[14px] whitespace-nowrap">
              <span className="text-[#8A8DA7] ml-2">سيارة معروضة</span>
              <span className="text-[#111] font-medium">({carStats?.published?.toLocaleString() ?? "0"})</span>
            </p>
            <div className="w-[10px] h-[10px] bg-[#1851b4] rounded-full ring-4 ring-[#ebf1ff]" />
          </div>

          <div className="flex items-center gap-[12px]">
            <p className="text-[14px] whitespace-nowrap">
              <span className="text-[#8A8DA7] ml-2">سيارة معتمدة</span>
              <span className="text-[#111] font-medium">({carStats?.verified?.toLocaleString() ?? "0"})</span>
            </p>
            <div className="w-[10px] h-[10px] bg-[#2f71e3] rounded-full ring-4 ring-[#ebf1ff]" />
          </div>

          <div className="flex items-center gap-[12px]">
            <p className="text-[14px] whitespace-nowrap">
              <span className="text-[#8A8DA7] ml-2">نشاط بيع</span>
              <span className="text-[#111] font-medium">({carStats?.sold?.toLocaleString() ?? "0"})</span>
            </p>
            <div className="w-[10px] h-[10px] bg-[#93c5fd] rounded-full ring-4 ring-[#ebf1ff]" />
          </div>

          <div className="flex items-center gap-[12px]">
            <p className="text-[14px] whitespace-nowrap">
              <span className="text-[#8A8DA7] ml-2">نشاط شراء</span>
              <span className="text-[#111] font-medium">({carStats?.bought?.toLocaleString() ?? "0"})</span>
            </p>
            <div className="w-[10px] h-[10px] bg-[#bfdbfe] rounded-full ring-4 ring-[#ebf1ff]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main ChartsSection Component
export default function ChartsSection() {
  // Individual period states for each chart
  const [inspectionPeriod, setInspectionPeriod] = useState<TimePeriod>('month');
  const [carStatsPeriod, setCarStatsPeriod] = useState<TimePeriod>('month');
  const [newUsersPeriod, setNewUsersPeriod] = useState<TimePeriod>('month');
  const [totalUsersPeriod, setTotalUsersPeriod] = useState<TimePeriod>('month');

  // Fetch data for each period independently
  const { 
    data: inspectionData, 
    isLoading: inspectionLoading, 
    error: inspectionError 
  } = useDashboardStats(inspectionPeriod);
  
  const { 
    data: newUsersData, 
    isLoading: newUsersLoading, 
    error: newUsersError 
  } = useDashboardStats(newUsersPeriod);
  
  const { 
    data: totalUsersData, 
    isLoading: totalUsersLoading, 
    error: totalUsersError 
  } = useDashboardStats(totalUsersPeriod);
  
  const { 
    data: carStatsData, 
    isLoading: carStatsLoading, 
    error: carStatsError 
  } = useDashboardStats(carStatsPeriod);

  // Show error toast on any failure
  React.useEffect(() => {
    const errors = [inspectionError, newUsersError, totalUsersError, carStatsError].filter(Boolean);
    if (errors.length > 0) {
      toast.error('فشل تحميل الإحصائيات');
    }
  }, [inspectionError, newUsersError, totalUsersError, carStatsError]);

  return (
    <>
      {/* Row 1: Inspection Requests + Car Stats */}
      <div className="flex flex-col lg:flex-row gap-[24px] w-full mt-[24px]" dir="rtl">
        <LineChartComponent
          title="طلبات الفحص"
          iconSrc="/assets/dashboard/charts/scanner.svg"
          data={inspectionData?.inspectionRequestsTimeline || []}
          period={inspectionPeriod}
          onPeriodChange={setInspectionPeriod}
          isLoading={inspectionLoading}
        />
        <DonutChartCard
          carStats={carStatsData?.carStatistics}
          period={carStatsPeriod}
          onPeriodChange={setCarStatsPeriod}
          isLoading={carStatsLoading}
        />
      </div>

      {/* Row 2: User Charts */}
      <div className="flex flex-col lg:flex-row gap-[24px] w-full mt-[24px]" dir="rtl">
        <LineChartComponent
          title="المستخدمين الجدد"
          iconSrc="/assets/dashboard/charts/scanner.svg"
          data={newUsersData?.newUsersTimeline || []}
          period={newUsersPeriod}
          onPeriodChange={setNewUsersPeriod}
          isLoading={newUsersLoading}
        />
        <LineChartComponent
          title="إجمالي المستخدمين"
          iconSrc="/assets/dashboard/charts/scanner.svg"
          data={totalUsersData?.cumulativeUsersTimeline || []}
          period={totalUsersPeriod}
          onPeriodChange={setTotalUsersPeriod}
          isLoading={totalUsersLoading}
        />
      </div>
    </>
  );
}