"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import TestimonialCard from "@/components/dashboard/TestimonialCard";
import { useTestimonials } from "@/hooks/queries/useTestimonials";
import {
  useDeleteTestimonialMutation,
  useToggleTestimonialMutation,
} from "@/hooks/mutations/useTestimonials";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/common/Pagination";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";
import { EmptyState } from "@/components/dashboard/states/EmptyState";
import { FilterGroup } from "@/components/dashboard/filters/FilterGroup";
import { StatusFilter } from "@/components/dashboard/filters/StatusFilter";
import { SearchBar } from "@/components/dashboard/filters/SearchBar";

export default function TestimonialsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const isActiveFilter =
    statusFilter === "active"
      ? true
      : statusFilter === "inactive"
        ? false
        : undefined;

  const { data, isLoading, error, refetch } = useTestimonials({
    search: debouncedSearch || undefined,
    isActive: isActiveFilter,
    page,
    limit,
  });

  const deleteMutation = useDeleteTestimonialMutation();
  const toggleMutation = useToggleTestimonialMutation();

  const items = data?.data ?? [];

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="آراء العملاء"
          action={
            <Button
              variant="primary"
              size="md"
              className="rounded-full px-8 h-[44px]"
              onClick={() => router.push("/dashboard/testimonials/create")}
              icon={
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/assets/dashboard/add.svg"
                  alt="Add"
                  width={20}
                  height={20}
                  className="brightness-0 invert"
                />
              }
              iconPosition="left"
            >
              اضافة رأي
            </Button>
          }
        />
        <LoadingState type="card" count={3} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="آراء العملاء" />
        <ErrorState onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="آراء العملاء"
        action={
          <Button
            variant="primary"
            size="md"
            className="rounded-full px-8 h-[44px]"
            onClick={() => router.push("/dashboard/testimonials/create")}
            icon={
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/assets/dashboard/add.svg"
                alt="Add"
                width={20}
                height={20}
                className="brightness-0 invert"
              />
            }
            iconPosition="left"
          >
            اضافة رأي
          </Button>
        }
      />

      <ContentCard
        title="الآراء"
        titleCount={data?.total ?? items.length}
        filters={
          <FilterGroup>
            <StatusFilter
              label="الحالة"
              value={statusFilter}
              options={[
                { label: "الكل", value: "all" },
                { label: "نشط", value: "active" },
                { label: "غير نشط", value: "inactive" },
              ]}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              width="w-auto"
            />
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </FilterGroup>
        }
      >
        {items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <TestimonialCard
                key={item.id}
                id={item.id}
                name={item.name}
                carInfo={item.carInfo}
                comment={item.comment}
                avatar={item.avatar}
                rating={item.rating}
                order={item.order}
                isActive={item.isActive}
                onEdit={() =>
                  router.push(`/dashboard/testimonials/edit/${item.id}`)
                }
                onDelete={() => {
                  if (confirm("هل أنت متأكد من حذف هذا الرأي؟")) {
                    deleteMutation.mutate(item.id);
                  }
                }}
                onToggle={() =>
                  toggleMutation.mutate({
                    id: item.id,
                    isActive: !item.isActive,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد آراء" />
        )}

        {data && data.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            totalItems={data.total}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </ContentCard>
    </PageContainer>
  );
}
