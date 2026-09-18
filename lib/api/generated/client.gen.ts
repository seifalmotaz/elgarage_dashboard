import type { paths } from './types.gen';

// Create a typed API client using fetch
export type ApiPaths = paths;

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export class ApiClientError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Base fetch wrapper that will be extended with auth middleware
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new ApiClientError(
      error.message || `HTTP error! status: ${response.status}`,
      response.status,
      error
    );
  }

  return response.json();
}
