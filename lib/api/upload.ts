import { apiClient } from '../api-client';

export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

interface UploadApiResponse {
  success: boolean;
  data: UploadResponse;
}

export const uploadApi = {
  uploadFile: async (file: File, type: 'icon' | 'car-image' | 'car-video' | 'brand-logo' | 'banner' = 'car-image'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app').replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    // 30 second timeout for uploads
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || `Upload failed: ${response.status}`);
      }

      const result: UploadApiResponse = await response.json();
      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Upload timed out. Please try again.');
        }
        // Mixed Content errors often appear as TypeError with no specific message
        if (error.message === 'Network error' || error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your connection or ensure HTTPS is used.');
        }
      }

      throw error;
    }
  },

  uploadMultiple: async (files: File[], type: 'icon' | 'car-image' | 'car-video' = 'car-image'): Promise<UploadResponse[]> => {
    const uploads = files.map(file => uploadApi.uploadFile(file, type));
    return Promise.all(uploads);
  },
};