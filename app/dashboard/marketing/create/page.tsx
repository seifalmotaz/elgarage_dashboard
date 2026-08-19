"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateBannerMutation } from "@/hooks/mutations/useBanners";
import BannerForm from "@/components/dashboard/BannerForm";
import { parseLocation, parseType } from "@/lib/banner-specs";

function CreateBannerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMutation = useCreateBannerMutation();
  const initialLocation = parseLocation(searchParams.get("location"));
  const initialType = parseType(searchParams.get("type"));

  return (
    <BannerForm
      key={`${initialLocation}-${initialType}`}
      mode="create"
      initialValues={{ location: initialLocation, type: initialType }}
      submitting={createMutation.isPending}
      onSubmit={(payload) => {
        createMutation.mutate(payload, {
          onSuccess: () => {
            router.push("/dashboard/marketing");
          },
        });
      }}
      onCancel={() => router.back()}
    />
  );
}

export default function CreateBannerPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[400px] bg-white rounded-[16px] animate-pulse" />
      }
    >
      <CreateBannerForm />
    </Suspense>
  );
}
