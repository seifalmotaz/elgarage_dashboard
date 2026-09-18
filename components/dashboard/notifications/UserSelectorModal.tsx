"use client";

import React, { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useUsers } from "@/hooks/queries/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { LoadingState } from "@/components/dashboard/states/LoadingState";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (userIds: string[]) => void;
  selectedUserIds: string[];
}

export default function UserSelectorModal({ open, onClose, onConfirm, selectedUserIds }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedUserIds);

  // Fetch users with pagination for search
  const { data, isLoading } = useUsers({
    page: 1,
    limit: 50,
    ...(debouncedSearch
      ? { phone: debouncedSearch }
      : {}),
  });

  const users = data?.data ?? [];

  const handleToggleUser = (userId: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelectedIds);
    onClose();
  };

  const handleClose = () => {
    setLocalSelectedIds(selectedUserIds);
    setSearch("");
    onClose();
  };

  const displayUsers = useMemo(() => {
    if (!debouncedSearch) return users;
    const searchLower = debouncedSearch.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.phone.includes(debouncedSearch) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }, [users, debouncedSearch]);

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="اختيار المستخدمين"
      maxWidth="600px"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="primary" onClick={handleConfirm} className="px-8">
            تأكيد الاختيار ({localSelectedIds.length})
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            إلغاء
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative">
          <img
            src="/assets/dashboard/search.svg"
            alt=""
            width={18}
            height={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            className="w-full h-[48px] bg-[#f8fafc] border border-[#f2f2f2] rounded-[16px] pr-12 pl-4 text-[14px] text-gray-700 placeholder-[#cbd5e1] focus:outline-none focus:border-[#002ec1] focus:bg-white transition-all text-start"
          />
        </div>

        {/* Selected Count */}
        {localSelectedIds.length > 0 && (
          <div className="bg-[#e0f2fe] text-[#2563eb] text-[12px] font-medium px-4 py-2 rounded-[12px] text-start">
            تم اختيار {localSelectedIds.length} مستخدم
          </div>
        )}

        {/* Users List */}
        <div className="max-h-[400px] overflow-y-auto border border-[#f2f2f2] rounded-[16px]">
          {isLoading ? (
            <div className="p-4">
              <LoadingState type="card" count={3} />
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#8286ab]">
              <img
                src="/assets/dashboard/profile-2user.svg"
                alt=""
                width={48}
                height={48}
                className="opacity-30 mb-2"
              />
              <p className="text-[14px]">لا يوجد مستخدمين</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f2f2f2]">
              {displayUsers.map((user) => {
                const isSelected = localSelectedIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-[#f8fafc] transition-colors text-start ${
                      isSelected ? "bg-[#f0f9ff]" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? "bg-[#002ec1] border-[#002ec1]"
                          : "border-[#f2f2f2] bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-[#f1f5f9] rounded-full flex items-center justify-center shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-[14px] font-medium text-[#64748b]">
                          {user.firstName?.[0] || "?"}
                          {user.lastName?.[0] || ""}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#1a1a1a] truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[12px] text-[#8286ab] truncate">{user.phone}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}