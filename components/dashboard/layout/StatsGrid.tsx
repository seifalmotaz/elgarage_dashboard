import { cn } from "@/lib/utils";

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const colClasses = {
    2: "grid grid-cols-1 md:grid-cols-2 gap-6",
    3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  };

  return (
    <div className={cn(colClasses[columns], className)}>
      {children}
    </div>
  );
}