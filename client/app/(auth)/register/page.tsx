"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

// ── Zod Schema ─────────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

// ── Password Strength ──────────────────────────────────────────
const getStrength = (p: string) => {
  if (!p) return { label: "", color: "bg-gray-200", width: "w-0" };
  if (p.length < 6) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
  if (p.length < 10) return { label: "Fair", color: "bg-yellow-400", width: "w-2/4" };
  if (!/[A-Z]/.test(p) || !/[0-9]/.test(p))
    return { label: "Good", color: "bg-blue-400", width: "w-3/4" };
  return { label: "Strong", color: "bg-green-400", width: "w-full" };
};

// ── Component ──────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });
  const strength = getStrength(password);

  // ── Avatar Handler ─────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // ── Submit ─────────────────────────────────────────────────
  const onSubmit = async (data: RegisterInput) => {
    try {
      // If avatar exists, use FormData; otherwise send JSON
      let res;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("avatar", avatarFile);
        res = await api.post("/api/auth/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const { confirmPassword: _confirmPassword, ...payload } = data;
        void _confirmPassword;
        res = await api.post("/api/auth/register", payload);
      }

      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Registration failed"
      );
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .avatar-ring { transition: box-shadow 0.2s ease; }
        .avatar-ring:hover { box-shadow: 0 0 0 3px #f43f5e40; }
      `}</style>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <span
                className="text-3xl font-black tracking-tighter text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                nexora<span className="text-rose-400">.</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">
              Create your account — it&apos;s free!
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* ── Avatar Upload ── */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {/* Avatar Circle */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="avatar-ring w-20 h-20 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-rose-300 transition-colors"
                  aria-label="Upload avatar"
                >
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      width={80}
                      height={80}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Camera badge */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center shadow-sm hover:bg-rose-500 transition-colors"
                  aria-label="Change avatar"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              {/* Avatar action text */}
              <div className="mt-2 text-center">
                {avatarPreview ? (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="text-xs text-red-400 hover:text-red-500 font-medium transition-colors"
                  >
                    Remove photo
                  </button>
                ) : (
                  <p className="text-xs text-gray-400">
                    Upload profile photo{" "}
                    <span className="text-gray-300">(optional · max 2MB)</span>
                  </p>
                )}
              </div>
            </div>

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
              <span className="text-xs text-gray-400 font-medium">or register with email</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Amir Majeed"
                  {...register("name")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all placeholder-gray-300"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    {...register("password")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all placeholder-gray-300 pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors text-xs font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}

                {/* Strength Bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Strength:{" "}
                      <span className="font-semibold text-gray-600">{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    {...register("confirmPassword")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all placeholder-gray-300 pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors text-xs font-medium"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-400 leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-gray-700 underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-gray-700 underline">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}