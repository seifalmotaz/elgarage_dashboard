import { cn } from "@/lib/utils";

interface FilterGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterGroup({ children, className }: FilterGroupProps) {
  return (
    <div className={cn("flex items-start gap-[12px] lg:gap-[24px] w-full", className)}>
      {children}
    </div>
  );
}