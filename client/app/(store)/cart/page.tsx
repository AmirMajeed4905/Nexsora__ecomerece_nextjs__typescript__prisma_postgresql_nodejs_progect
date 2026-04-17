"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import  CheckoutModal from "@/components/checkout/CheckoutModal";
// ── Address Form Schema ────────────────────────────────────────
interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const defaultAddress: Address = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Pakistan",
};

// ── Component ──────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState<Address>(defaultAddress);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  // Pre-fill name from user
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    // Validate address
    const required = ["fullName", "phone", "street", "city", "state", "postalCode", "country"] as const;
    for (const field of required) {
      if (!address[field]) {
        toast.error(`${field.replace(/([A-Z])/g, " $1")} is required`);
        return;
      }
    }

    setIsPlacingOrder(true);
    try {
      const res = await api.post("/api/orders", { address });
      toast.success("Order placed successfully! 🎉");
      router.push(`/orders/${res.data.data.order.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some products to get started</p>
          <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Shopping Cart <span className="text-gray-400 font-normal text-lg">({cart.itemCount} items)</span>
          </h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 transition-colors">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
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
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product.category.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.product.discountPrice ? (
                      <>
                        <span className="text-sm font-bold text-gray-900">${item.product.discountPrice}</span>
                        <span className="text-xs text-gray-400 line-through">${item.product.price}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">${item.product.price}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-40"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">${item.subtotal.toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </button>
              <Link href="/" className="block text-center text-sm text-gray-500 hover:text-gray-900 transition-colors mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
{showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
        {/* Checkout Modal */}
        
        {/* {showCheckout && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                  <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Full Name", key: "fullName", placeholder: "Amir Majeed" },
                    { label: "Phone Number", key: "phone", placeholder: "+92 300 1234567" },
                    { label: "Street Address", key: "street", placeholder: "123 Main Street" },
                    { label: "City", key: "city", placeholder: "Lahore" },
                    { label: "State / Province", key: "state", placeholder: "Punjab" },
                    { label: "Postal Code", key: "postalCode", placeholder: "54000" },
                    { label: "Country", key: "country", placeholder: "Pakistan" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={address[key as keyof Address]}
                        onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 mt-6 pt-4">
                  <div className="flex justify-between font-bold text-gray-900 mb-4">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60"
                  >
                    {isPlacingOrder ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Placing Order...
                      </span>
                    ) : "Place Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}  */}
      </div>
    </div>
  );
}