'use client';

import { useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/date';
import type { InspectionPublishStatus } from '@/lib/api/inspection.api';

interface InspectionPublishPanelProps {
  status: InspectionPublishStatus | undefined;
  isLoading: boolean;
  isError?: boolean;
  isPublishing: boolean;
  onPublish: () => Promise<void>;
  onRetry?: () => void;
}

function ChangeList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'add' | 'remove' | 'change';
}) {
  if (items.length === 0) return null;
  const toneClass =
    tone === 'add'
      ? 'text-[#067647] bg-[#ecfdf3] border-[#abefc6]'
      : tone === 'remove'
        ? 'text-[#b42318] bg-[#fef3f2] border-[#fecdca]'
        : 'text-[#b54708] bg-[#fffaeb] border-[#fedf89]';

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-medium text-[#1a1a1a]">{title}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={`${tone}-${item}`}
            className={`text-[12px] px-3 py-1.5 rounded-full border ${toneClass}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InspectionPublishPanel({
  status,
  isLoading,
  isError,
  isPublishing,
  onPublish,
  onRetry,
}: InspectionPublishPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const publishLock = useRef(false);

  if (isLoading) {
    return (
      <div className="rounded-[16px] border border-[#f2f2f2] bg-[#fafafa] px-5 py-4 text-[13px] text-[#8286ab]">
        جاري التحقق من حالة النشر...
      </div>
    );
  }

  if (isError || !status) {
    return (
      <div className="rounded-[16px] border border-[#f2f2f2] bg-[#fafafa] px-5 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-[13px] text-[#4b5563] leading-[1.6]">
          تعذر تحميل حالة النشر. يمكنك تعديل المسودة الآن، ثم إعادة المحاولة.
        </p>
        {onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry} className="h-10">
            إعادة المحاولة
          </Button>
        ) : null}
      </div>
    );
  }

  const { activeVersion, draft, hasUnpublishedChanges, unpublishedSummary } = status;
  const liveLabel = activeVersion
    ? `آخر نشر للمفتشين: ${formatDate(activeVersion.createdAt)}`
    : 'لا يوجد إصدار منشور بعد';

  const openConfirm = () => {
    if (!hasUnpublishedChanges || isPublishing || publishLock.current) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!hasUnpublishedChanges || isPublishing || publishLock.current) {
      setConfirmOpen(false);
      return;
    }
    publishLock.current = true;
    try {
      await onPublish();
      setConfirmOpen(false);
    } finally {
      publishLock.current = false;
    }
  };

  return (
    <>
      <div
        className={`rounded-[16px] border px-5 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
          hasUnpublishedChanges
            ? 'border-[#fedf89] bg-[#fffaeb]'
            : 'border-[#abefc6] bg-[#ecfdf3]'
        }`}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[12px] font-medium px-3 py-1 rounded-full ${
                hasUnpublishedChanges
                  ? 'bg-[#dc6803] text-white'
                  : 'bg-[#067647] text-white'
              }`}
            >
              {hasUnpublishedChanges ? 'مسودة غير منشورة' : 'منشور للمفتشين'}
            </span>
            <p className="text-[14px] font-semibold text-[#1a1a1a]">{liveLabel}</p>
          </div>
          <p className="text-[13px] text-[#4b5563] leading-[1.6]">
            {activeVersion
              ? `المفتشون يرون ${activeVersion.sectionCount} أقسام و ${activeVersion.questionCount} أسئلة.`
              : 'لم يُنشر شيء بعد. المفتش لن يرى هذه الأقسام حتى تنشر المسودة.'}
          </p>
          <p className="text-[13px] text-[#4b5563] leading-[1.6]">
            {hasUnpublishedChanges
              ? `المسودة: ${draft.sectionCount} أقسام و ${draft.questionCount} أسئلة — لم تُنشر بعد.`
              : 'المسودة مطابقة لما يراه المفتشون.'}
          </p>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-2 shrink-0">
          <Button
            type="button"
            disabled={!hasUnpublishedChanges}
            loading={isPublishing}
            onClick={openConfirm}
            className="h-11 min-w-[160px] px-6"
          >
            نشر للمفتشين
          </Button>
          {!hasUnpublishedChanges ? (
            <span className="text-[12px] text-[#067647]">لا توجد تغييرات بانتظار النشر</span>
          ) : null}
        </div>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="نشر إصدار الفحص"
        maxWidth="560px"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isPublishing}
            >
              إلغاء
            </Button>
            <Button type="button" loading={isPublishing} onClick={handleConfirm}>
              تأكيد النشر
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[#374151] leading-[1.7]">
            سيتم استبدال أسئلة الفحص التي يراها المفتش عند
            <strong> بدء فحص جديد</strong> بهذه المسودة. الفحوصات الجارية تبقى كما بدأت.
            إذا كانت المسودة مطابقة للمنشور حالياً فلن تُنشأ نسخة جديدة.
          </p>
          <div className="rounded-[12px] bg-[#f9fafb] border border-[#f2f2f2] px-4 py-3 text-[13px] text-[#4b5563] leading-[1.6]">
            ستُنشر المسودة ({draft.sectionCount} أقسام / {draft.questionCount} أسئلة)
            {activeVersion
              ? ` بدلاً مما يراه المفتش الآن (${activeVersion.sectionCount} أقسام / ${activeVersion.questionCount} أسئلة).`
              : '.'}
          </div>
          <ChangeList
            title="أقسام جديدة ستظهر للمفتش"
            items={unpublishedSummary.addedSections}
            tone="add"
          />
          <ChangeList
            title="أقسام ستُحذف من نسخة المفتش"
            items={unpublishedSummary.removedSections}
            tone="remove"
          />
          <ChangeList
            title="أقسام تم تعديل أسئلتها"
            items={unpublishedSummary.changedSections}
            tone="change"
          />
        </div>
      </Modal>
    </>
  );
}
