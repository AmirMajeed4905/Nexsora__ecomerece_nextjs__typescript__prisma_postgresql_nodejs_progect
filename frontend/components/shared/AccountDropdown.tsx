"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { User } from "./Navbar";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

interface AccountDropdownProps {
  isLoggedIn: boolean;
  user: User;
  onLogin: () => void;
  onLogout: () => void;
}

export default function AccountDropdown({ isLoggedIn, user, onLogin, onLogout }: AccountDropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
      >
        <UserIcon />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          style={{ animation: "dropDown 0.2s ease" }}
        >
          {isLoggedIn ? (
            <>
              {/* User Info */}
              <div className="px-4 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {[
                  { icon: "👤", label: "View Profile", href: "/profile" },
                  { icon: "📦", label: "My Orders", href: "/orders" },
                  { icon: "❤️", label: "Wishlist", href: "/wishlist" },
                  { icon: "⚙️", label: "Settings", href: "/settings" },
                ].map(item => (
                  <Link key={item.label} href={item.href}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-50 py-2">
                <button
                  onClick={() => { onLogout(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span>🚪</span><span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="px-4 pt-4 pb-3">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Welcome to Nexora</p>
                <p className="text-xs text-gray-400">Sign in to access your account</p>
              </div>
              <div className="px-4 pb-4 flex flex-col gap-2">
                <Link href="/login" onClick={() => { onLogin(); setOpen(false); }}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors text-center">
                  Sign In
                </Link>
                <Link href="/register"
                  className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-center">
                  Create Account
                </Link>
              </div>
              <div className="border-t border-gray-50 px-4 py-3">
                <button className="w-full flex items-center gap-2 justify-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <span>📦</span> Track My Order
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}