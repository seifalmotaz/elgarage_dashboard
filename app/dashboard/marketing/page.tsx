"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import BannerCard from "@/components/dashboard/BannerCard";
import { useBanners } from "@/hooks/queries/useBanners";
import { useToggleBannerStatusMutation, useDeleteBannerMutation } from "@/hooks/mutations/useBanners";
import { Pagination } from "@/components/common/Pagination";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { TabToggle } from "@/components/dashboard/common/TabToggle";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import { EmptyState } from "@/components/dashboard/states/EmptyState";
import {
  BANNER_LOCATION_LABEL,
  bannerPreviewUrl,
  listPreviewAspect,
  parseLocation,
  parseType,
  type BannerLocation,
} from "@/lib/banner-specs";

export default function MarketingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BannerLocation>("HOME");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const tabs = [
    { id: "HOME", label: BANNER_LOCATION_LABEL.HOME, icon: "/assets/dashboard/marketing.svg" },
    { id: "BROWSE", label: BANNER_LOCATION_LABEL.BROWSE, icon: "/assets/dashboard/support.svg" },
    { id: "FEATURED", label: BANNER_LOCATION_LABEL.FEATURED, icon: "/assets/dashboard/cars.svg" },
    { id: "SELL", label: BANNER_LOCATION_LABEL.SELL, icon: "/assets/dashboard/sales-requests.svg" },
  ];

  // Sell Your Car is primarily an app surface; default create type to APP there.
  const createType = activeTab === "SELL" ? "APP" : "WEBSITE";
  const createHref = `/dashboard/marketing/create?location=${activeTab}&type=${createType}`;

  const { data: bannersData, isLoading, error } = useBanners({ location: activeTab, page, limit });
  const toggleMutation = useToggleBannerStatusMutation();
  const deleteMutation = useDeleteBannerMutation();

  const handleToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    toggleMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا البانر؟")) {
      deleteMutation.mutate(id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="البانرات و الاعلانات"
          action={
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(createHref)}
              icon={<img src="/assets/dashboard/add.svg" alt="Add" width={20} height={20} />}
              iconPosition="left"
            >
              اضافة بانر جديد
            </Button>
          }
        />
        <TabToggle
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(parseLocation(id));
            setPage(1);
          }}
        />
        <LoadingState type="card" count={4} />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="البانرات و الاعلانات"
          action={
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(createHref)}
              icon={<img src="/assets/dashboard/add.svg" alt="Add" width={20} height={20} />}
              iconPosition="left"
            >
              اضافة بانر جديد
            </Button>
          }
        />
        <TabToggle
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => {
            setActiveTab(parseLocation(id));
            setPage(1);
          }}
        />
        <ErrorState onRetry={() => window.location.reload()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="البانرات و الاعلانات"
        action={
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(createHref)}
            icon={<img src="/assets/dashboard/add.svg" alt="Add" width={20} height={20} />}
            iconPosition="left"
          >
            اضافة بانر جديد
          </Button>
        }
      />

      <TabToggle
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(parseLocation(id));
          setPage(1);
        }}
      />

      <ContentCard className="min-h-[600px]">
        {bannersData?.data?.length === 0 ? (
          <EmptyState
            title="لا توجد بانرات"
            description="اضغط على 'اضافة بانر جديد' لإنشاء بانر"
            action={
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(createHref)}
                icon={<img src="/assets/dashboard/add.svg" alt="Add" width={16} height={16} />}
                iconPosition="left"
              >
                اضافة بانر جديد
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bannersData?.data?.map((banner) => {
                const startDate = banner.startDate
                  ? new Date(banner.startDate).toLocaleDateString("ar-EG")
                  : "";
                const endDate = banner.endDate
                  ? new Date(banner.endDate).toLocaleDateString("ar-EG")
                  : "";
                const dateRange =
                  startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || "بدون تاريخ";

                return (
                  <BannerCard
                    key={banner.id}
                    id={banner.id}
                    image={bannerPreviewUrl(banner) || "/assets/dashboard/banner-sample.png"}
                    aspectClass={listPreviewAspect(parseType(banner.type))}
                    title={`${banner.title}${banner.type === "APP" ? " · التطبيق" : " · الموقع"}`}
                    subtitle={banner.subtitle}
                    dateRange={dateRange}
                    link={banner.link || "بدون رابط"}
                    isActive={banner.status === "ACTIVE"}
                    onToggle={() => handleToggle(banner.id, banner.status)}
                    onDelete={() => handleDelete(banner.id)}
                    onEdit={() => router.push(`/dashboard/marketing/edit/${banner.id}`)}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {bannersData && bannersData.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={bannersData.totalPages}
                totalItems={bannersData.total}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </ContentCard>
    </PageContainer>
  );
}