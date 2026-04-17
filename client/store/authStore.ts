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
  accessToken: string | null;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,

  // Set user + token after login/register
setAuth: (user, accessToken) => {
  (window as Window & { __accessToken?: string | null }).__accessToken = accessToken;
  set({ user, accessToken });
},

  // Logout — token clear 
  logout: async () => {
  try {
    await api.post("/api/auth/logout");
  } catch {
  } finally {
    (window as Window & { __accessToken?: string | null }).__accessToken = null;
    set({ user: null, accessToken: null });
    window.location.href = "/";  // ← yeh change karo
  }
},

  // Fetch current user — app start pe call karo
  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/api/auth/me");
      set({ user: res.data.data.user });
    } catch {
      set({ user: null, accessToken: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));