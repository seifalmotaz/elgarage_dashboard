"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InspectionSetupRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/sales-requests");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20" dir="rtl">
      <div className="text-[14px] text-[#6b7280]">جاري التوجيه...</div>
    </div>
  );
}