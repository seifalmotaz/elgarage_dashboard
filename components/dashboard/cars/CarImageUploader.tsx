'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadApi } from '@/lib/api/upload';
import { compressImagesToWebp } from '@/lib/image-compression';
import CompressImagesDialog, {
  type CompressDialogAction,
  type CompressDialogPhase,
} from '@/components/dashboard/cars/CompressImagesDialog';

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

interface CarImageUploaderProps {
  onUploaded: (urls: string[]) => void;
  disabled?: boolean;
}

export default function CarImageUploader({
  onUploaded,
  disabled = false,
}: CarImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [phase, setPhase] = useState<CompressDialogPhase>('idle');
  const [activeAction, setActiveAction] = useState<CompressDialogAction | null>(null);

  const isBusy = dialogOpen || phase !== 'idle' || disabled;

  const resetSelection = () => {
    setPendingFiles([]);
    setDialogOpen(false);
    setPhase('idle');
    setActiveAction(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const valid = selected.filter((file) => ACCEPTED_TYPES.has(file.type));
    const rejected = selected.length - valid.length;

    if (rejected > 0) {
      toast.error('يُسمح فقط بملفات PNG أو JPG أو WEBP');
    }

    if (valid.length === 0) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setPendingFiles(valid);
    setDialogOpen(true);
  };

  const uploadFiles = async (files: File[]) => {
    setPhase('uploading');
    const results = await uploadApi.uploadMultiple(files, 'car-image');
    const urls = results.map((result) => result.url);
    onUploaded(urls);
    toast.success(`تم رفع ${urls.length} صورة بنجاح`);
    resetSelection();
  };

  const handleCompress = async () => {
    if (pendingFiles.length === 0 || phase !== 'idle') return;

    setActiveAction('compress');
    setPhase('compressing');

    try {
      const { files, fallbackCount } = await compressImagesToWebp(pendingFiles);
      if (fallbackCount > 0) {
        toast('تم التحويل إلى JPEG لبعض الصور لعدم دعم WebP في المتصفح', {
          icon: 'ℹ️',
        });
      }
      await uploadFiles(files);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل في رفع الصور';
      toast.error(message);
      setPhase('idle');
      setActiveAction(null);
    }
  };

  const handleKeepOriginal = async () => {
    if (pendingFiles.length === 0 || phase !== 'idle') return;

    setActiveAction('keep');
    try {
      await uploadFiles(pendingFiles);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل في رفع الصور';
      toast.error(message);
      setPhase('idle');
      setActiveAction(null);
    }
  };

  const handleCancel = () => {
    if (phase !== 'idle') return;
    resetSelection();
  };

  return (
    <>
      <label className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={isBusy}
        />
        <div
          className={`bg-[#f9fafb] border-2 border-dashed border-[#d1d5db] rounded-[12px] p-4 text-center cursor-pointer hover:border-[#002ec1] hover:bg-[#e9f0fc] transition-all ${
            isBusy ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {phase === 'uploading' || phase === 'compressing' ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#002ec1] border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] text-gray-600">
                {phase === 'compressing' ? 'جاري الضغط...' : 'جاري الرفع...'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V8M12 8L9 11M12 8L15 11"
                  stroke="#002ec1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 15V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V15"
                  stroke="#002ec1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[14px] text-[#002ec1] font-medium">إضافة صور</span>
              <span className="text-[11px] text-gray-500">PNG, JPG, WEBP — يمكن الضغط قبل الرفع</span>
            </div>
          )}
        </div>
      </label>

      <CompressImagesDialog
        isOpen={dialogOpen}
        files={pendingFiles}
        phase={phase}
        activeAction={activeAction}
        onCompress={handleCompress}
        onKeepOriginal={handleKeepOriginal}
        onCancel={handleCancel}
      />
    </>
  );
}
