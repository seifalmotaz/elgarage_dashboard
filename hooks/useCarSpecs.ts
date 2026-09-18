'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { specTypesApi, specOptionsApi } from '../lib/api/car-specs';
import { SpecType, SpecOption, CreateSpecTypeDto, CreateSpecOptionDto } from '../lib/api-client';
import toast from 'react-hot-toast';

export function useCarSpecs() {
  const [specTypes, setSpecTypes] = useState<SpecType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent duplicate fetches in StrictMode
  const hasFetchedRef = useRef(false);

  const fetchSpecTypes = useCallback(async () => {
    // Skip if already fetched (prevents double fetch in StrictMode)
    if (hasFetchedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await specTypesApi.getAll();
      setSpecTypes(data);
      hasFetchedRef.current = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch spec types';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecTypes();
  }, [fetchSpecTypes]);

  const createSpecType = useCallback(async (data: CreateSpecTypeDto): Promise<SpecType | null> => {
    try {
      const newType = await specTypesApi.create(data);
      setSpecTypes(prev => [...prev, newType]);
      toast.success('تم اضافة نوع المواصفة بنجاح');
      return newType;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create spec type';
      toast.error(message);
      return null;
    }
  }, []);

  const updateSpecType = useCallback(async (id: string, data: Partial<CreateSpecTypeDto>): Promise<SpecType | null> => {
    try {
      const updatedType = await specTypesApi.update(id, data);
      setSpecTypes(prev => prev.map(type => type.id === id ? updatedType : type));
      toast.success('تم تحديث نوع المواصفة بنجاح');
      return updatedType;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update spec type';
      toast.error(message);
      return null;
    }
  }, []);

  const deleteSpecType = useCallback(async (id: string): Promise<boolean> => {
    try {
      await specTypesApi.delete(id);
      setSpecTypes(prev => prev.filter(type => type.id !== id));
      toast.success('تم حذف نوع المواصفة بنجاح');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete spec type';
      toast.error(message);
      return false;
    }
  }, []);

  const reorderSpecTypes = useCallback(async (typeIds: string[]): Promise<boolean> => {
    try {
      await specTypesApi.reorder(typeIds);
      setSpecTypes(prev => {
        const reordered = typeIds.map(id => prev.find(type => type.id === id)!).filter(Boolean);
        return reordered;
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder spec types';
      toast.error(message);
      return false;
    }
  }, []);

  const createSpecOption = useCallback(async (typeId: string, data: CreateSpecOptionDto): Promise<SpecOption | null> => {
    try {
      const newOption = await specOptionsApi.create(typeId, data);
      setSpecTypes(prev => prev.map(type => {
        if (type.id === typeId) {
          return { ...type, options: [...type.options, newOption] };
        }
        return type;
      }));
      toast.success('تم اضافة الخيار بنجاح');
      return newOption;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create spec option';
      toast.error(message);
      return null;
    }
  }, []);

  const updateSpecOption = useCallback(async (typeId: string, optionId: string, data: Partial<CreateSpecOptionDto>): Promise<SpecOption | null> => {
    try {
      const updatedOption = await specOptionsApi.update(optionId, data);
      setSpecTypes(prev => prev.map(type => {
        if (type.id === typeId) {
          return {
            ...type,
            options: type.options.map(option => option.id === optionId ? updatedOption : option)
          };
        }
        return type;
      }));
      toast.success('تم تحديث الخيار بنجاح');
      return updatedOption;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update spec option';
      toast.error(message);
      return null;
    }
  }, []);

  const deleteSpecOption = useCallback(async (typeId: string, optionId: string): Promise<boolean> => {
    try {
      await specOptionsApi.delete(optionId);
      setSpecTypes(prev => prev.map(type => {
        if (type.id === typeId) {
          return {
            ...type,
            options: type.options.filter(option => option.id !== optionId)
          };
        }
        return type;
      }));
      toast.success('تم حذف الخيار بنجاح');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete spec option';
      toast.error(message);
      return false;
    }
  }, []);

  const reorderSpecOptions = useCallback(async (typeId: string, optionIds: string[]): Promise<boolean> => {
    try {
      await specOptionsApi.reorder(typeId, optionIds);
      setSpecTypes(prev => prev.map(type => {
        if (type.id === typeId) {
          const reorderedOptions = optionIds
            .map(id => type.options.find(option => option.id === id)!)
            .filter(Boolean);
          return { ...type, options: reorderedOptions };
        }
        return type;
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder spec options';
      toast.error(message);
      return false;
    }
  }, []);

  return {
    specTypes,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false;
      fetchSpecTypes();
    },
    createSpecType,
    updateSpecType,
    deleteSpecType,
    reorderSpecTypes,
    createSpecOption,
    updateSpecOption,
    deleteSpecOption,
    reorderSpecOptions,
  };
}