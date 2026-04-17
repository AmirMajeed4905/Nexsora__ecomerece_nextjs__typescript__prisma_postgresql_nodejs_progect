"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchOverlay from "./SearchOverlay";

// ── Icons ──────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
  </svg>
);
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── Types ──────────────────────────────────────────────────────
export interface User {
  name: string;
  email: string;
  avatar?: string | null;
}

interface NavbarProps {
  isLoggedIn: boolean;
  user: User | null;
  cartCount: number;
  onLogout: () => void;
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Accessories", href: "/accessories" },
  { name: "Sale", href: "/sale" },
];
// ── Component ──────────────────────────────────────────────────
export default function Navbar({ isLoggedIn, user, cartCount, onLogout }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeLink, setActiveLink] = useState<string>("Home");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState<boolean>(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100"
        style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Mobile: Hamburger */}
            <button className="md:hidden text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black tracking-tighter text-gray-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                nexora<span className="text-rose-400">.</span>
              </span>
            </Link>

            {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
  {navLinks.map(link => (
    <Link
      key={link.name} // ✅ string
      href={link.href} // ✅ correct route
      onClick={() => setActiveLink(link.name)} // ✅ string
      className="relative px-4 py-2 text-sm font-medium transition-colors rounded-lg"
      style={{
        color: activeLink === link.name ? "#111" : "#6b7280", // ✅ compare string
        background: activeLink === link.name ? "#f4f4f5" : "transparent",
      }}
    >
      {link.name} {/* ✅ text */}
      
      {link.name === "Sale" && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full" />
      )}
    </Link>
  ))}
</nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-700">
                <SearchIcon />
              </button>
              <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-700">
                <HeartIcon />
              </button>

              {/* Account Button */}
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors overflow-hidden"
                >
                  {isLoggedIn && user?.avatar ? (
                    <Image
                      src={user?.avatar || '/placeholder.png'}
                      alt={user?.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />) : isLoggedIn && user ? (
                      <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </button>

                {/* Dropdown */}
                {accountDropdownOpen && (
                  <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    {isLoggedIn && user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/account"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          My Profile
                        </Link>
                        <Link href="/orders"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          My Orders
                        </Link>
                        <Link href="/wishlist"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          Wishlist
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { onLogout(); setAccountDropdownOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/login"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                          Sign In
                        </Link>
                        <Link href="/register"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-700 ml-1">
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 pb-5">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => { setActiveLink(link.name); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                >
                  {link.name}
                  {link.name === "Sale" && (
                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">Hot</span>
                  )}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-3 pt-3 px-4">
                {isLoggedIn && user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <div className="flex gap-3 mt-0.5">
                        <Link href="/account" className="text-xs text-gray-500 hover:text-gray-900">Profile</Link>
                        <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-xs text-red-500">Logout</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login"
                      className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold text-center">
                      Sign In
                    </Link>
                    <Link href="/register"
                      className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold text-center">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}