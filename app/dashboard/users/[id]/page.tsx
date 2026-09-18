"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils/date";
import { useUserDetail } from "@/hooks/queries/useUsers";
import { useActivateUserMutation, useDeactivateUserMutation } from "@/hooks/mutations/useUsers";
import { USER_STATUS_MAP, USER_ROLE_MAP, UserDetail } from "@/lib/api/users";
import { getUserListingRequests, getUserCars, getUserNegotiations } from "@/lib/api/user-related";
import EditUserModal from "@/components/dashboard/EditUserModal";
import toast from "react-hot-toast";
import { useNegotiations } from '@/hooks/queries/useNegotiations';
import { formatPrice } from '@/lib/utils/car-transformers';

type TabType = "user_details" | "purchases" | "sales" | "negotiations" | "activity";

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: "activity", label: "سجل النشاط", icon: "/assets/dashboard/analytics.svg" },
  { id: "negotiations", label: "المفاوضات", icon: "/assets/dashboard/negotiations.svg" },
  { id: "sales", label: "المبيعات", icon: "/assets/dashboard/sales-requests.svg" },
  { id: "purchases", label: "المشتريات", icon: "/assets/dashboard/marketing.svg" },
  { id: "user_details", label: "بيانات المستخدم", icon: "/assets/dashboard/users.svg" },
];

const INFO_FIELDS = [
  { id: "email", label: "البريد الإلكتروني", icon: "/icons/sms.png" },
  { id: "name", label: "الاسم الكامل", icon: "/icons/user.png" },
  { id: "phone", label: "رقم الهاتف", icon: "/icons/mobile.png" },
  { id: "city", label: "المدينة", icon: "/icons/location.png" },
  { id: "region", label: "المنطقة", icon: "/icons/location.png" },
  { id: "registration_date", label: "تاريخ التسجيل", icon: "/icons/calendar.png" },
];

