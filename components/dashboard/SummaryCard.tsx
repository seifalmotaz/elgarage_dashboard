interface SummaryCardProps {
  title: string;
  value: string | number;
  iconSrc: string;
  currency?: string;
  trendText?: string;
  trendValue?: string;
  isPositive?: boolean;
  isLoading?: boolean;
}

export default function SummaryCard({
  title,
  value,
  iconSrc,
  currency,
  trendText,
  trendValue,
  isPositive = true,
  isLoading = false,
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white flex-1 min-w-[230px] rounded-[24px] p-5 flex flex-col gap-[16px] border border-gray-50 relative overflow-hidden animate-pulse">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[4px] items-start flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mt-2"></div>
          </div>
          <div className="bg-gray-200 w-[44px] h-[44px] rounded-full"></div>
        </div>
        <div className="flex justify-start w-full px-1">
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 min-w-[230px] rounded-[24px] p-5 flex flex-col gap-[16px] border border-gray-50 relative overflow-hidden group hover:shadow-md transition-all duration-300">

      {/* Top Header Section */}
      <div className="flex items-start justify-between w-full">
        {/* First Child -> RIGHT in RTL */}
        <div className="flex flex-col gap-[4px] items-start flex-1">
          <p className="text-[14px] text-[#8286AB] font-light whitespace-nowrap text-start">
            {title}
          </p>
          <div className="flex items-center gap-[4px] justify-start">
            <h3 className="text-[32px] text-[#111111] font-bold leading-none text-start">
              {value}
            </h3>
            {currency && (
              <span className="text-[18px] font-normal text-[#111111] mt-2">
                {currency}
              </span>
            )}
          </div>
        </div>

        {/* Second Child -> LEFT in RTL */}
        <div className="bg-[#f8fafc] w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0">
          <img src={iconSrc} alt={title} width={20} height={20} className="object-contain" />
        </div>
      </div>

      {/* Bottom Status Section - Aligned to RIGHT in RTL */}
      {trendValue && (
        <div className="flex justify-start w-full px-1">
          <div className={`flex items-center px-[8px] py-[4px] rounded-full gap-[4px] ${isPositive ? 'bg-[#F0FDF4]' : 'bg-red-50'}`}>
            <img src="/assets/dashboard/cards/trend-up.svg" alt="Trend" width={10} height={6} className="shrink-0" />
            <div className="flex items-center gap-[2px]">
              <span className={`text-[12px] font-normal ${isPositive ? 'text-[#16A34A]' : 'text-red-600'} leading-none`}>
                {trendValue}
              </span>
              {trendText && (
                <span className={`text-[10px] font-light ${isPositive ? 'text-[#16A34A]' : 'text-red-600'} leading-[1.5] mt-[1px]`}>
                  {trendText}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

