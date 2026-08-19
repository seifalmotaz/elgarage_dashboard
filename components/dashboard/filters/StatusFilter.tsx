import { cn } from "@/lib/utils";
import Select from "@/components/ui/Select";

interface SelectOption {
  label: string;
  value: string;
}

interface StatusFilterProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
  width?: string;
  placeholder?: string;
  error?: boolean;
}

export function StatusFilter({
  value,
  options,
  onChange,
  label = "الحالة",
  width = "w-[250px]",
  placeholder = "اختر الحالة",
  error
}: StatusFilterProps) {
  return (
    <div className={cn("flex flex-col gap-[4px] shrink-0", width)}>
      <label className="text-[14px] text-[#1a1a1a] font-normal text-right w-full">
        {label}
      </label>
      <Select
        value={value}
        options={options}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
      />
    </div>
  );
}