"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const restoreAuth = async () => {
      try {
        const res = await api.post("/api/auth/refresh");
        const { accessToken } = res.data.data;
        (window as Window & { __accessToken?: string }).__accessToken = accessToken;
        const meRes = await api.get("/api/auth/me");
        const { user } = meRes.data.data;
        setAuth(user, accessToken);
      } catch {
        // Guest user
      }
    };

    restoreAuth();
  }, [setAuth]);

  return <>{children}</>;
}