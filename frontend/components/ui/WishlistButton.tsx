"use client";

import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "full";
  className?: string;
}

export default function WishlistButton({
  productId,
  variant = "icon",
  className = "",
}: WishlistButtonProps) {
  const { user } = useAuthStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save items");
      return;
    }

    await toggleWishlist(productId);
  };

  if (variant === "full") {
    return (
      <button
        onClick={handleToggle}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
          wishlisted
            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
            : "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        } ${className}`}
      >
        <svg
          className="w-4 h-4"
          fill={wishlisted ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {wishlisted ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        wishlisted
          ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
          : "bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white hover:text-rose-500 shadow-sm"
      } ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill={wishlisted ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}