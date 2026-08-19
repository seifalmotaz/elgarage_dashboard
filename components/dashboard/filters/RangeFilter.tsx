import { cn } from "@/lib/utils";

interface RangeFilterProps {
  label: string;
  minValue: string | number;
  maxValue: string | number;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  placeholderMin?: string;
  placeholderMax?: string;
  unit?: string;
  width?: string;
}

export function RangeFilter({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholderMin = "الحد الأدنى",
  placeholderMax = "الحد الأقصى",
  unit,
  width = "w-full",
}: RangeFilterProps) {
  return (
    <div className={cn("flex flex-col gap-[8px]", width)}>
      <label className="text-[14px] text-[#1a1a1a] font-medium text-right">
        {label}
      </label>
      <div className="flex items-center gap-[12px]">
        <div className="flex-1 relative">
          <input
            type="number"
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder={placeholderMin}
            className="w-full bg-white border border-[#f2f2f2] rounded-[16px] h-[50px] px-[16px] pr-[40px] text-[14px] text-[#1a1a1a] font-light outline-none placeholder-[#D1D5DB]"
          />
          {unit && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF]">
              {unit}
            </span>
          )}
        </div>
        <span className="text-[#9CA3AF] text-[14px] shrink-0">—</span>
        <div className="flex-1 relative">
          <input
            type="number"
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder={placeholderMax}
            className="w-full bg-white border border-[#f2f2f2] rounded-[16px] h-[50px] px-[16px] pr-[40px] text-[14px] text-[#1a1a1a] font-light outline-none placeholder-[#D1D5DB]"
          />
          {unit && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF]">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}