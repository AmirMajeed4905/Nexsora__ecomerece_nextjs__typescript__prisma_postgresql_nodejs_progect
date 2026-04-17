"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";


export default function NavbarWrapper() {
  const [announcementVisible, setAnnouncementVisible] = useState<boolean>(true);
  const { user, logout } = useAuthStore();
const { cart } = useCartStore();

  return (
    <>
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="bg-gray-900 text-white text-center py-2 px-4 text-xs font-medium tracking-wide relative">
          ✨ Summer Sale — Up to <strong>70% Off</strong> on select items.{" "}
          <span className="underline cursor-pointer hover:no-underline">Shop Now</span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      <Navbar
        isLoggedIn={!!user}
        user={user ? { name: user.name, email: user.email, avatar: user.avatar } : null}
cartCount={cart?.itemCount || 0}
        onLogout={logout}
      />
    </>
  );
}