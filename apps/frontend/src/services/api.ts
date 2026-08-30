import { ApiResponse } from '@app/shared';

const API_BASE = '/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Essential for HttpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok && !data.error) {
      return {
        success: false,
        error: `HTTP Error ${res.status}: ${res.statusText}`,
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Lỗi kết nối mạng đến máy chủ',
    };
  }
}
