import axios from "axios";

interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

/* ───────────────────────────────
   TOKEN HELPERS
─────────────────────────────── */
const getToken = () => localStorage.getItem("accessToken");

const setToken = (token: string | null) => {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
};

/* ───────────────────────────────
   REQUEST INTERCEPTOR
─────────────────────────────── */
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ───────────────────────────────
   REFRESH LOGIC
─────────────────────────────── */
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

/* ───────────────────────────────
   RESPONSE INTERCEPTOR
─────────────────────────────── */
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
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.data.accessToken;

        setToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        setToken(null);

        // only redirect if user is on protected page
        const PROTECTED_ROUTES = [
          "/account",
          "/orders",
          "/wishlist",
          "/checkout",
          "/cart",
          "/admin",
        ];

        const isProtected = PROTECTED_ROUTES.some((route) =>
          window.location.pathname.startsWith(route)
        );

        if (isProtected) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
