"use client";

import Link from "next/link";
import { useState } from "react";

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const PinterestIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const socialLinks = [
  { icon: <InstagramIcon />, href: "#", label: "Instagram" },
  { icon: <TwitterIcon />, href: "#", label: "Twitter" },
  { icon: <FacebookIcon />, href: "#", label: "Facebook" },
  { icon: <YoutubeIcon />, href: "#", label: "YouTube" },
  { icon: <PinterestIcon />, href: "#", label: "Pinterest" },
];

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "#" },
      { label: "Best Sellers", href: "#" },
      { label: "Sale & Offers", href: "#" },
      { label: "All Categories", href: "#" },
      { label: "Trending Now", href: "#" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Profile", href: "#" },
      { label: "My Orders", href: "#" },
      { label: "Wishlist", href: "#" },
      { label: "Track Order", href: "#" },
      { label: "Returns", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Affiliates", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Shipping Policy", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">

      {/* Newsletter Strip */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white font-bold text-xl tracking-tight">
                Get 10% off your first order ✨
              </p>
              <p className="text-zinc-500 text-sm mt-1">
                Subscribe for exclusive deals, new arrivals and style tips.
              </p>
            </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
  <input
    type="email"
    value={email}
    onChange={e => setEmail(e.target.value)}
    placeholder="Enter your email address"
    className="w-full md:w-72 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm outline-none placeholder-zinc-600 focus:border-rose-500 transition-colors"
  />
  <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-colors whitespace-nowrap">
    Subscribe
  </button>
</div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">

          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/">
              <span
                className="text-3xl font-black tracking-tighter text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                nexora<span className="text-rose-500">.</span>
              </span>
            </Link>

            <p className="text-zinc-500 text-sm mt-4 leading-relaxed max-w-xs">
              Curated essentials for modern living. Premium products delivered to your door with care and speed.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-col gap-2.5 mt-5">
              {[
                { icon: "🚚", text: "Free Shipping on orders $50+" },
                { icon: "↩️", text: "30-Day hassle-free returns" },
                { icon: "🔒", text: "100% Secure Checkout" },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-2">
                  <span className="text-sm">{b.icon}</span>
                  <span className="text-zinc-500 text-sm">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex gap-2 mt-6">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white hover:border-rose-500 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map(col => (
            <div key={col.title}>
              <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-zinc-500 text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download */}
        {/* <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 border-t border-b border-zinc-800">
          <div>
            <p className="text-white font-bold text-sm">Shop on the go 📱</p>
            <p className="text-zinc-500 text-xs mt-1">Download the Nexora app for exclusive mobile deals</p>
          </div>
          <div className="flex gap-3">
            {[
              { emoji: "🍎", line1: "Download on the", line2: "App Store" },
              { emoji: "▶️", line1: "Get it on", line2: "Google Play" },
            ].map(app => (
              <a
                key={app.line2}
                href="#"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors"
              >
                <span className="text-2xl">{app.emoji}</span>
                <div>
                  <p className="text-zinc-500 text-xs">{app.line1}</p>
                  <p className="text-white text-sm font-bold">{app.line2}</p>
                </div>
              </a>
            ))}
          </div>
        </div> */}

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8">
          <p className="text-zinc-600 text-sm">
            © 2025 Nexora. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-zinc-600 text-sm">
            <span>🌍</span>
            <span>Pakistan · PKR</span>
            <span className="text-zinc-800 mx-1">|</span>
            <span>English</span>
          </div>
        </div>

      </div>
    </footer>
  );
}