"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setInitialized } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const restoreAuth = async () => {
      try {
        // The browser automatically sends the refreshToken cookie with
        // this request (withCredentials: true in lib/axios.ts). On
        // success the backend sets a fresh accessToken cookie — there's
        // nothing to read from the response body and store manually.
        await api.post("/api/auth/refresh");

        // Now the accessToken cookie is set, so this call is authenticated.
        const meRes = await api.get("/api/auth/me");
        const { user } = meRes.data.data;
        setAuth(user); // setAuth already sets isInitialized = true
      } catch {
        // Refresh failed or no refresh token present — user is a guest.
        setInitialized();
      }
    };

    restoreAuth();
  }, [setAuth, setInitialized]);

  return <>{children}</>;
}
