'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { carBrandsApi } from '../lib/api/car-brands';
import { CarBrand, CarBrandModel, CreateBrandDto, CreateModelDto } from '../lib/api-client';
import toast from 'react-hot-toast';

export function useCarBrands() {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent duplicate fetches in StrictMode
  const hasFetchedRef = useRef(false);

  const fetchBrands = useCallback(async () => {
    // Skip if already fetched (prevents double fetch in StrictMode)
    if (hasFetchedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await carBrandsApi.getAll();
      setBrands(data);
      hasFetchedRef.current = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch brands';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const createBrand = useCallback(async (data: CreateBrandDto): Promise<CarBrand | null> => {
    try {
      const newBrand = await carBrandsApi.create(data);
      setBrands(prev => [...prev, newBrand]);
      toast.success('تم اضافة الماركة بنجاح');
      return newBrand;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create brand';
      toast.error(message);
      return null;
    }
  }, []);

  const updateBrand = useCallback(async (id: string, data: Partial<CreateBrandDto>): Promise<CarBrand | null> => {
    try {
      const updatedBrand = await carBrandsApi.update(id, data);
      setBrands(prev => prev.map(brand => brand.id === id ? updatedBrand : brand));
      toast.success('تم تحديث الماركة بنجاح');
      return updatedBrand;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update brand';
      toast.error(message);
      return null;
    }
  }, []);

  const deleteBrand = useCallback(async (id: string): Promise<boolean> => {
    try {
      await carBrandsApi.delete(id);
      setBrands(prev => prev.filter(brand => brand.id !== id));
      toast.success('تم حذف الماركة بنجاح');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete brand';
      toast.error(message);
      return false;
    }
  }, []);

  const reorderBrands = useCallback(async (brandIds: string[]): Promise<boolean> => {
    try {
      await carBrandsApi.reorder(brandIds);
      // Update local state with new order
      setBrands(prev => {
        const reordered = brandIds.map(id => prev.find(brand => brand.id === id)!).filter(Boolean);
        return reordered;
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder brands';
      toast.error(message);
      return false;
    }
  }, []);

  const createModel = useCallback(async (brandId: string, data: CreateModelDto): Promise<CarBrandModel | null> => {
    try {
      const newModel = await carBrandsApi.createModel(brandId, data);
      setBrands(prev => prev.map(brand => {
        if (brand.id === brandId) {
          return { ...brand, models: [...brand.models, newModel] };
        }
        return brand;
      }));
      toast.success('تم اضافة الموديل بنجاح');
      return newModel;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create model';
      toast.error(message);
      return null;
    }
  }, []);

  const updateModel = useCallback(async (brandId: string, modelId: string, data: Partial<CreateModelDto>): Promise<CarBrandModel | null> => {
    try {
      const updatedModel = await carBrandsApi.updateModel(modelId, data);
      setBrands(prev => prev.map(brand => {
        if (brand.id === brandId) {
          return {
            ...brand,
            models: brand.models.map(model => model.id === modelId ? updatedModel : model)
          };
        }
        return brand;
      }));
      toast.success('تم تحديث الموديل بنجاح');
      return updatedModel;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update model';
      toast.error(message);
      return null;
    }
  }, []);

  const deleteModel = useCallback(async (brandId: string, modelId: string): Promise<boolean> => {
    try {
      await carBrandsApi.deleteModel(modelId);
      setBrands(prev => prev.map(brand => {
        if (brand.id === brandId) {
          return {
            ...brand,
            models: brand.models.filter(model => model.id !== modelId)
          };
        }
        return brand;
      }));
      toast.success('تم حذف الموديل بنجاح');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete model';
      toast.error(message);
      return false;
    }
  }, []);

  const reorderModels = useCallback(async (brandId: string, modelIds: string[]): Promise<boolean> => {
    try {
      await carBrandsApi.reorderModels(brandId, modelIds);
      setBrands(prev => prev.map(brand => {
        if (brand.id === brandId) {
          const reorderedModels = modelIds
            .map(id => brand.models.find(model => model.id === id)!)
            .filter(Boolean);
          return { ...brand, models: reorderedModels };
        }
        return brand;
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder models';
      toast.error(message);
      return false;
    }
  }, []);

  return {
    brands,
    loading,
    error,
    refetch: () => {
      hasFetchedRef.current = false;
      fetchBrands();
    },
    createBrand,
    updateBrand,
    deleteBrand,
    reorderBrands,
    createModel,
    updateModel,
    deleteModel,
    reorderModels,
  };
}