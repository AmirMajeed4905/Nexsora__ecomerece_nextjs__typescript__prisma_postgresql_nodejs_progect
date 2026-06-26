"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Client-side route guard. AuthProvider (wrapping the whole app in
// layout.tsx) already calls /api/auth/refresh + /api/auth/me on load and
// sets isInitialized once that finishes. This component just waits for
// that, then redirects to /login if there's no user.
//
// Why this instead of (or in addition to) middleware.ts: middleware runs
// at the edge and decides access based on reading the refreshToken cookie
// directly from the request — which depends on the cookie reliably
// reaching Vercel's edge runtime on every request. In a cross-domain setup
// (frontend on Vercel, backend on Render), that's an extra point of
// failure. Checking auth via an actual API call (withCredentials: true)
// is more direct: if the browser has a valid cookie, the API call
// succeeds; if not, it fails and we redirect. No reliance on the edge
// runtime correctly reading cross-site cookies.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/login");
    }
  }, [isInitialized, user, router]);

  // Still checking auth, or no user (about to redirect) — show a spinner
  // either way so a logged-out user never briefly sees protected content.
  if (!isInitialized || !user) {
    return <LoadingSpinner message="Checking access..." />;
  }

  return <>{children}</>;
}
