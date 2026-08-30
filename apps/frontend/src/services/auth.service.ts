import { apiFetch } from './api';
import { RegisterDTO, LoginDTO, UserProfile } from '@app/shared';

export const authService = {
  async register(data: RegisterDTO) {
    return apiFetch<{ user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginDTO) {
    return apiFetch<{ user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    return apiFetch('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe() {
    return apiFetch<{ user: UserProfile }>('/auth/me', {
      method: 'GET',
    });
  },
};
