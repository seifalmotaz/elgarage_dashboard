'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminCarsApi } from '../lib/api/admin-cars';
import type { AvailableInspection, InspectionDetails } from '../lib/api/admin-cars';
import toast from 'react-hot-toast';

interface UseAvailableInspectionsReturn {
  inspections: AvailableInspection[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredInspections: AvailableInspection[];
  refetch: () => void;
}

export function useAvailableInspections(): UseAvailableInspectionsReturn {
  const [inspections, setInspections] = useState<AvailableInspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use ref to prevent duplicate fetches in StrictMode
  const hasFetchedRef = useRef(false);

  const fetchInspections = useCallback(async () => {
    // Skip if already fetched (prevents double fetch in StrictMode)
    if (hasFetchedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await adminCarsApi.getAvailableInspections();
      setInspections(data);
      hasFetchedRef.current = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في تحميل الفحوصات';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Filter inspections by search term (brand, model, year, user name)
  const filteredInspections = searchTerm.trim() === ''
    ? inspections
    : inspections.filter((inspection) => {
        const searchLower = searchTerm.toLowerCase();
        const brandMatch = inspection.brand.toLowerCase().includes(searchLower);
        const modelMatch = inspection.model.toLowerCase().includes(searchLower);
        const yearMatch = inspection.year.toString().includes(searchLower);
        const userMatch = `${inspection.user.firstName} ${inspection.user.lastName}`.toLowerCase().includes(searchLower);
        
        return brandMatch || modelMatch || yearMatch || userMatch;
      });

  return {
    inspections,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filteredInspections,
    refetch: () => {
      hasFetchedRef.current = false;
      fetchInspections();
    },
  };
}

// Export types for reuse
export type { AvailableInspection, InspectionDetails };