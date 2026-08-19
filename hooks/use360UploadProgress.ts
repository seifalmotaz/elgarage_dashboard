'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ProgressSession {
  carId: string;
  adminId: string;
  status: 'uploading' | 'extracting' | 'complete' | 'error';
  progress: number;
  totalFrames?: number;
  error?: string;
}

interface UploadState {
  phase: 'idle' | 'uploading' | 'extracting' | 'complete' | 'error';
  progress: number;
  totalFrames?: number;
  error?: string;
  isUploading: boolean;
}

interface Use360UploadProgressReturn extends UploadState {
  uploadFile: (file: File) => Promise<{ totalFrames: number }>;
  cancelUpload: () => void;
  reset: () => void;
}

const initialState: UploadState = {
  phase: 'idle',
  progress: 0,
  totalFrames: undefined,
  error: undefined,
  isUploading: false,
};

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const WARN_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const VALID_FILE_TYPES = ['.zip'];
const SSE_MAX_RETRIES = 3;

function validateFile(file: File): { valid: boolean; error?: string } {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!VALID_FILE_TYPES.includes(ext)) {
    return { valid: false, error: 'يرجى رفع ملف ZIP صالح' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'الملف كبير جداً. الحد الأقصى 2 جيجابايت' };
  }

  return { valid: true };
}

export function use360UploadProgress(carId: string): Use360UploadProgressReturn {
  const [state, setState] = useState<UploadState>(initialState);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleError = useCallback((message: string) => {
    setState({
      phase: 'error',
      progress: 0,
      error: message,
      isUploading: false,
    });
    toast.error(message);
  }, []);

  const connectToSSE = useCallback((sessionId: string) => {
    const token = localStorage.getItem('adminToken');
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app').replace(/\/+$/, '').replace(/\/api\/v1$/, '');

    let retryCount = 0;
    let eventSource: EventSource | null = null;

    const connect = () => {
      // Pass token as query param for EventSource (can't send headers)
      const url = `${API_BASE_URL}/api/v1/admin/cars/${carId}/360-view/progress/${sessionId}?token=${encodeURIComponent(token || '')}`;
      eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onerror = () => {
        retryCount++;
        if (retryCount <= SSE_MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Reconnecting SSE (attempt ${retryCount}/${SSE_MAX_RETRIES})...`);
          setTimeout(() => {
            if (eventSource) {
              eventSource.close();
            }
            connect();
          }, delay);
        } else {
          handleError('فشل في الاتصال. يرجى المحاولة مرة أخرى');
          eventSource?.close();
          eventSourceRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        retryCount = 0;

        try {
          const data: ProgressSession = JSON.parse(event.data);

          if (data.status === 'complete') {
            setState({
              phase: 'complete',
              progress: 100,
              totalFrames: data.totalFrames,
              isUploading: false,
            });
            eventSource?.close();
            eventSourceRef.current = null;
          } else if (data.status === 'error') {
            handleError(data.error || 'حدث خطأ');
            eventSource?.close();
            eventSourceRef.current = null;
          } else {
            setState({
              phase: 'extracting',
              progress: data.progress,
              isUploading: true,
            });
          }
        } catch (err) {
          console.error('Failed to parse SSE data:', err);
        }
      };
    };

    connect();
  }, [carId, handleError]);

  const uploadFile = useCallback(async (file: File): Promise<{ totalFrames: number }> => {
    const validation = validateFile(file);
    if (!validation.valid) {
      handleError(validation.error!);
      return Promise.reject(new Error(validation.error));
    }

    if (file.size > WARN_FILE_SIZE) {
      console.warn('Large file detected. Upload may take longer.');
    }

    if (xhrRef.current && state.isUploading) {
      xhrRef.current.abort();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setState({
            phase: 'uploading',
            progress,
            isUploading: true,
          });
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            const sessionId = response.data.sessionId;
            const totalFrames = response.data.totalFrames || 0;

            setState(prev => ({
              ...prev,
              totalFrames,
            }));

            resolve({ totalFrames });
            connectToSSE(sessionId);
          } catch (err) {
            handleError('فشل في تحليل الاستجابة');
            reject(err);
          }
        } else {
          handleError(xhr.statusText || 'فشل الرفع');
          reject(new Error(xhr.statusText));
        }
      });

      xhr.addEventListener('error', () => {
        handleError('فشل الاتصال بالخادم');
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        setState({ phase: 'idle', progress: 0, isUploading: false });
        reject(new Error('Upload cancelled'));
      });

      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://main-backend-njndy.ondigitalocean.app').replace(/\/+$/, '').replace(/\/api\/v1$/, '');

      xhr.open('POST', `${API_BASE_URL}/api/v1/admin/cars/${carId}/360-view`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  }, [carId, connectToSSE, handleError, state.isUploading]);

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState({ phase: 'idle', progress: 0, isUploading: false });
  }, []);

  const reset = useCallback(() => {
    cancelUpload();
    setState(initialState);
  }, [cancelUpload]);

  useEffect(() => {
    return () => {
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    uploadFile,
    cancelUpload,
    reset,
  };
}