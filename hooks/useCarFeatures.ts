'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { featureSectionApi, featureItemApi } from '../lib/api/car-features';
import { FeatureSection, CreateFeatureSectionDto, CreateFeatureItemDto } from '../lib/api-client';

export function useCarFeatures() {
  const [featureSections, setFeatureSections] = useState<FeatureSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent duplicate fetches in StrictMode
  const hasFetchedRef = useRef(false);

  const fetchFeatureSections = useCallback(async () => {
    // Skip if already fetched (prevents double fetch in StrictMode)
    if (hasFetchedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await featureSectionApi.getAll();
      setFeatureSections(data);
      hasFetchedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature sections');
      toast.error('فشل في تحميل أقسام المميزات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatureSections();
  }, [fetchFeatureSections]);

  // Create a new feature section
  const createSection = useCallback(async (data: CreateFeatureSectionDto): Promise<FeatureSection | null> => {
    try {
      const newSection = await featureSectionApi.create(data);
      setFeatureSections(prev => [...prev, newSection]);
      toast.success('تم اضافة القسم بنجاح');
      return newSection;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create section';
      toast.error(message === 'Network error' ? 'فشل في انشاء القسم' : message);
      return null;
    }
  }, []);

  // Update a feature section
  const updateSection = useCallback(async (id: string, data: Partial<CreateFeatureSectionDto>): Promise<FeatureSection | null> => {
    try {
      const updatedSection = await featureSectionApi.update(id, data);
      setFeatureSections(prev => 
        prev.map(section => section.id === id ? updatedSection : section)
      );
      toast.success('تم تحديث القسم بنجاح');
      return updatedSection;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update section';
      toast.error(message === 'Network error' ? 'فشل في تحديث القسم' : message);
      return null;
    }
  }, []);

  // Delete a feature section
  const deleteSection = useCallback(async (id: string): Promise<boolean> => {
    try {
      await featureSectionApi.delete(id);
      setFeatureSections(prev => prev.filter(section => section.id !== id));
      toast.success('تم حذف القسم بنجاح');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete section';
      toast.error(message === 'Network error' ? 'فشل في حذف القسم' : message);
      return false;
    }
  }, []);

  // Reorder feature sections
  const reorderSections = useCallback(async (sectionIds: string[]): Promise<boolean> => {
    try {
      await featureSectionApi.reorder(sectionIds);
      // Optimistic update already done in UI
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder sections';
      toast.error(message === 'Network error' ? 'فشل في اعادة ترتيب الأقسام' : message);
      // Revert by refetching
      fetchFeatureSections();
      return false;
    }
  }, [fetchFeatureSections]);

  // Create a new feature item
  const createItem = useCallback(async (sectionId: string, data: CreateFeatureItemDto): Promise<FeatureSection['items'][0] | null> => {
    try {
      const newItem = await featureItemApi.create(sectionId, data);
      setFeatureSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, items: [...section.items, newItem] }
            : section
        )
      );
      toast.success('تم اضافة الميزة بنجاح');
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create item';
      toast.error(message === 'Network error' ? 'فشل في اضافة الميزة' : message);
      return null;
    }
  }, []);

  // Update a feature item
  const updateItem = useCallback(async (id: string, data: Partial<CreateFeatureItemDto>): Promise<FeatureSection['items'][0] | null> => {
    try {
      const updatedItem = await featureItemApi.update(id, data);
      setFeatureSections(prev => 
        prev.map(section => ({
          ...section,
          items: section.items.map(item => 
            item.id === id ? updatedItem : item
          )
        }))
      );
      toast.success('تم تحديث الميزة بنجاح');
      return updatedItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(message === 'Network error' ? 'فشل في تحديث الميزة' : message);
      return null;
    }
  }, []);

  // Delete a feature item
  const deleteItem = useCallback(async (sectionId: string, itemId: string): Promise<boolean> => {
    try {
      await featureItemApi.delete(itemId);
      setFeatureSections(prev => 
        prev.map(section => 
          section.id === sectionId 
            ? { ...section, items: section.items.filter(item => item.id !== itemId) }
            : section
        )
      );
      toast.success('تم حذف الميزة بنجاح');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message === 'Network error' ? 'فشل في حذف الميزة' : message);
      return false;
    }
  }, []);

  // Reorder feature items within a section
  const reorderItems = useCallback(async (sectionId: string, itemIds: string[]): Promise<boolean> => {
    try {
      await featureItemApi.reorder(sectionId, itemIds);
      // Optimistic update already done in UI
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder items';
      toast.error(message === 'Network error' ? 'فشل في اعادة ترتيب الميزات' : message);
      // Revert by refetching
      fetchFeatureSections();
      return false;
    }
  }, [fetchFeatureSections]);

  return {
    featureSections,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false;
      fetchFeatureSections();
    },
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
}