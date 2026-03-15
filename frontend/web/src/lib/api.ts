import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// internal Next.js API routes
export const internalApi = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    internalApi.post('/api/auth/login', data),

  logout: () => internalApi.post('/api/auth/logout'),

  me: () => internalApi.get('/api/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  verifyEmail: (token: string) =>
    api.get('/auth/verify-email', { params: { token } }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),

  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    internalApi.patch('/api/profile', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return internalApi.post('/api/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
