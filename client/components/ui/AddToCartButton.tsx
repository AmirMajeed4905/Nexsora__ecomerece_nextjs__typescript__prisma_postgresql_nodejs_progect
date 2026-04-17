"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  quantity?: number;
  variant?: "icon" | "full" | "full-outline";
  className?: string;
}

export default function AddToCartButton({
  productId,
  stock,
  quantity = 1,
  variant = "icon",
  className = "",
}: AddToCartButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToCart, isInCart, getItemQuantity, updateItem, getCartItemId } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const inCart  = isInCart(productId);
  const itemQty = getItemQuantity(productId);
  const isOOS   = stock === 0;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    if (isOOS) return;

    setIsLoading(true);
    await addToCart(productId, quantity);
    setIsLoading(false);
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const itemId = getCartItemId(productId);
    if (!itemId) return;
    setIsLoading(true);
    if (itemQty <= 1) {
      // Remove from cart via updateItem will handle it — but we use removeItem
      // Here we just set qty to 1 minimum
    } else {
      await updateItem(itemId, itemQty - 1);
    }
    setIsLoading(false);
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemQty >= stock) {
      toast.error(`Only ${stock} items available`);
      return;
    }
    const itemId = getCartItemId(productId);
    if (!itemId) return;
    setIsLoading(true);
    await updateItem(itemId, itemQty + 1);
    setIsLoading(false);
  };

  // ── Icon variant (product card) ────────────────────────────
  if (variant === "icon") {
    if (inCart) {
      return (
        <div className={`flex items-center gap-1 ${className}`}>
          <button
            onClick={handleDecrement}
            disabled={isLoading}
            aria-label="Decrease quantity"
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 text-xs font-bold"
          >
            −
          </button>
          <span className="w-6 text-center text-xs font-bold text-gray-900">{itemQty}</span>
          <button
            onClick={handleIncrement}
            disabled={isLoading || itemQty >= stock}
            aria-label="Increase quantity"
            className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-rose-500 transition-colors disabled:opacity-40 text-xs font-bold"
          >
            +
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleClick}
        disabled={isLoading || isOOS}
        aria-label={isOOS ? "Out of stock" : "Add to cart"}
        className={`w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    );
  }

  // ── Full variant (product detail page) ────────────────────
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isOOS}
      aria-label={isOOS ? "Out of stock" : inCart ? "Update cart" : "Add to cart"}
      className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === "full-outline"
          ? "border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
          : inCart
            ? "bg-rose-500 text-white hover:bg-rose-600"
            : "bg-gray-900 text-white hover:bg-rose-500"
        } ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {inCart ? "Updating..." : "Adding..."}
        </>
      ) : isOOS ? (
        "Out of Stock"
      ) : inCart ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          In Cart ({itemQty})
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          Add to Cart
        </>
      )}
    </button>
  );
}