import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 pb-10 w-full max-w-[1200px] mx-auto",
        className
      )}
      dir="rtl"
    >
      {children}
    </div>
  );
}