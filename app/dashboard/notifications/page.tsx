"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { PageContainer, PageHeader } from "@/components/dashboard/layout";
import { TemplateCard } from "@/components/dashboard/notifications/TemplateCard";
import UserSelectorModal from "@/components/dashboard/notifications/UserSelectorModal";
import { useSendNotificationMutation } from "@/hooks/mutations/useNotifications";
import { useNotificationLogs } from "@/hooks/queries/useNotifications";
import toast from "react-hot-toast";
import { LoadingState } from "@/components/dashboard/states/LoadingState";
import { ErrorState } from "@/components/dashboard/states/ErrorState";

const TEMPLATES = [
  {
    id: 1,
    title: "عروض الأسبوع",
    description: "لا تفوت عروض وتخفيضات نهاية الأسبوع على مجموعة من السيارات المميزة.",
    icon: "/assets/dashboard/car-template.svg",
  },
  {
    id: 2,
    title: "تحديث الشروط",
    description: "قمنا بتحديث شروط الاستخدام الخاص بنا. يرجى المراجعة لضمان أفضل تجربة لك.",
    icon: "/assets/dashboard/car-template.svg",
  },
  {
    id: 3,
    title: "تنبيه انخفاض السعر",
    description: "سيارة كنت تتابعها تم تخفيض سعرها للتو! افتح التطبيق لمعرفة التفاصيل.",
    icon: "/assets/dashboard/car-template.svg",
  },
  {
    id: 4,
    title: "حساب محظور",
    description: "تم إيقاف حسابك مؤقتاً لمخالفة سياسة التطبيق. الرجاء التواصل مع الدعم.",
    icon: "/assets/dashboard/car-template.svg",
  },
  {
    id: 5,
    title: "توثيق الحساب",
    description: "تم توثيق حسابك بنجاح! الآن سيظهر لك علامة تحقق زرقاء لزيادة الثقة.",
    icon: "/assets/dashboard/car-template.svg",
  },
];

type AudienceType = "all" | "active" | "specific";

