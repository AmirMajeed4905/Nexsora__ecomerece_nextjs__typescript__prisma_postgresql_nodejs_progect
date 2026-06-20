import axios from "axios";

interface QueueItem {
  resolve: () => void;
  reject: (error: unknown) => void;
}

// withCredentials: true is the only thing needed for auth now — the
// access token lives in an httpOnly cookie that the browser attaches to
// every request automatically. There's no token for JS to read or send
// manually, which is the whole point: it can't be stolen via XSS the way
// a localStorage token could be.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const PROTECTED_ROUTES = ["/account", "/orders", "/wishlist", "/checkout", "/cart", "/admin"];

// ── Response Interceptor: Handle 401 and Token Refresh ─────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while a refresh is already in flight — once
        // it resolves, every queued request just gets retried; the new
        // accessToken cookie is already set by the browser at that point,
        // no token needs to be passed around manually.
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // This call carries the refreshToken cookie and gets a fresh
        // accessToken cookie back — both handled by the browser, nothing
        // to read from the response body.
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // Redirect to login if on a protected route
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
