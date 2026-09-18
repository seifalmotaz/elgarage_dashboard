'use client';

import { useForm, UseFormReturn, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { InspectionDetails } from '../lib/api/admin-cars';
import { carsApi } from '../lib/api/cars';
import { useUpdateCarMutation } from './mutations/useCars';
import type { Car } from '../lib/api/types';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { matchStoredCity } from '../lib/egypt-cities';

// Zod schema for car form validation - matches Figma design exactly
// Status and Category are in Media & General Info section, NOT in specs section UI
// But they're stored in specifications object for backend submission
const currentYear = new Date().getFullYear();

const carFormSchema = z.object({
  // Media & General Info section fields
  carSelection: z.string().optional(), // For future: selecting from inspected cars
  listingRequestId: z.string().optional(), // Link to inspection
  selectedInspection: z.string().optional(), // Track selected inspection ID
  brandId: z.string().min(1, 'يرجى اختيار الماركة'), // Brand selection (required)
  modelId: z.string().min(1, 'يرجى اختيار الموديل'), // Model selection (required)
  brandName: z.string().optional(), // Brand name (resolved from brands list)
  modelName: z.string().optional(), // Model name (resolved from models list)
  year: z.number().min(1990, 'السنة يجب أن تكون أكبر من 1990').max(currentYear + 1, 'السنة غير صالحة'),
  mileage: z.number().min(0, 'عدد الكيلومترات يجب أن يكون صفر أو أكثر'),
  price: z.string().min(1, 'يرجى إدخال السعر'), // Price as string (displayed formatted)
  
  // Media
  images: z.array(z.string()),
  videoUrl: z.string().optional(),
  
  // Location (from inspection)
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  address: z.string().optional(),
  
  // Specifications (dynamic - all specs including status and category)
  // Key is specType.id (UUID), value is option.id (UUID)
  specifications: z.record(z.string(), z.string()).refine(
    (specs) => {
      // Check that we have at least some specs selected
      return Object.keys(specs).length > 0;
    },
    { message: 'يرجى اختيار المواصفات' }
  ),
  
  // Features (array of selected feature IDs)
  featureIds: z.array(z.string()),

  // Listing publication status
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD']),
  
  // Description
  description: z.string().optional(),
});

type CarFormData = z.infer<typeof carFormSchema>;

interface UseCarFormReturn {
  form: UseFormReturn<CarFormData>;
  formData: CarFormData;
  errors: FieldErrors<CarFormData>;
  isSubmitting: boolean;
  isEditMode: boolean;
  carId: string | undefined;
  updateBrand: (brandId: string) => void;
  updateYear: (year: number) => void;
  updateMileage: (mileage: number) => void;
  updateBrandName: (name: string) => void;
  updateModelName: (name: string) => void;
  updateSpec: (specKeyId: string, optionId: string) => void;
  toggleFeature: (featureId: string) => void;
  addImage: (url: string) => void;
  removeImage: (index: number) => void;
  setVideo: (url: string | null) => void;
  importFromInspection: (inspection: InspectionDetails) => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  clearImport: () => void;
  populateForm: (car: Car) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useCarForm(carId?: string): UseCarFormReturn {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!carId;

  // Mutation hook for update operations
  const updateCarMutation = useUpdateCarMutation();
  const queryClient = useQueryClient();
  const [initialStatus, setInitialStatus] = useState<'DRAFT' | 'PUBLISHED' | 'SOLD' | null>(null);

  const form = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      carSelection: '',
      listingRequestId: '',
      selectedInspection: '',
      brandId: '',
      modelId: '',
      brandName: '',
      modelName: '',
      year: currentYear,
      mileage: 0,
      price: '',
      images: [],
      videoUrl: '',
      latitude: null,
      longitude: null,
      address: '',
      specifications: {},
      featureIds: [],
      status: 'DRAFT',
      description: '',
    } as CarFormData,
    mode: 'onChange',
  });

  const updateBrand = (brandId: string) => {
    form.setValue('brandId', brandId);
    form.setValue('modelId', '');
    form.setValue('modelName', '');
  };

  const updateYear = (year: number) => {
    form.setValue('year', year);
  };

  const updateMileage = (mileage: number) => {
    form.setValue('mileage', mileage);
  };

  const updateBrandName = (name: string) => {
    form.setValue('brandName', name);
  };

  const updateModelName = (name: string) => {
    form.setValue('modelName', name);
  };

  const updateSpecRemove = (specKeyId: string) => {
    const current = form.getValues('specifications');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [specKeyId]: _, ...rest } = current;
    form.setValue('specifications', rest);
  };

  const updateSpec = (specKeyId: string, optionId: string) => {
    const current = form.getValues('specifications');
    if (optionId) {
      form.setValue('specifications', { ...current, [specKeyId]: optionId });
    } else {
      updateSpecRemove(specKeyId);
    }
  };

  const toggleFeature = (featureId: string) => {
    const current = form.getValues('featureIds') || [];
    const exists = current.includes(featureId);
    if (exists) {
      form.setValue('featureIds', current.filter(id => id !== featureId));
    } else {
      form.setValue('featureIds', [...current, featureId]);
    }
  };

  const addImage = (url: string) => {
    const current = form.getValues('images') || [];
    form.setValue('images', [...current, url], { shouldDirty: true });
  };

  const removeImage = (index: number) => {
    const current = form.getValues('images') || [];
    form.setValue('images', current.filter((_, i) => i !== index), {
      shouldDirty: true,
    });
  };

  const submit = form.handleSubmit(
    async (data) => {
      console.log('[Submit] Validation passed, data:', data);
      // City is required to publish; drafts may stay without a city (null).
      if (data.status === 'PUBLISHED' && !data.address?.trim()) {
        toast.error('يرجى اختيار المدينة قبل النشر');
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(true);
      try {
        // Convert price string to number if needed
        const price = typeof data.price === 'string'
          ? parseInt(data.price.replace(/,/g, '')) || 0
          : data.price;

        // Build specifications array from form spec selections
        const allSpecs: Record<string, string> = { ...data.specifications };

        // Base data structure for both create and update (status uses separate endpoint)
        const apiData = {
          brandId: data.brandId,
          modelId: data.modelId,
          brand: data.brandName || 'Unknown',
          model: data.modelName || 'Unknown',
          year: data.year,
          mileage: data.mileage,
          price: price,
          images: data.images || [],
          videoUrl: data.videoUrl || undefined,
          description: data.description || undefined,
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
          address: data.address?.trim() ? data.address.trim() : null,
          specifications: Object.entries(allSpecs).map(([specTypeId, val]) => {
            const isValUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
            return {
              specKeyId: specTypeId,
              optionId: isValUUID ? val : undefined,
              value: !isValUUID ? val : undefined,
            };
          }),
          featureIds: data.featureIds || [],
        };

        console.log('[Submit] Sending API data:', apiData);

        if (isEditMode && carId) {
          // Update mode - use mutation hook (handles toast internally)
          // Note: listingRequestId is not valid for updates, so we don't include it
          const updateData = {
            ...apiData,
            // Remove undefined values for cleaner payload
            ...(apiData.videoUrl && { videoUrl: apiData.videoUrl }),
            ...(apiData.description && { description: apiData.description }),
            ...(apiData.latitude && { latitude: apiData.latitude }),
            ...(apiData.longitude && { longitude: apiData.longitude }),
            // Address is always sent (string or null) so clearing the
            // picker actually clears the stored city instead of keeping it.
            address: apiData.address,
          };
          
          // Remove undefined fields from the root
          Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof typeof updateData] === undefined) {
              delete updateData[key as keyof typeof updateData];
            }
          });
          
          await updateCarMutation.mutateAsync({ id: carId, data: updateData });

          if (data.status && data.status !== initialStatus) {
            try {
              await carsApi.updateStatus(carId, data.status);
              queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(carId) });
              queryClient.invalidateQueries({ queryKey: queryKeys.cars.list() });
              setInitialStatus(data.status);
            } catch (statusError) {
              const message =
                statusError instanceof Error
                  ? statusError.message
                  : 'تم حفظ البيانات لكن فشل تحديث الحالة';
              toast.error(message);
              return;
            }
          }
          // Navigation is handled by the page component via mutation callbacks
        } else {
          // Create mode - backend defaults to PUBLISHED; apply chosen status after create
          const createData = {
            ...apiData,
            listingRequestId: data.listingRequestId || undefined,
          };
          const created = await carsApi.create(createData);
          const createdId = created?.id;

          if (createdId && data.status) {
            try {
              await carsApi.updateStatus(createdId, data.status);
            } catch (statusError) {
              const message =
                statusError instanceof Error
                  ? statusError.message
                  : 'تم إضافة السيارة لكن فشل تحديث الحالة';
              toast.error(message);
              router.push(createdId ? `/dashboard/cars/${createdId}/edit` : '/dashboard/cars');
              return;
            }
          }

          toast.success('تم إضافة السيارة بنجاح');
          router.push('/dashboard/cars');
        }
      } catch (error) {
        console.error('[Submit] API error:', error);
        // Don't show toast for update errors since mutation hook handles it
        if (!isEditMode) {
          const message = error instanceof Error ? error.message : 'فشل إضافة السيارة';
          toast.error(message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    (validationErrors) => {
      // Validation failed - show error toast with first error message
      console.error('[Submit] Validation failed:', validationErrors);

      // Get the first error message across all fields
      const getFirstErrorMsg = (errors: FieldErrors): string | null => {
        for (const key of Object.keys(errors)) {
          const val = errors[key as keyof typeof errors];
          if (val) {
            if (typeof val === 'object' && 'message' in val && val.message) {
              return String(val.message);
            }
          }
        }
        return null;
      };

      const firstError = getFirstErrorMsg(validationErrors);
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
      }
    }
  );

  const setVideo = (url: string | null) => {
    form.setValue('videoUrl', url || '');
  };

  const importFromInspection = (inspection: InspectionDetails) => {
    // Set basic car info from inspection
    form.setValue('listingRequestId', inspection.id);
    form.setValue('selectedInspection', inspection.id);
    form.setValue('year', inspection.year);
    form.setValue('mileage', inspection.mileage);

    // Keep inspection coordinates, but never expose the owner's inspection
    // address on the listing. The listing city is selected independently.
    if (inspection.location) {
      form.setValue('latitude', inspection.location.latitude);
      form.setValue('longitude', inspection.location.longitude);
    }

    // Set images from inspection photos (ordered by createdAt from backend)
    const imageUrls = inspection.photos.map(photo => photo.url);
    form.setValue('images', imageUrls);

    // Note: brand and model not set here because they need to match brandId/modelId
    // The InspectionSelector component should handle setting brandId/modelId separately
    // or we need to add brand/model text fields to the form
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const images = [...(form.getValues('images') || [])];
    if (fromIndex < 0 || fromIndex >= images.length || toIndex < 0 || toIndex >= images.length) {
      return;
    }
    const [moved] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, moved);
    form.setValue('images', images, { shouldDirty: true, shouldTouch: true });
  };

  const clearImport = () => {
    form.setValue('listingRequestId', '');
    form.setValue('selectedInspection', '');
    form.setValue('images', []);
    form.setValue('latitude', null);
    form.setValue('longitude', null);
    form.setValue('address', '');
  };

  const populateForm = (car: Car) => {
    // Set basic fields
    form.setValue('brandId', car.brandId || '');
    form.setValue('modelId', car.modelId || '');
    form.setValue('brandName', car.brand || '');
    form.setValue('modelName', car.model || '');
    form.setValue('year', car.year);
    form.setValue('mileage', car.mileage);
    form.setValue('price', car.price?.toString() || '');
    form.setValue('description', car.description || '');
    form.setValue('images', car.images || []);
    form.setValue('status', car.status || 'DRAFT');
    setInitialStatus(car.status || 'DRAFT');

    // Transform specifications array to keyed object
    const specsObj: Record<string, string> = {};
    car.specifications?.forEach(spec => {
      if (spec.specKey?.id) {
        specsObj[spec.specKey.id] = spec.optionId || spec.value || '';
      }
    });
    form.setValue('specifications', specsObj);

    // Extract feature IDs
    const featureIds = car.features?.map(f => f.feature?.id || f.id).filter(Boolean) || [];
    form.setValue('featureIds', featureIds);

    // Set listing request ID if exists
    if (car.listingRequestId) {
      form.setValue('listingRequestId', car.listingRequestId);
    }

    // Set location if exists
    if (car.latitude) form.setValue('latitude', car.latitude);
    if (car.longitude) form.setValue('longitude', car.longitude);
    // Older listings can contain a full owner-provided address even though the
    // dashboard field is a city picker. Store its city value in the form so a
    // save persists what the picker displays without requiring a re-selection.
    form.setValue('address', matchStoredCity(car.address));
  };

  const reset = () => {
    form.reset();
  };

  return {
    form,
    formData: form.watch() as CarFormData,
    errors: form.formState.errors,
    isSubmitting,
    isEditMode,
    carId,
    updateBrand,
    updateYear,
    updateMileage,
    updateBrandName,
    updateModelName,
    updateSpec,
    toggleFeature,
    addImage,
    removeImage,
    setVideo,
    importFromInspection,
    reorderImages,
    clearImport,
    populateForm,
    submit,
    reset,
  };
}

export type { CarFormData };
