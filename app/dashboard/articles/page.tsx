"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ArticleCard from "@/components/dashboard/ArticleCard";
import { useArticles } from "@/hooks/queries/useArticles";
import { useDeleteArticleMutation } from "@/hooks/mutations/useArticles";
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
import { DateRangeFilter } from "@/components/dashboard/filters/DateRangeFilter";

export default function ArticlesPage() {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Advanced filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: articlesData, isLoading, error, refetch } = useArticles({
    category: category === "all" ? undefined : category,
    status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as "DRAFT" | "PUBLISHED"),
    search: debouncedSearch || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit,
  });
  const deleteMutation = useDeleteArticleMutation();

  // Check if any advanced filter is active
  const hasAdvancedFilters = fromDate || toDate;

  // Reset advanced filters
  const handleResetAdvancedFilters = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  // Filter and sort
  const filteredArticles = useMemo(() => {
    if (!articlesData?.data) return [];

    let articles = [...articlesData.data];

    // Sort
    if (sortBy === "latest") {
      articles.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      articles.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return articles;
  }, [articlesData, sortBy]);

  // Categories from articles or predefined
  const categories = [
    { label: "الكل", value: "all" },
    { label: "أخبار", value: "أخبار" },
    { label: "نصائح", value: "نصائح" },
  ];

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="المقالات"
          action={
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/dashboard/articles/create")}
              icon={
                <img
                  src="/assets/dashboard/add.svg"
                  alt="Add"
                  width={20}
                  height={20}
                />
              }
              iconPosition="left"
            >
              اضافة مقال
            </Button>
          }
        />
        <LoadingState type="card" count={6} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="المقالات"
          action={
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/dashboard/articles/create")}
              icon={
                <img
                  src="/assets/dashboard/add.svg"
                  alt="Add"
                  width={20}
                  height={20}
                />
              }
              iconPosition="left"
            >
              اضافة مقال
            </Button>
          }
        />
        <ErrorState message={error instanceof Error ? error.message : "حدث خطأ أثناء تحميل البيانات"} onRetry={() => refetch()} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="المقالات"
        action={
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/dashboard/articles/create")}
            icon={
              <img
                src="/assets/dashboard/add.svg"
                alt="Add"
                width={20}
                height={20}
              />
            }
            iconPosition="left"
          >
            اضافة مقال
          </Button>
        }
      />

      <ContentCard
        title="المقالات الحالية"
        titleCount={filteredArticles.length}
        filters={
          <div className="flex flex-col gap-4">
            <FilterGroup>
              <StatusFilter
                label="التصنيف"
                value={category}
                options={categories}
                onChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
                width="w-auto"
              />
              <StatusFilter
                label="الحالة"
                value={statusFilter}
                options={[
                  { label: "الكل", value: "all" },
                  { label: "منشور", value: "PUBLISHED" },
                  { label: "مسودة", value: "DRAFT" },
                ]}
                onChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
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
                showButton
                buttonText="بحث"
              />
            </FilterGroup>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-[14px] text-[#002ec1] hover:text-[#001a8f] transition-colors self-start"
            >
              <span>فلاتر متقدمة</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {hasAdvancedFilters && (
                <span className="bg-[#002ec1] text-white text-[10px] px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
            </button>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="bg-[#fafafa] rounded-[16px] p-6 border border-[#f2f2f2]">
                <DateRangeFilter
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromChange={(val) => {
                    setFromDate(val);
                    setPage(1);
                  }}
                  onToChange={(val) => {
                    setToDate(val);
                    setPage(1);
                  }}
                  label="تاريخ النشر"
                  onClear={() => {
                    setFromDate("");
                    setToDate("");
                    setPage(1);
                  }}
                  width="w-full"
                />
                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAdvancedFilters}
                  >
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            )}
          </div>
        }
      >
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                image={article.image || "/assets/dashboard/article-thumb.png"}
                date={new Date(article.createdAt).toLocaleDateString("ar-EG")}
                title={article.title}
                description={article.description}
                category={article.category}
                status={article.status}
                viewCount={article.viewCount}
                onDelete={() => handleDelete(article.id)}
                onEdit={() =>
                  router.push(`/dashboard/articles/edit/${article.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد مقالات"
            description="اضغط على 'اضافة مقال' لإنشاء مقال جديد"
          />
        )}

        {articlesData && articlesData.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={articlesData.totalPages}
            totalItems={articlesData.total}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </ContentCard>
    </PageContainer>
  );
}