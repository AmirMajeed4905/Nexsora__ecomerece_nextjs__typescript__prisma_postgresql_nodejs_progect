import axios from "axios";

type WindowWithToken = Window & { __accessToken?: string | null };

interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = (window as WindowWithToken).__accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) { prom.reject(error); } else { prom.resolve(token); }
  });
  failedQueue = [];
};

const PROTECTED_ROUTES = ["/account", "/orders", "/wishlist", "/checkout", "/cart", "/admin"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/refresh`,
          {}, { withCredentials: true }
        );
        const newAccessToken = res.data.data.accessToken;
        (window as WindowWithToken).__accessToken = newAccessToken;
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        (window as WindowWithToken).__accessToken = null;
        const isProtected = PROTECTED_ROUTES.some((route) =>
          window.location.pathname.startsWith(route)
        );
        if (isProtected) { window.location.href = "/login"; }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;