"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SummaryCard from "@/components/dashboard/SummaryCard";
import Table, { ColumnDef } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import EditUserModal from "@/components/dashboard/EditUserModal";
import CreateUserModal from "@/components/dashboard/CreateUserModal";
import { PageContainer } from "@/components/dashboard/layout/PageContainer";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatsGrid } from "@/components/dashboard/layout/StatsGrid";
import { ContentCard } from "@/components/dashboard/layout/ContentCard";
import { FilterGroup } from "@/components/dashboard/filters/FilterGroup";
import { SearchBar } from "@/components/dashboard/filters/SearchBar";
import { StatusFilter } from "@/components/dashboard/filters/StatusFilter";
import { DateRangeFilter } from "@/components/dashboard/filters/DateRangeFilter";
import { ActionsDropdown } from "@/components/dashboard/users/ActionsDropdown";
import { useUsers, useUserStats } from "@/hooks/queries/useUsers";
import { useUpdateUserMutation, useActivateUserMutation, useDeactivateUserMutation } from "@/hooks/mutations/useUsers";
import {
  UserListItem,
  UserFilters,
  USER_STATUS_MAP,
  USER_ROLE_MAP,
  USER_STATUS_FILTER_OPTIONS,
} from "@/lib/api/users";
import { formatDate } from "@/lib/utils/date";

// Format short ID (first 8 characters)
const formatShortId = (id: string): string => id.substring(0, 8);

// Get user display name
const getUserDisplayName = (user: UserListItem): string => {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.phone;
};

