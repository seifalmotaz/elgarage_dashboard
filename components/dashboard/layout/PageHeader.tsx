import Link from "next/link";
import type { ReactNode } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({
  title,
  action,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-[14px]">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-[#8286ab] font-light"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-[#111] font-semibold">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <img
                  src="/assets/dashboard/cars/car-arrow-left.svg"
                  alt="arrow"
                  width={10}
                  height={10}
                  className="opacity-40"
                />
              )}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] lg:text-[32px] font-semibold text-[#111]">
          {title}
        </h1>
        {action}
      </div>
    </div>
  );
}