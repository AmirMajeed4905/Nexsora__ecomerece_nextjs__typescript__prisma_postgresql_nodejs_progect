import { create } from "zustand";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean; // Has the initial auth-restore check finished?

  // Actions
  setAuth: (user: User) => void;
  setInitialized: () => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────
// No token of any kind lives here anymore. Both the access token and
// refresh token are httpOnly cookies the browser manages and sends
// automatically (see lib/axios.ts's withCredentials: true) — this store
// only ever holds the logged-in user's profile data.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  // Set user after login/register — the accessToken/refreshToken cookies
  // were already set by the backend response itself.
  setAuth: (user) => {
    set({ user, isInitialized: true });
  },

  // Mark auth as initialized (even if not logged in)
  setInitialized: () => set({ isInitialized: true }),

  // Logout — backend clears the cookies; we just clear local state
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Logout from server failed, but still clear locally
    } finally {
      set({ user: null });
      window.location.href = "/";
    }
  },

  // Fetch current user (relies on the accessToken cookie being valid)
  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/api/auth/me");
      set({ user: res.data.data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
