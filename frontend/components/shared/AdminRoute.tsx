"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Same client-side-check approach as ProtectedRoute, but also enforces
// role === "ADMIN" — the old middleware.ts did both checks for /admin/*
// routes (redirect to /login if not authenticated, redirect to / if
// authenticated but not an admin). This preserves that behavior now that
// middleware-based route protection has been replaced.
export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || !user || user.role !== "ADMIN") {
    return <LoadingSpinner message="Checking access..." />;
  }

  return <>{children}</>;
}
