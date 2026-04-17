"use client";

import { useEffect, useRef } from "react";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <span className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, categories..."
            className="flex-1 text-lg outline-none text-gray-800 placeholder-gray-300"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
            Popular Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {["Summer Dress", "Leather Bag", "Minimalist Watch", "Sneakers", "Sunglasses"].map(t => (
              <span key={t}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 cursor-pointer transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}