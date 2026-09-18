'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCarsApi } from '@/lib/api/admin-cars';
import { queryKeys } from '@/lib/query-keys';
import toast from 'react-hot-toast';

export function useUpload360ViewMutation(carId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => adminCarsApi.upload360View(carId, file),
    onSuccess: (data) => {
      toast.success(`تم رفع عرض 360 درجة (${data?.data?.totalFrames ?? '?'} إطار)`);
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(carId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع عرض 360 درجة');
    },
  });
}

export function useRemove360ViewMutation(carId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminCarsApi.remove360View(carId),
    onSuccess: () => {
      toast.success('تم حذف عرض 360 درجة');
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(carId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف عرض 360 درجة');
    },
  });
}