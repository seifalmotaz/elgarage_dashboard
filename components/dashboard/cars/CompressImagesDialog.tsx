'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatFileSize } from '@/lib/image-compression';

export type CompressDialogPhase = 'idle' | 'compressing' | 'uploading';
export type CompressDialogAction = 'compress' | 'keep';

interface CompressImagesDialogProps {
  isOpen: boolean;
  files: File[];
  phase?: CompressDialogPhase;
  activeAction?: CompressDialogAction | null;
  onCompress: () => void;
  onKeepOriginal: () => void;
  onCancel: () => void;
}

export default function CompressImagesDialog({
  isOpen,
  files,
  phase = 'idle',
  activeAction = null,
  onCompress,
  onKeepOriginal,
  onCancel,
}: CompressImagesDialogProps) {
  const isProcessing = phase !== 'idle';
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  const statusLabel =
    phase === 'compressing'
      ? 'جاري ضغط الصور...'
      : phase === 'uploading'
        ? 'جاري رفع الصور...'
        : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? () => undefined : onCancel}
      title="ضغط الصور قبل الرفع"
      maxWidth="520px"
      footer={
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={isProcessing}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onKeepOriginal}
            disabled={isProcessing}
            loading={activeAction === 'keep' && phase === 'uploading'}
          >
            رفع بدون ضغط
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onCompress}
            disabled={isProcessing}
            loading={
              activeAction === 'compress' &&
              (phase === 'compressing' || phase === 'uploading')
            }
          >
            ضغط الصور
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-[14px] text-[#4b5563] leading-relaxed">
          يمكن ضغط الصور وتحويلها إلى WebP لتحسين أداء الموقع مع الحفاظ على جودة مناسبة للعرض.
          حجم الملفات الحالية:{' '}
          <span className="font-medium text-[#1a1a1a]">{formatFileSize(totalBytes)}</span>
        </p>

        <div className="rounded-[16px] border border-[#f2f2f2] bg-[#fafafa] max-h-[240px] overflow-y-auto">
          <ul className="divide-y divide-[#f2f2f2]">
            {files.map((file) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="text-[13px] text-[#1a1a1a] truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="text-[12px] text-[#6b7280] shrink-0">
                  {formatFileSize(file.size)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {statusLabel && (
          <div className="flex items-center gap-2 text-[13px] text-[#002ec1]">
            <span className="w-4 h-4 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
            {statusLabel}
          </div>
        )}
      </div>
    </Modal>
  );
}