const getFieldValue = (fieldId: string, user: UserDetail): string => {
  switch (fieldId) {
    case "email":
      return user.email || "غير محدد";
    case "name":
      return [user.firstName, user.lastName].filter(Boolean).join(" ") || "غير محدد";
    case "phone":
      return user.phone || "غير محدد";
    case "city":
      return user.city || "غير محدد";
    case "region":
      return user.region || "غير محدد";
    case "registration_date":
      return formatDate(user.createdAt);
    default:
      return "غير محدد";
  }
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="w-full flex flex-col gap-[24px] items-start animate-pulse">
    <div className="flex flex-col items-start gap-[10px] w-full mt-[10px]">
      <div className="h-[14px] w-[100px] bg-gray-200 rounded" />
      <div className="w-[112px] h-[112px] bg-gray-200 rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] w-full">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[#f9fafb] rounded-[8px] h-[72px] p-[12px] flex flex-col gap-[4px] items-start justify-center relative">
          <div className="h-[12px] w-[80px] bg-gray-200 rounded" />
          <div className="h-[16px] w-[120px] bg-gray-200 rounded mt-[4px]" />
          <div className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// Error state component
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-[60px] text-center w-full">
    <div className="w-[64px] h-[64px] mb-[16px] opacity-30">
      <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <p className="text-[14px] text-[#6b7280] mb-[16px]">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-[4px] bg-[#002ec1] text-white px-[16px] h-[44px] rounded-full hover:bg-[#002bbf] transition-all"
    >
      <span className="text-[12px] font-medium">إعادة المحاولة</span>
    </button>
  </div>
);

// Activity Tab - Shows listing requests
const ActivityTab = ({ userId }: { userId: string }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getUserListingRequests({ userId, limit: 10 });
        setRequests(result.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#f9fafb] rounded-[16px] p-[16px] animate-pulse">
            <div className="h-[20px] w-[60%] bg-gray-200 rounded mb-[8px]" />
            <div className="h-[16px] w-[40%] bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[60px] text-center">
        <img src="/icons/document-text.png" alt="No data" width={64} height={64} className="opacity-30 mb-[16px]" />
        <p className="text-[14px] text-[#6b7280] mb-[16px]">لا توجد طلبات فحص</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
      {requests.map((req) => (
        <Link
          key={req.id}
          href={`/dashboard/sales-requests/${req.id}`}
          className="bg-[#f9fafb] rounded-[16px] p-[16px] hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-[8px]">
            <h4 className="text-[16px] font-semibold text-[#111]">
              {req.brand} {req.model} ({req.year})
            </h4>
            <span className="text-[12px] text-[#6b7280]">{formatDate(req.createdAt)}</span>
          </div>
          <p className="text-[14px] text-[#6b7280]">{req.address}</p>
        </Link>
      ))}
    </div>
  );
};

// Sales Tab - Shows user's cars
const SalesTab = ({ userId }: { userId: string }) => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getUserCars({ userId, limit: 10 });
        setCars(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#f9fafb] rounded-[16px] p-[16px] animate-pulse">
            <div className="h-[20px] w-[60%] bg-gray-200 rounded mb-[8px]" />
            <div className="h-[16px] w-[40%] bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[60px] text-center">
        <img src="/icons/document-text.png" alt="No data" width={64} height={64} className="opacity-30 mb-[16px]" />
        <p className="text-[14px] text-[#6b7280] mb-[16px]">لا توجد مبيعات</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
      {cars.map((car) => (
        <Link
          key={car.id}
          href={`/dashboard/cars/${car.id}`}
          className="bg-[#f9fafb] rounded-[16px] p-[16px] hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-between mb-[8px]">
            <h4 className="text-[16px] font-semibold text-[#111]">
              {car.brand} {car.model} ({car.year})
            </h4>
            <span className="text-[14px] font-semibold text-[#002ec1]">{car.price.toLocaleString()} ريال</span>
          </div>
          <p className="text-[14px] text-[#6b7280]">{car.mileage.toLocaleString()} كم</p>
        </Link>
      ))}
    </div>
  );
};

// Negotiations Tab
const NegotiationsTab = ({ userId }: { userId: string }) => {
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getUserNegotiations({ userId, limit: 10 });
        setNegotiations(result.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchNegotiations();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#f9fafb] rounded-[16px] p-[16px] animate-pulse">
            <div className="h-[20px] w-[60%] bg-gray-200 rounded mb-[8px]" />
            <div className="h-[16px] w-[40%] bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (negotiations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[60px] text-center">
        <img src="/icons/document-text.png" alt="No data" width={64} height={64} className="opacity-30 mb-[16px]" />
        <p className="text-[14px] text-[#6b7280] mb-[16px]">لا توجد مفاوضات</p>
      </div>
    );
  }

  const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    PENDING: { label: 'بانتظار الرد', bg: 'bg-[#FEF3C7]', text: 'text-[#CA8A04]' },
    CONNECTED: { label: 'قيد التفاوض', bg: 'bg-[#E0F2FE]', text: 'text-[#2563EB]' },
    COMPLETED: { label: 'مكتمل', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
    CANCELLED: { label: 'ملغي', bg: 'bg-[#FFE0DE]', text: 'text-[#AF1208]' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
      {negotiations.map((neg) => {
        const status = STATUS_MAP[neg.status] || STATUS_MAP.PENDING;
        return (
          <Link
            key={neg.id}
            href={`/dashboard/negotiations/${neg.id}`}
            className="bg-[#f9fafb] rounded-[16px] p-[16px] hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <h4 className="text-[16px] font-semibold text-[#111]">
                {neg.car.brand} {neg.car.model} ({neg.car.year})
              </h4>
              <span className={`text-[12px] px-[12px] py-[4px] rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-[#6b7280]">العرض: {neg.initialOffer.toLocaleString()} ريال</p>
              <p className="text-[14px] text-[#6b7280]">{formatDate(neg.createdAt)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

const PurchasesTab = ({ userId }: { userId: string }) => {
  const { data: negotiationsData, isLoading } = useNegotiations({ status: 'COMPLETED', limit: 100 });

  const purchases = useMemo(() => {
    if (!negotiationsData?.items) return [];
    return negotiationsData.items.filter((n) => n.buyer.id === userId);
  }, [negotiationsData, userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-[60px] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002ec1]" />
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[60px] text-center w-full">
        <img src="/icons/document-text.png" alt="No data" width={64} height={64} className="opacity-30 mb-[16px]" />
        <p className="text-[14px] text-[#6b7280] mb-[16px]">لا توجد مشتريات</p>
        <p className="text-[12px] text-[#9ca3af]">سيتم عرض السيارات التي تم شراؤها هنا</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[16px] w-full">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="bg-white rounded-[16px] p-[16px] border border-gray-100 flex flex-col md:flex-row gap-[16px] items-start md:items-center" dir="rtl">
          {/* Car Image */}
          <div className="relative w-[120px] h-[80px] rounded-[12px] overflow-hidden shrink-0 bg-gray-100">
            {purchase.car.images?.[0] ? (
              <img src={purchase.car.images[0]} alt="Car" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img src="/assets/dashboard/cars/stats-car.svg" alt="No image" width={40} height={40} className="opacity-30" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-[8px]">
            <h4 className="text-[16px] font-semibold text-[#111]">
              {purchase.car.brand} {purchase.car.model} {purchase.car.year}
            </h4>
            <div className="flex flex-wrap gap-[16px] text-[12px] text-[#6b7280]">
              <span>السعر النهائي: <strong className="text-[#002ec1]">{formatPrice(purchase.finalPrice ?? purchase.car.price)} ج.م</strong></span>
              <span>تاريخ الشراء: {new Date(purchase.completedAt ?? purchase.updatedAt).toLocaleDateString('ar-EG')}</span>
            </div>
          </div>

          {/* Action */}
          <Link href={`/dashboard/negotiations/${purchase.id}`} className="text-[12px] text-[#002ec1] hover:underline shrink-0">
            عرض التفاصيل
          </Link>
        </div>
      ))}
    </div>
  );
};

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading, isError, error } = useUserDetail(id);
  const [activeTab, setActiveTab] = useState<TabType>("user_details");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const activateMutation = useActivateUserMutation();
  const deactivateMutation = useDeactivateUserMutation();

  const handleToggleBlock = () => {
    if (!user) return;

    const action = user.isActive ? "حظر" : "إلغاء الحظر";
    if (!confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) return;

    if (user.isActive) {
      deactivateMutation.mutate(user.id, {
        onSuccess: () => toast.success("تم حظر المستخدم بنجاح"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "حدث خطأ"),
      });
    } else {
      activateMutation.mutate(user.id, {
        onSuccess: () => toast.success("تم إلغاء حظر المستخدم بنجاح"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "حدث خطأ"),
      });
    }
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    toast.success("تم تحديث بيانات المستخدم بنجاح");
  };

  return (
    <div className="flex flex-col w-full gap-[16px]" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-[24px]">
        <h1 className="text-[24px] font-semibold text-[#000a2a]">تفاصيل المستخدم</h1>
        <Link
          href="/dashboard/users"
          className="flex items-center gap-[4px] bg-white text-[#6b7280] px-[16px] h-[44px] rounded-[200px] border border-gray-100 hover:bg-gray-50 transition-all shrink-0"
        >
          <img src="/assets/dashboard/arrow-left-rtl.svg" alt="Back" width={16} height={16} className="opacity-60" />
          <span className="text-[12px] font-normal leading-[1.5]">عودة</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[16px] p-[16px] lg:p-[20px] shadow-sm border border-gray-100 flex flex-col gap-[16px] items-start">
        <div className="bg-white border border-[#f3f3f3] border-[0.5px] rounded-[29px] px-[12px] py-[7px] flex items-center gap-[8px] w-fit max-w-full flex-row-reverse">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-[8px] h-[44px] px-[16px] py-[12px] rounded-full transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#002ec1] text-white' : 'text-[#6b7280] hover:bg-gray-50'
              }`}
            >
              <div className={`w-[20px] h-[20px] flex items-center justify-center shrink-0 ${activeTab === tab.id ? 'brightness-200' : 'opacity-60'}`}>
                <img src={tab.icon} alt={tab.label} width={20} height={20} />
              </div>
              <span className={`text-[12px] leading-[1.7] ${activeTab === tab.id ? 'text-white font-medium' : 'text-[#6b7280] font-light'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "user_details" && (
          <>
            {isLoading && <LoadingSkeleton />}
            {isError && !isLoading && <ErrorState message={error?.message || 'حدث خطأ'} onRetry={() => window.location.reload()} />}
            {user && !isLoading && (
              <div className="w-full flex flex-col gap-[24px] items-start">
                {/* Profile Picture */}
                <div className="flex flex-col items-start gap-[10px] w-full mt-[10px]">
                  <h3 className="text-[14px] text-[#002ec1] font-normal leading-normal text-right">الصورة الشخصية</h3>
                  <div className="w-[112px] h-[112px] bg-[#ebf1ff] rounded-[119px] border-[1.5px] border-white overflow-hidden flex items-center justify-center relative shadow-sm">
                    {user.avatar ? (
                      <img src={user.avatar || ''} alt="Avatar" width={112} height={112} className="object-cover" />
                    ) : (
                      <img src="/icons/profile.png" alt="Avatar" width={60} height={60} className="opacity-40" />
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <button onClick={() => setEditModalOpen(true)} className="flex items-center gap-[4px] bg-[#002ec1] text-white px-[16px] h-[44px] rounded-full hover:bg-[#002bcf] transition-all shrink-0">
                  <span className="text-[12px] font-medium">تعديل</span>
                </button>

                {/* Role and Status Badges */}
                <div className="flex items-center gap-[12px]">
                  <span className={`text-[12px] px-[12px] py-[6px] rounded-full font-medium ${USER_ROLE_MAP[user.role].bg} ${USER_ROLE_MAP[user.role].text}`}>
                    {USER_ROLE_MAP[user.role].label}
                  </span>
                  <span className={`text-[12px] px-[12px] py-[6px] rounded-full font-medium ${USER_STATUS_MAP[user.isActive ? 'active' : 'inactive'].bg} ${USER_STATUS_MAP[user.isActive ? 'active' : 'inactive'].text}`}>
                    {USER_STATUS_MAP[user.isActive ? 'active' : 'inactive'].label}
                  </span>
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] w-full">
                  {INFO_FIELDS.map((field) => (
                    <div key={field.id} className="bg-[#f9fafb] rounded-[8px] h-[72px] p-[12px] flex flex-col gap-[4px] items-start justify-center relative">
                      <span className="text-[12px] text-[#6b7280] font-light leading-[1.7]">{field.label}</span>
                      <span className="text-[16px] text-[#030712] font-medium leading-[1.5]">{getFieldValue(field.id, user)}</span>
                      <div className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center shrink-0 opacity-60">
                        <img src={field.icon} alt={field.label} width={20} height={20} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Block/Unblock Button */}
                <div className="w-full border-t border-[#f2f2f2] mt-[12px] pt-[12px] flex justify-end">
                  {user.isActive ? (
                    <button onClick={handleToggleBlock} disabled={deactivateMutation.isPending} className="flex items-center gap-[4px] bg-[#fef2f2] text-[#dc2626] px-[16px] h-[44px] w-[172px] justify-center rounded-full hover:bg-red-100 transition-all shrink-0 flex-row-reverse disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="text-[12px] font-semibold leading-[1.5]">{deactivateMutation.isPending ? "جارٍ الحظر..." : "حظر المستخدم"}</span>
                      <div className="w-[20px] h-[20px] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                    </button>
                  ) : (
                    <button onClick={handleToggleBlock} disabled={activateMutation.isPending} className="flex items-center gap-[4px] bg-[#f0fdf4] text-[#16a34a] px-[16px] h-[44px] w-[172px] justify-center rounded-full hover:bg-green-100 transition-all shrink-0 flex-row-reverse disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="text-[12px] font-semibold leading-[1.5]">{activateMutation.isPending ? "جارٍ..." : "إلغاء الحظر"}</span>
                      <div className="w-[20px] h-[20px] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "activity" && <ActivityTab userId={id} />}
        {activeTab === "negotiations" && <NegotiationsTab userId={id} />}
        {activeTab === "sales" && <SalesTab userId={id} />}
        {activeTab === "purchases" && <PurchasesTab userId={id} />}
      </div>

      {/* Edit Modal */}
      {user && (
        <EditUserModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          user={user}
        />
      )}
    </div>
  );
}