export default function NotificationsPage() {
  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AudienceType>("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modal states
  const [isUserSelectorOpen, setIsUserSelectorOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Mutations
  const sendMutation = useSendNotificationMutation();

  // Notification logs query
  const {
    data: logsData,
    isLoading: logsLoading,
    error: logsError,
  } = useNotificationLogs(1, 20);

  // Handle template click
  const handleTemplateClick = (template: (typeof TEMPLATES)[0]) => {
    setTitle(template.title);
    setBody(template.description);
  };

  // Handle audience change
  const handleAudienceChange = (newAudience: AudienceType) => {
    setAudience(newAudience);
    if (newAudience === "specific") {
      setIsUserSelectorOpen(true);
    }
  };

  // Handle user selection from modal
  const handleUserSelectionConfirm = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!title.trim() || title.trim().length < 3) {
      return "عنوان الإشعار يجب أن يكون 3 أحرف على الأقل";
    }
    if (!body.trim() || body.trim().length < 10) {
      return "محتوى الإشعار يجب أن يكون 10 أحرف على الأقل";
    }
    if (audience === "specific" && selectedUserIds.length === 0) {
      return "يرجى اختيار مستخدمين محددين على الأقل";
    }
    return null;
  };

  // Handle send notification
  const handleSend = () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    sendMutation.mutate({
      title: title.trim(),
      body: body.trim(),
      audience,
      targetUserIds: audience === "specific" ? selectedUserIds : undefined,
    });
  };

  // Handle cancel - reset form
  const handleCancel = () => {
    setTitle("");
    setBody("");
    setAudience("all");
    setSelectedUserIds([]);
  };

  // Handle successful send - reset form
  React.useEffect(() => {
    if (sendMutation.isSuccess) {
      handleCancel();
    }
  }, [sendMutation.isSuccess]);

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader title="الاشعارات" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RIGHT Main Content (Send Notification) - FIRST in DOM for RTL */}
        <div className="lg:col-span-8 bg-white rounded-[24px] border border-[#f2f2f2] p-8 flex flex-col gap-8 shadow-sm h-auto relative">
          {/* Top Actions - Aligned to LEFT (End) in RTL */}
          <div className="flex justify-end w-full mb-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#f2f2f2] shadow-sm">
              {/* Notification Log Button - FIRST in DOM = RIGHT in RTL */}
              <button
                onClick={() => setIsLogsModalOpen(true)}
                className="flex items-center justify-start gap-2 px-6 h-[44px] text-[#64748b] text-[14px] font-medium hover:text-[#002ec1] hover:bg-gray-50 rounded-full transition-all"
              >
                <span className="text-start">سجل الاشعارات</span>
                <img
                  src="/assets/dashboard/refresh.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="opacity-60"
                />
              </button>

              {/* Send Notification Button - SECOND in DOM = LEFT in RTL */}
              <Button
                variant="primary"
                size="md"
                className="rounded-full px-6 h-[44px]"
                icon={
                  <img
                    src="/assets/dashboard/send-2.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="brightness-0 invert"
                  />
                }
                iconPosition="left"
              >
                ارسال اشعار
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-semibold text-[#1a1a1a] text-start">
              إرسال إشعار جديد
            </h2>
            <p className="text-[14px] text-[#8286ab] font-light text-start">
              سيتم إرسال هذا الإشعار مباشرة إلى هواتف المستخدمين المستهدفين.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Notification Title */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
                عنوان الإشعار
              </label>
              <div className="w-full bg-[#f8fafc] border border-[#f2f2f2] h-[56px] rounded-[16px] px-6 flex items-center focus-within:border-[#002ec1] focus-within:bg-white transition-all">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال : عرض خاص لنهاية الاسبوع! 🎉"
                  className="bg-transparent border-none outline-none flex-1 text-[14px] text-gray-700 placeholder-[#cbd5e1] h-full text-start"
                />
              </div>
            </div>

            {/* Notification Content */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
                محتوى الإشعار
              </label>
              <div className="w-full bg-[#f8fafc] border border-[#f2f2f2] rounded-[16px] p-6 focus-within:border-[#002ec1] focus-within:bg-white transition-all">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="اكتب تفاصيل الاشعارات هنا ليعرف المستخدمين المزيد عن العرض او التنبيه ..."
                  className="bg-transparent border-none outline-none w-full text-[14px] text-gray-700 min-h-[180px] resize-none placeholder-[#cbd5e1] text-start leading-[1.8]"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-[14px] text-[#1a1a1a] font-medium text-start">
                  الجمهور المستهدف
                </label>
                {audience === "specific" && selectedUserIds.length > 0 && (
                  <span className="bg-[#e0f2fe] text-[#2563eb] text-[12px] font-medium px-3 py-1 rounded-full">
                    {selectedUserIds.length} مستخدمين محددين
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "all" as AudienceType, label: "الجميع", icon: "/assets/dashboard/profile-2user.svg" },
                  { id: "active" as AudienceType, label: "نشطينيرا", icon: "/assets/dashboard/activity.svg" },
                  { id: "specific" as AudienceType, label: "محدد", icon: "/assets/dashboard/search.svg" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAudienceChange(item.id)}
                    className={`flex flex-col items-center justify-center gap-3 h-[100px] rounded-[16px] border transition-all ${
                      audience === item.id
                        ? "bg-white border-[#002ec1] shadow-[0_0_0_1px_#002ec1]"
                        : "bg-[#f8fafc] border-[#f2f2f2] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      width={24}
                      height={24}
                      className={audience === item.id ? "opacity-100" : "opacity-40"}
                    />
                    <span
                      className={`text-[14px] font-medium text-center ${
                        audience === item.id ? "text-[#002ec1]" : "text-[#8286ab]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions - Part of natural flow at the end of the form */}
          <div className="mt-4 flex items-center justify-start gap-4 border-t border-[#f2f2f2] pt-8">
            {/* Blue Button FIRST = RIGHT */}
            <Button
              variant="primary"
              className="h-[52px] rounded-full px-12"
              icon={
                <img
                  src="/assets/dashboard/send-2.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="brightness-0 invert"
                />
              }
              iconPosition="left"
              loading={sendMutation.isPending}
              onClick={handleSend}
            >
              ارسال الاشعار الان
            </Button>
            {/* Red Button SECOND = LEFT */}
            <button
              onClick={handleCancel}
              className="bg-[#fff5f5] text-[#ef4444] border border-[#ffe4e4] rounded-full h-[52px] px-10 text-[14px] font-medium hover:bg-[#ffeaea] transition-colors"
            >
              الغاء
            </button>
          </div>
        </div>

        {/* LEFT Sidebar (Quick Templates) - SECOND in DOM for RTL */}
        <div className="lg:col-span-4 bg-white rounded-[24px] border border-[#f2f2f2] flex flex-col shadow-sm overflow-hidden h-auto">
          <div className="p-6 border-b border-[#f2f2f2]">
            <h2 className="text-[16px] font-semibold text-[#002ec1] text-start">
              قوالب جاهزة سريعة
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin] [scrollbar-color:#002ec1_#f1f5f9] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#f1f5f9] [&::-webkit-scrollbar-thumb]:bg-[#002ec1] [&::-webkit-scrollbar-thumb]:rounded-full pr-2 relative no-scrollbar max-h-[700px]">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.title}
                description={template.description}
                icon={template.icon}
                onClick={() => handleTemplateClick(template)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* User Selector Modal */}
      <UserSelectorModal
        open={isUserSelectorOpen}
        onClose={() => setIsUserSelectorOpen(false)}
        onConfirm={handleUserSelectionConfirm}
        selectedUserIds={selectedUserIds}
      />

      {/* Notification Logs Modal */}
      <Modal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        title="سجل الإشعارات"
        maxWidth="800px"
      >
        {logsLoading ? (
          <LoadingState type="card" count={3} />
        ) : logsError ? (
          <ErrorState
            message="سجل الإشعارات غير متوفر حالياً"
            onRetry={() => {}}
          />
        ) : logsData?.data && logsData.data.length > 0 ? (
          <div className="flex flex-col gap-3">
            {logsData.data.map((log, index) => {
              // Compute status from sentCount and failedCount
              const status = log.failedCount > 0 && log.sentCount > 0
                ? 'partial'
                : log.failedCount > 0 && log.sentCount === 0
                ? 'failed'
                : 'sent';
              return (
                <div
                  key={`${log.title}-${log.createdAt}-${index}`}
                  className="border border-[#f2f2f2] rounded-[16px] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-[#1a1a1a]">
                      {log.title}
                    </h3>
                    <span
                      className={`text-[12px] font-medium px-3 py-1 rounded-full ${
                        status === 'sent'
                          ? "bg-[#F0FDF4] text-[#16A34A]"
                          : status === 'failed'
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#FEF3C7] text-[#CA8A04]"
                      }`}
                    >
                      {status === 'sent'
                        ? "تم الإرسال"
                        : status === 'failed'
                        ? "فشل"
                        : "تم جزئياً"}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#8286ab]">{log.body}</p>
                  <div className="flex items-center justify-between text-[12px] text-[#64748b]">
                    <span>
                      {new Date(log.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                    <span>{log.recipientCount} مستلم</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-[#8286ab]">
            <img
              src="/assets/dashboard/notifications.svg"
              alt=""
              width={48}
              height={48}
              className="opacity-30 mb-2"
            />
            <p className="text-[14px]">لا يوجد سجل إشعارات</p>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}