"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function NavbarWrapper() {
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();

  return (
    <>
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="bg-linear-to-r from-gray-900 to-black text-white text-center py-2.5 px-4 text-sm font-medium tracking-wide relative overflow-hidden">
          ✨ Summer Sale — Up to <strong>70% OFF</strong> on selected items.{" "}
          <span className="underline cursor-pointer hover:no-underline">Shop Now</span>

          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xl leading-none opacity-70 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      )}

      <Navbar
        isLoggedIn={!!user}
        user={user ? {
          name: user.name,
          email: user.email,
          avatar: user.avatar
        } : null}
        cartCount={cart?.uniqueItemCount || 0}
        onLogout={logout}
      />
    </>
  );
}