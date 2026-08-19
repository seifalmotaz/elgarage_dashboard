"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import FAQCard from "@/components/dashboard/FAQCard";
import { useFAQs } from "@/hooks/queries/useFAQ";
import { useDeleteFAQMutation } from "@/hooks/mutations/useFAQ";
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

export default function FAQPage() {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: faqsData, isLoading, error, refetch } = useFAQs(
    category === "all" ? undefined : category,
    debouncedSearch || undefined,
    page,
    limit
  );
  const deleteMutation = useDeleteFAQMutation();

  // Extract unique categories from FAQs
  const categories = useMemo(() => {
    if (!faqsData?.data) return [];
    const cats = [...new Set(faqsData.data.map((faq) => faq.category))];
    return [
      { label: "الكل", value: "all" },
      ...cats.map((cat) => ({ label: cat, value: cat })),
    ];
  }, [faqsData]);

  // Sort FAQs (server-side filtering is now used)
  const sortedFAQs = useMemo(() => {
    if (!faqsData?.data) return [];

    const faqs = [...faqsData.data];

    if (sortBy === "latest") {
      faqs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      faqs.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return faqs;
  }, [faqsData, sortBy]);

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/faq/edit/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="الاسئلة الشائعة"
          action={
            <Button
              variant="primary"
              size="md"
              className="rounded-full px-8 h-[44px]"
              onClick={() => router.push("/dashboard/faq/create")}
              icon={
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
              اضافة سؤال
            </Button>
          }
        />
        <LoadingState type="card" count={3} />
      </PageContainer>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <PageContainer>
        <PageHeader title="الاسئلة الشائعة" />
        <ErrorState onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="الاسئلة الشائعة"
        action={
          <Button
            variant="primary"
            size="md"
            className="rounded-full px-8 h-[44px]"
            onClick={() => router.push("/dashboard/faq/create")}
            icon={
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
            اضافة سؤال
          </Button>
        }
      />

      <ContentCard
        title="الاسئلة"
        titleCount={sortedFAQs.length}
        filters={
          <FilterGroup>
            <StatusFilter
              label="التصنيف"
              value={category}
              options={categories}
              onChange={setCategory}
              width="w-auto"
            />
            <StatusFilter
              label="ترتيب حسب"
              value={sortBy}
              options={[
                { label: "الاحدث", value: "latest" },
                { label: "الاقدم", value: "oldest" },
              ]}
              onChange={setSortBy}
              width="w-auto"
            />
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </FilterGroup>
        }
      >
        {sortedFAQs.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sortedFAQs.map((faq) => (
              <FAQCard
                key={faq.id}
                id={faq.id}
                question={faq.question}
                answer={faq.answer}
                category={faq.category}
                onDelete={() => handleDelete(faq.id)}
                onEdit={() => handleEdit(faq.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد اسئلة" />
        )}

        {/* Pagination */}
        {faqsData && faqsData.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={faqsData.totalPages}
            totalItems={faqsData.total}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </ContentCard>
    </PageContainer>
  );
}