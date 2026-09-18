import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  titleCount?: number;
  filters?: ReactNode;
}

export function ContentCard({
  children,
  className,
  title,
  titleCount,
  filters,
}: ContentCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[24px] p-[24px] border border-gray-100 flex flex-col gap-[32px]",
        className
      )}
    >
      {(title || filters) && (
        <div className="flex flex-col gap-[24px]">
          {title && (
            <div className="text-right">
              {typeof title === "string" ? (
                <>
                  <span className="text-[16px] text-[#002ec1] font-semibold">
                    {title}{" "}
                  </span>
                  {titleCount !== undefined && (
                    <span className="text-[16px] text-[#111] font-normal">
                      ({titleCount})
                    </span>
                  )}
                </>
              ) : (
                title
              )}
            </div>
          )}
          {filters}
        </div>
      )}
      {children}
    </div>
  );
}