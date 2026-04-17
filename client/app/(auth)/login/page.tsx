"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

// ── Zod Schema ─────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

// ── Component ──────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post("/api/auth/login", data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <span className="text-3xl font-black tracking-tighter text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                nexora<span className="text-rose-400">.</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Welcome back! Sign in to continue.</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Google OAuth */}
            <button className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-6">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all placeholder-gray-300"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all placeholder-gray-300 pr-16"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors text-xs font-medium">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-gray-900 hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}