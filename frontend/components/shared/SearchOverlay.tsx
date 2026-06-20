"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearch } from "@/hooks/useSearch";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m10-10H2" />
  </svg>
);

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;     // ← Fixed: null allowed
  images?: string[];
  category?: {
    name: string;
  };
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const { results, isLoading, search, clear } = useSearch();
  const [showSuggestions, setShowSuggestions] = useState(true);

  const popularSearches = [
    "Summer Dress", "Wireless Headphones", "Leather Jacket", "Smart Watch",
    "Sneakers", "Denim Jeans", "Handbag", "Sunglasses", "Running Shoes",
  ];

  // ==================== Reset when overlay opens ====================
  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");                    // These are acceptable here
    setShowSuggestions(true);
    clear();
  }, [open, clear]);

  // ==================== Search Logic ====================
  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSuggestions(true);
      clear();
      return;
    }

    setShowSuggestions(false);

    const timer = setTimeout(() => {
      search(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, search, clear]);

  const handleSuggestedSearch = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  const handleResultClick = useCallback(() => {
    setQuery("");
    setShowSuggestions(true);
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, brands..."
            className="flex-1 text-lg outline-none placeholder-gray-400 text-gray-800"
          />

          {isLoading && <LoadingIcon />}

          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-6">
          {showSuggestions && !query.trim() && (
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-4">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSuggestedSearch(item)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors rounded-full text-sm text-gray-700 font-medium"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingIcon />
              <p className="text-gray-500 mt-4">Searching products...</p>
            </div>
          )}

          {query.trim() && !isLoading && results.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-gray-500 mt-2">Try different keywords or browse categories</p>
            </div>
          )}

          {query.trim() && !isLoading && results.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-4">
                Results ({results.length})
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((product: Product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleResultClick}
                    className="group flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-3xl">🛍️</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.category?.name || "Uncategorized"}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="font-bold text-lg">
                          ${product.discountPrice 
                            ? product.discountPrice.toFixed(2) 
                            : product.price.toFixed(2)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}