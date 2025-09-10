import axios from 'axios';
import { useAuthStore } from '../store/auth';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: false // ถ้าใช้ cookie refresh token ให้เปลี่ยนเป็น true
});


// Request Interceptor → แนบ Access Token ทุกครั้ง
api.interceptors.request.use(config => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// Response Interceptor → ถ้า Access Token หมดอายุ ให้ refresh อัตโนมัติ
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const auth = useAuthStore();

    // ถ้า 401 และยังไม่ retry
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (auth.refreshToken) {
        if (isRefreshing) {
          // รอให้ refresh เสร็จก่อน
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newTokens = await auth.refreshAccess(); // เรียก action ใน Pinia
          processQueue(null, newTokens.accessToken);
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          auth.logout();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        auth.logout();
      }
    }

    return Promise.reject(err);
  }
);

export default api;