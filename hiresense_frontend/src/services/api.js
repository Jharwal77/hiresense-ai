import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});

let refreshRequest = null;

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  window.dispatchEvent(new Event('hiresense:auth-cleared'));
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isAuthRequest = String(request?.url || '').includes('/auth/');

    if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      clearAuthStorage();
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = api.post('/auth/refresh', { refreshToken }).then((response) => response.data?.data || {});
      }

      const tokens = await refreshRequest;

      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Invalid token refresh response.');
      }

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      request.headers = request.headers || {};
      request.headers.Authorization = `Bearer ${tokens.accessToken}`;

      return api(request);
    } catch (refreshError) {
      clearAuthStorage();
      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  }
);

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload);
  const { accessToken, refreshToken, user } = response.data.data || {};

  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (user) localStorage.setItem('userRole', user.role || 'candidate');

  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const fetchCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    clearAuthStorage();
  }
};

export const fetchJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data?.data?.jobs || [];
};

export const fetchJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data?.data?.job || null;
};

export const applyToJob = async (jobId) => {
  const response = await api.post(`/jobs/${jobId}/apply`);
  return response.data;
};

export default api;
