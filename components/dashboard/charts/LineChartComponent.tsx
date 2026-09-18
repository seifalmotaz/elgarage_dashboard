"use client";

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { TimePeriod } from '@/hooks/queries/useStatistics';

interface LineChartComponentProps {
  title: string;
  iconSrc: string;
  data: { label: string; count: number }[];
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  isLoading?: boolean;
  className?: string;
}

// Period labels for filter buttons
const PERIOD_LABELS: Record<TimePeriod, string> = {
  day: 'يوم',
  week: 'أسبوع',
  month: 'شهر',
  year: 'سنة',
};

// Skeleton for loading state
function ChartSkeleton({ className }: { className?: string }) {
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
      <div className="flex-1 min-h-[240px] bg-gray-50 rounded-lg" />
    </div>
  );
}

export function LineChartComponent({
  title,
  iconSrc,
  data,
  period,
  onPeriodChange,
  isLoading,
  className,
}: LineChartComponentProps) {
  // Calculate dynamic Y-axis domain
  const maxCount = data && data.length > 0
    ? Math.max(...data.map(d => d.count), 1)
    : 50000;

  // Round up to nice number
  const yMax = Math.ceil(maxCount / 10000) * 10000 || 50000;

  // Generate 7 Y-axis tick values (matching mock design)
  const yAxisTicks = Array.from({ length: 7 }, (_, i) =>
    Math.round(yMax - (yMax / 6) * i)
  );

  if (isLoading) {
    return <ChartSkeleton className={cn("flex-[1.1]", className)} />;
  }

  return (
    <div className={cn(
      "bg-white flex-[1.1] rounded-[24px] p-[24px] shadow-sm border border-gray-50 flex flex-col gap-[24px]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <div className="relative shrink-0 size-[24px]">
            <img src={iconSrc} alt={title} className="absolute inset-0 w-full h-full" />
          </div>
          <h3 className="text-[18px] text-[#002ec1] font-semibold">{title}</h3>
        </div>

        {/* Individual Time Filter Buttons */}
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
      </div>

      {/* Chart Area - LTR for proper axis rendering */}
      <div className="flex-1 min-h-[240px]" dir="ltr">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 45, bottom: 30 }}
            >
              {/* Gradient definition - matching mock's blue gradient */}
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#002ec1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#002ec1" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Dashed horizontal grid lines - like mock */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
                horizontal={true}
              />

              {/* X-axis with period labels */}
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8A8DA7', fontSize: 10, fontWeight: 300 }}
                interval="preserveStartEnd"
                tickMargin={10}
              />

              {/* Y-axis with dynamic labels */}
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8A8DA7', fontSize: 10, fontWeight: 300 }}
                ticks={yAxisTicks}
                tickFormatter={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : value}
                domain={[0, yMax]}
              />

              {/* Area with gradient fill - matches mock visual */}
              <Area
                type="monotone"
                dataKey="count"
                stroke="#002ec1"
                strokeWidth={2}
                fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                dot={false}
                activeDot={{ r: 4, fill: '#002ec1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-[#8A8DA7] text-[14px] font-light">
            لا توجد بيانات
          </div>
        )}
      </div>
    </div>
  );
}