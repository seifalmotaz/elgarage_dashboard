import { cn } from "@/lib/utils";

interface FilterSectionProps {
  label: string;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function FilterSection({ label, children, width = "w-[250px]", className }: FilterSectionProps) {
  return (
    <div className={cn("flex flex-col gap-[4px] shrink-0", width, className)}>
      <label className="text-[14px] text-[#1a1a1a] font-normal text-right w-full">
        {label}
      </label>
      {children}
    </div>
  );
}