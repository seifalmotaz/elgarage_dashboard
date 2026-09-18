"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../../components/ui/Button";
import Modal from "../../../../components/ui/Modal";
import { Negotiation, NegotiationStatus } from "../../../../lib/api/negotiations";
import { useNegotiationDetail } from "../../../../hooks/queries/useNegotiations";
import { useUpdateNegotiationMutation, useCompleteNegotiationMutation } from "../../../../hooks/mutations/useNegotiations";
import toast from "react-hot-toast";

const STATUS_MAP: Record<NegotiationStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: 'قيد الانتظار', bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  CONNECTED: { label: 'جاري التواصل', bg: 'bg-[#DBEAFE]', text: 'text-[#3B82F6]' },
  COMPLETED: { label: 'مكتمل', bg: 'bg-[#D1FAE5]', text: 'text-[#16A34A]' },
  CANCELLED: { label: 'ملغي', bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
};

const STATUS_WORKFLOW: Record<NegotiationStatus, NegotiationStatus[]> = {
  PENDING: ['CONNECTED', 'CANCELLED'],
  CONNECTED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const getStatusBadge = (status: NegotiationStatus) => {
  const config = STATUS_MAP[status];
  return (
    <div
      className={`inline-flex items-center justify-center px-[12px] py-[4px] rounded-[128px] text-[12px] font-light ${config.bg} ${config.text}`}
    >
      {config.label}
    </div>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export default function NegotiationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: negotiation, isLoading, isError, refetch } = useNegotiationDetail(id);
  const updateMutation = useUpdateNegotiationMutation();
  const completeMutation = useCompleteNegotiationMutation();

  const [notes, setNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<NegotiationStatus | null>(null);
  const [finalPriceInput, setFinalPriceInput] = useState('');

  // Sync notes when negotiation data loads
  useEffect(() => {
    if (negotiation) {
      setNotes(negotiation.adminNotes || '');
    }
  }, [negotiation]);

  const handleSaveNotes = () => {
    if (!negotiation) return;
    updateMutation.mutate(
      { id: negotiation.id, data: { adminNotes: notes } },
      {
        onSuccess: () => toast.success('تم حفظ الملاحظات بنجاح'),
        onError: () => toast.error('حدث خطأ أثناء حفظ الملاحظات'),
      }
    );
  };

  const handleStatusChange = () => {
    if (!negotiation || !selectedStatus) return;
    updateMutation.mutate(
      { id: negotiation.id, data: { status: selectedStatus } },
      {
        onSuccess: () => {
          setShowStatusModal(false);
          setSelectedStatus(null);
          toast.success('تم تحديث الحالة بنجاح');
        },
        onError: () => toast.error('حدث خطأ أثناء تحديث الحالة'),
      }
    );
  };

  const handleComplete = () => {
    if (!negotiation) return;
    const price = parseFloat(finalPriceInput);
    if (isNaN(price) || price <= 0) {
      toast.error('يرجى إدخال السعر النهائي بشكل صحيح');
      return;
    }
    completeMutation.mutate(
      { id: negotiation.id, finalPrice: price },
      {
        onSuccess: () => {
          setShowCompleteModal(false);
          setFinalPriceInput('');
          toast.success('تم إتمام المفاوضة بنجاح');
        },
        onError: () => toast.error('حدث خطأ أثناء إتمام المفاوضة'),
      }
    );
  };

  const openStatusModal = (status: NegotiationStatus) => {
    setSelectedStatus(status);
    setShowStatusModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#f2f2f2] border-t-[#002ec1] rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !negotiation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-gray-600 text-lg">حدث خطأ أثناء تحميل بيانات المفاوضة</p>
        <Button variant="primary" onClick={() => router.push('/dashboard/negotiations')}>
          العودة للمفاوضات
        </Button>
      </div>
    );
  }

  const availableStatusActions = STATUS_WORKFLOW[negotiation.status];

  return (
    <div className="flex flex-col gap-8 pb-20" dir="rtl">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/negotiations"
          className="w-10 h-10 bg-[#fafafa] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="rotate-180">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
        <h1 className="text-[24px] lg:text-[28px] font-semibold text-[#111]">تفاصيل المفاوضة</h1>
        {getStatusBadge(negotiation.status)}
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8 w-full min-w-0">
        {/* Main content column */}
        <div className="flex flex-col gap-6 min-w-0 w-full">
          {/* Negotiation Info Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h2 className="text-[16px] font-semibold text-[#002ec1] mb-6">معلومات المفاوضة</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-[#6B7280]">رقم المفاوضة</span>
                <span className="text-[14px] text-[#111] font-medium font-mono">{negotiation.id.substring(0, 12)}...</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-[#6B7280]">الحالة</span>
                <div>{getStatusBadge(negotiation.status)}</div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-[#6B7280]">تاريخ الإنشاء</span>
                <span className="text-[14px] text-[#111]">{formatDate(negotiation.createdAt)}</span>
              </div>
              {negotiation.connectedAt && (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-[#6B7280]">تاريخ بدء التواصل</span>
                  <span className="text-[14px] text-[#111]">{formatDate(negotiation.connectedAt)}</span>
                </div>
              )}
              {negotiation.completedAt && (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-[#6B7280]">تاريخ الإتمام</span>
                  <span className="text-[14px] text-[#111]">{formatDate(negotiation.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prices Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h2 className="text-[16px] font-semibold text-[#002ec1] mb-6">الأسعار</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-[#6B7280]">السعر المطلوب</span>
                <span className="text-[18px] text-[#111] font-semibold">{formatPrice(negotiation.askingPrice)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-[#6B7280]">العرض الأولي</span>
                <span className="text-[18px] text-[#111] font-semibold">{formatPrice(negotiation.initialOffer)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] text-[#6B7280]">السعر النهائي</span>
                <span className="text-[18px] text-[#16A34A] font-semibold">
                  {negotiation.finalPrice ? formatPrice(negotiation.finalPrice) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-6 w-full lg:w-[400px] min-w-0 shrink-0">
          {/* Car Info Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h2 className="text-[16px] font-semibold text-[#002ec1] mb-4">معلومات السيارة</h2>
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#fafafa] rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={1.5}>
                    <path d="M5 17h14M5 17a2 2 0 01-2-2V7a2 2 0 012-2h10.5l2.5 4H5zM5 17l-1.5 2M19 17l1.5 2M8 17v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                  </svg>
                </div>
                <div>
                  <span className="text-[16px] text-[#111] font-medium block">
                    {negotiation.car.brand} {negotiation.car.model}
                  </span>
                  <span className="text-[14px] text-[#6B7280]">{negotiation.car.year}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[14px] text-[#6B7280]">السعر المطلوب</span>
                <span className="text-[14px] text-[#111] font-medium">{formatPrice(negotiation.car.price)}</span>
              </div>
            </div>
            <Link href={`/dashboard/cars/${negotiation.carId}`}>
              <Button variant="outline" size="md" className="w-full">
                عرض السيارة
              </Button>
            </Link>
          </div>

          {/* Buyer Info Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h2 className="text-[16px] font-semibold text-[#002ec1] mb-4">معلومات المشتري</h2>
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#fafafa] rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={1.5}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[16px] text-[#111] font-medium block">
                    {negotiation.buyer.firstName && negotiation.buyer.lastName
                      ? `${negotiation.buyer.firstName} ${negotiation.buyer.lastName}`
                      : 'غير محدد'}
                  </span>
                  <span className="text-[14px] text-[#6B7280]">{negotiation.buyer.phone}</span>
                </div>
              </div>
            </div>
            <Link href={`/dashboard/users/${negotiation.buyerId}`}>
              <Button variant="outline" size="md" className="w-full">
                عرض المشتري
              </Button>
            </Link>
          </div>

          {/* Admin Notes Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h2 className="text-[16px] font-semibold text-[#002ec1] mb-4">ملاحظات المشرف</h2>
            <div className="flex flex-col gap-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظاتك هنا..."
                className="w-full h-32 p-4 bg-[#fafafa] border border-[#f2f2f2] rounded-[16px] text-[14px] text-[#111] placeholder-[#D1D5DB] outline-none resize-none focus:border-[#002ec1] transition-colors"
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveNotes}
                disabled={updateMutation.isPending}
                className="w-full"
              >
                {updateMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ الملاحظات'}
              </Button>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h2 className="text-[16px] font-semibold text-[#002ec1] mb-4">إجراءات</h2>
            {availableStatusActions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {negotiation.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => openStatusModal('CONNECTED')}
                    className="w-full"
                  >
                    بدء التواصل
                  </Button>
                )}
                {negotiation.status === 'CONNECTED' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowCompleteModal(true)}
                    className="w-full"
                  >
                    إتمام المفاوضة
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => openStatusModal('CANCELLED')}
                  className="w-full text-[#6B7280]"
                >
                  إلغاء المفاوضة
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 text-[14px] text-[#6B7280]">
                لا يمكن تغيير حالة المفاوضة
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedStatus(null);
        }}
        title="تغيير الحالة"
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedStatus(null);
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleStatusChange}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'جارٍ التحديث...' : 'تأكيد'}
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <p className="text-[16px] text-[#111]">
            هل أنت متأكد من تغيير الحالة إلى{' '}
            <span className="font-semibold text-[#002ec1]">
              {selectedStatus ? STATUS_MAP[selectedStatus].label : ''}
            </span>
            {' '}؟
          </p>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setFinalPriceInput('');
        }}
        title="إتمام المفاوضة"
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setShowCompleteModal(false);
                setFinalPriceInput('');
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? 'جارٍ التحديث...' : 'تأكيد'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-4">
          <p className="text-[14px] text-[#6B7280] text-center">
            أدخل السعر النهائي للمفاوضة
          </p>
          <div className="relative">
            <input
              type="number"
              value={finalPriceInput}
              onChange={(e) => setFinalPriceInput(e.target.value)}
              placeholder="0"
              className="w-full h-14 px-6 bg-[#fafafa] border border-[#f2f2f2] rounded-[16px] text-[16px] text-[#111] placeholder-[#D1D5DB] outline-none focus:border-[#002ec1] transition-colors text-end pr-12"
            />
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280]">
              ج.م
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}