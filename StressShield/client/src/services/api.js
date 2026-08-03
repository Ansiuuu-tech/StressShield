import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const refreshToken = localStorage.getItem('refreshToken');
    if (
      error.response?.status !== 401 ||
      request?._retry ||
      request?.url?.includes('/auth/refresh') ||
      request?.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const response = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        request.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(request);
      }
    } catch (refreshError) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return Promise.reject(refreshError);
    }
  }
);

export default api;