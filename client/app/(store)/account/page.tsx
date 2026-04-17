"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

export default function AccountPage() {
    const router = useRouter();
    const { user, setAuth, logout } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // ── Avatar Upload ────────────────────────────────────────────
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await api.put("/api/auth/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const { user: updatedUser } = res.data.data;
            // Update store with new avatar
            if (user) {
                setAuth(
                    { ...user, avatar: updatedUser.avatar },
                    (window as Window & { __accessToken?: string }).__accessToken || ""
                );
            }
            toast.success("Avatar updated!");
        } catch {
            toast.error("Failed to update avatar");
        } finally {
            setIsUploading(false);
        }
    };

    // ── Delete Account ───────────────────────────────────────────
    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete("/api/auth/account");
            toast.success("Account deleted");
            await logout();
            router.push("/");
        } catch {
            toast.error("Failed to delete account");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your profile and account settings</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
                        <div className="flex items-center gap-6 mb-8">

                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200">
                                    {user.avatar ? (
<Image 
  src={user.avatar} 
  alt={user.name} 
  width={200} 
  height={200} 
  className="rounded-full object-cover"
/>                                   ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-60"
                                >
                                    {isUploading ? (
                                        <svg className="w-3 h-3 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            {/* User Info */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                                <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === "ADMIN"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Info Fields */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Full Name</span>
                                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Email Address</span>
                                <span className="text-sm font-semibold text-gray-900">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Account Type</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {user.googleId ? "Google Account" : "Email & Password"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-gray-500">Member Since</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Account Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => logout()}
                                className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-red-600 mb-1">Danger Zone</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Once you delete your account, there is no going back. All your data will be permanently removed.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="py-2.5 px-5 border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Delete Account
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="py-2.5 px-5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                                >
                                    {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="py-2.5 px-5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}