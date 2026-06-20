"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ButtonSpinner from "@/components/ui/ButtonSpinner";
import EmptyState from "@/components/ui/EmptyState";

// ── Component ──────────────────────────────────────────────────
export default function CartPage() {
  const { user, isInitialized } = useAuthStore(); // ← isInitialized use karo
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Auth initialize hone ka wait karo, phir user check karo
    if (isInitialized && user) {
      fetchCart();
    }
  }, [user, isInitialized, fetchCart]);

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart? This action cannot be undone.")) {
      return;
    }
    setIsClearing(true);
    await clearCart();
    setIsClearing(false);
  };

  // Auth initialize hone tak wait karo
  if (!isInitialized || isLoading) {
    return <LoadingSpinner message="Loading your cart..." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
        }
        title="Your cart is empty"
        message="Add some products to get started"
        actionHref="/products"
        actionLabel="Continue Shopping"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 text-sm mt-1">{cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={handleClearCart}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isClearing ? (
              <>
                <ButtonSpinner />
                Clearing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cart
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-2">
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-1">{item.product.category.name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.product.discountPrice ? (
                        <>
                          <span className="text-sm font-bold text-gray-900">${item.product.discountPrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 line-through">${item.product.price.toFixed(2)}</span>
                          <span className="text-xs font-semibold text-green-600">
                            Save ${(item.product.price - item.product.discountPrice).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">${item.product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 text-xs font-bold"
                        title={item.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        title={item.quantity >= item.product.stock ? "Out of stock" : "Increase quantity"}
                      >
                        +
                      </button>
                    </div>

                    {/* Price & Delete */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Subtotal</p>
                        <p className="text-sm font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items</span>
                  <span className="font-medium">{cart.itemCount}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Shipping</span>
                  <span className="font-medium">FREE</span>
                </div>
              </div>

              <div className="pt-4 pb-6 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">${cart.total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors mb-3"
              >
                Proceed to Checkout
              </button>
              <Link href="/products" className="block text-center py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Continue Shopping
              </Link>

              <div className="mt-6 p-3 bg-gray-50 rounded-lg flex items-start gap-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <div className="text-xs text-gray-600">
                  <p className="font-medium text-gray-900">Secure Checkout</p>
                  <p>Your data is encrypted and secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
      </div>
    </div>
  );
}