export default function UsersPage() {
  const router = useRouter();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Advanced filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build API filters - memoized to prevent unnecessary re-renders
  const buildFilters = useCallback((): UserFilters => {
    const filters: UserFilters = {
      page: currentPage,
      limit: 8,
    };

    // Status filter mapping
    if (statusFilter === "active") {
      filters.isActive = true;
    } else if (statusFilter === "inactive") {
      filters.isActive = false;
    }

    // Search by phone
    if (debouncedSearch) {
      filters.phone = debouncedSearch;
    }

    // Advanced filters
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    if (roleFilter) filters.role = roleFilter as UserFilters['role'];

    return filters;
  }, [currentPage, statusFilter, debouncedSearch, fromDate, toDate, roleFilter]);

  // Fetch users and stats
  const { data, isLoading, isError, error } = useUsers(buildFilters());
  const { data: statsData } = useUserStats();
  const updateUserMutation = useUpdateUserMutation();
  const activateUserMutation = useActivateUserMutation();
  const deactivateUserMutation = useDeactivateUserMutation();

  // Stats values
  const stats = statsData;
  const totalUsers = stats?.totalUsers ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  const inactiveUsers = totalUsers - activeUsers;

  // Handlers
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleViewDetails = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleEdit = (user: UserListItem) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleModalSuccess = () => {
    // React Query automatically refetches when mutations invalidate queries
    handleModalClose();
  };

  const handleCreateModalOpen = () => {
    setCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
  };

  const handleCreateModalSuccess = () => {
    setCreateModalOpen(false);
    // React Query automatically refetches when mutations invalidate queries
  };

  // Reset advanced filters
  const handleResetAdvancedFilters = () => {
    setFromDate("");
    setToDate("");
    setRoleFilter("");
    setCurrentPage(1);
  };

  // Check if any advanced filter is active
  const hasAdvancedFilters = fromDate || toDate || roleFilter;

  // Role filter options
  const roleFilterOptions = [
    { label: "الكل", value: "" },
    { label: "مدير", value: "ADMIN" },
    { label: "مستخدم", value: "USER" },
    { label: "مفتش", value: "INSPECTOR" },
  ];

  // Table columns
  const columns: ColumnDef<UserListItem>[] = [
    {
      header: "رقم المستخدم",
      cell: (row) => (
        <span className="font-medium text-[#111]">{formatShortId(row.id)}</span>
      ),
    },
    {
      header: "المستخدم",
      cell: (row) => (
        <div className="flex items-center justify-end gap-[12px]">
          <span className="text-[#4B5563] text-[14px]">
            {getUserDisplayName(row)}
          </span>
          <div className="w-[32px] h-[32px] bg-[#ebf1ff] rounded-full overflow-hidden flex items-center justify-center border border-white shrink-0">
            {row.avatar ? (
              <img
                src={row.avatar || ''}
                alt="Avatar"
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <img
                src="/assets/dashboard/users.svg"
                alt="Avatar"
                width={16}
                height={16}
                className="opacity-40"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      header: "الهاتف",
      cell: (row) => (
        <span className="text-[#4B5563] text-[14px]">{row.phone}</span>
      ),
    },
    {
      header: "الدور",
      cell: (row) => {
        const roleStyle = USER_ROLE_MAP[row.role];
        return (
          <span
            className={`inline-flex items-center justify-center px-[12px] py-[4px] rounded-[128px] text-[12px] font-light ${roleStyle.bg} ${roleStyle.text}`}
          >
            {roleStyle.label}
          </span>
        );
      },
    },
    {
      header: "الحالة",
      cell: (row) => {
        const statusKey = row.isActive ? "active" : "inactive";
        const statusStyle = USER_STATUS_MAP[statusKey];
        return (
          <div
            className={`inline-flex items-center justify-center px-[12px] py-[4px] rounded-[128px] text-[12px] font-light ${statusStyle.bg} ${statusStyle.text}`}
          >
            {statusStyle.label}
          </div>
        );
      },
    },
    {
      header: "تاريخ التسجيل",
      cell: (row) => (
        <span className="text-[#4B5563] text-[14px]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "الإجراءات",
      cell: (row) => {
        const isOpen = openDropdownId === row.id;
        return (
          <ActionsDropdown
            isOpen={isOpen}
            onToggle={() => setOpenDropdownId(isOpen ? null : row.id)}
            onViewDetails={() => handleViewDetails(row.id)}
            onEdit={() => handleEdit(row)}
          />
        );
      },
    },
  ];

  // Pagination config
  const paginationConfig = data
    ? {
        currentPage: data.page,
        totalPages: data.totalPages,
        totalItems: data.total,
        itemsPerPage: data.limit,
        onPageChange: setCurrentPage,
      }
    : undefined;

  return (
    <PageContainer>
      <PageHeader
        title="المستخدمين"
        action={
          <Button
            variant="primary"
            size="lg"
            onClick={() => setCreateModalOpen(true)}
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            }
            iconPosition="right"
          >
            اضافة حساب جديد
          </Button>
        }
      />

      <StatsGrid columns={4}>
        <SummaryCard
          title="اجمالي المستخدمين"
          value={isLoading ? "--" : String(totalUsers)}
          iconSrc="/assets/dashboard/cards/user.svg"
        />
        <SummaryCard
          title="الحسابات النشطة"
          value={isLoading ? "--" : String(activeUsers)}
          iconSrc="/assets/dashboard/cards/user-tick.svg"
        />
        <SummaryCard
          title="الحسابات الغير نشطة"
          value={isLoading ? "--" : String(inactiveUsers)}
          iconSrc="/assets/dashboard/cards/user-minus.svg"
        />
        <SummaryCard
          title="الحسابات المحظورة"
          value={isLoading ? "--" : String(inactiveUsers)}
          iconSrc="/assets/dashboard/cards/user-remove.svg"
        />
      </StatsGrid>

      <ContentCard
        title="المستخدمين الحاليين"
        titleCount={data?.total ?? 0}
        filters={
          <div className="flex flex-col gap-4">
            <FilterGroup>
              <StatusFilter
                value={statusFilter}
                options={USER_STATUS_FILTER_OPTIONS.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
                onChange={handleStatusChange}
              />
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
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
                  {[fromDate || toDate, roleFilter].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="bg-[#fafafa] rounded-[16px] p-6 border border-[#f2f2f2]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DateRangeFilter
                    fromDate={fromDate}
                    toDate={toDate}
                    onFromChange={(val) => {
                      setFromDate(val);
                      setCurrentPage(1);
                    }}
                    onToChange={(val) => {
                      setToDate(val);
                      setCurrentPage(1);
                    }}
                    label="تاريخ التسجيل"
                    onClear={() => {
                      setFromDate("");
                      setToDate("");
                      setCurrentPage(1);
                    }}
                    width="w-full"
                  />
                  <StatusFilter
                    label="الدور"
                    value={roleFilter}
                    options={roleFilterOptions}
                    onChange={(val) => {
                      setRoleFilter(val);
                      setCurrentPage(1);
                    }}
                    width="w-full"
                  />
                </div>
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
        {isError && error && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] px-4 py-3 text-[14px] text-red-600">
            {error.message}
          </div>
        )}

        <Table
          data={data?.data ?? []}
          columns={columns}
          loading={isLoading}
          pagination={paginationConfig}
        />
      </ContentCard>

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={editModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          user={selectedUser}
        />
      )}

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateModalSuccess}
      />
    </PageContainer>
  );
}