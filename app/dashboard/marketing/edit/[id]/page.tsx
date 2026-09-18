"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBanner } from "@/hooks/queries/useBanners";
import { useUpdateBannerMutation } from "@/hooks/mutations/useBanners";
import BannerForm from "@/components/dashboard/BannerForm";
import { parseLocation, parseType } from "@/lib/banner-specs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBannerPage({ params }: PageProps) {
  const router = useRouter();
  const updateMutation = useUpdateBannerMutation();
  const [id, setId] = useState("");

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  const { data: bannerData, isLoading } = useBanner(id);

  if (isLoading || !bannerData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-11 w-24 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[16px] h-[400px] animate-pulse" />
          <div className="lg:col-span-2 bg-white p-6 rounded-[16px] h-[500px] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <BannerForm
      mode="edit"
      initialValues={{
        title: bannerData.title,
        subtitle: bannerData.subtitle || "",
        image: bannerData.image || "",
        imageMobile: bannerData.imageMobile || "",
        imageDesktop: bannerData.imageDesktop || "",
        link: bannerData.link || "",
        location: parseLocation(bannerData.location),
        type: parseType(bannerData.type),
        startDate: bannerData.startDate?.split("T")[0] || "",
        endDate: bannerData.endDate?.split("T")[0] || "",
        status: bannerData.status,
        order: bannerData.order?.toString() || "",
      }}
      submitting={updateMutation.isPending}
      onSubmit={(payload) => {
        updateMutation.mutate(
          { id, data: payload },
          {
            onSuccess: () => {
              router.push("/dashboard/marketing");
            },
          },
        );
      }}
      onCancel={() => router.back()}
    />
  );
}
