import { ApiResponse } from '@app/shared';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

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
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, config);
    const text = await res.text();

    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `Lỗi máy chủ (${res.status}): Không thể xử lý yêu cầu`,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Phản hồi từ máy chủ không đúng định dạng JSON',
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
