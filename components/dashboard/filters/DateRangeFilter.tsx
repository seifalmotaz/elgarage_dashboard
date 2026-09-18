import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  label?: string;
  width?: string;
  onClear?: () => void;
}

export function DateRangeFilter({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  label = "التاريخ",
  width = "w-[200px]",
  onClear,
}: DateRangeFilterProps) {
  const hasValue = fromDate || toDate;

  return (
    <div className={cn("flex flex-col gap-[4px] shrink-0", width)}>
      <div className="flex items-center justify-between">
        <label className="text-[14px] text-[#1a1a1a] font-normal">
          {label}
        </label>
        {hasValue && onClear && (
          <button
            onClick={onClear}
            className="text-[12px] text-[#002ec1] hover:text-[#001a8f] transition-colors"
          >
            مسح
          </button>
        )}
      </div>
      <div className="flex items-center gap-[8px]">
        <div className="flex flex-col gap-[4px] flex-1">
          <span className="text-[12px] text-[#6B7280]">من</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="bg-white border border-[#f2f2f2] rounded-full h-[48px] px-[16px] text-[14px] text-[#1A1A1A] font-light outline-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-[4px] flex-1">
          <span className="text-[12px] text-[#6B7280]">إلى</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="bg-white border border-[#f2f2f2] rounded-full h-[48px] px-[16px] text-[14px] text-[#1A1A1A] font-light outline-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}