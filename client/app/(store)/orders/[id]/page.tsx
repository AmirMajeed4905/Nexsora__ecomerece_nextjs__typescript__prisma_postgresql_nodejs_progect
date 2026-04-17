"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────
interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    discountPrice: number | null;
  };
}

interface Order {
  id: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  address: Address;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// ── Status Config ──────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700", step: 0 },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-700", step: 1 },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-700", step: 2 },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-700", step: 3 },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700", step: -1 },
};

const STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

// ── Component ──────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data.data.order);
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await api.patch(`/api/orders/${order.id}/cancel`);
      setOrder((prev) => prev ? { ...prev, status: "CANCELLED" } : null);
      toast.success("Order cancelled successfully");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900">← Back to Orders</Link>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status];
  const currentStep = config.step;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← My Orders
          </Link>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">{order.id}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* Progress Bar (only for non-cancelled) */}
        {order.status !== "CANCELLED" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 z-0">
                <div
                  className="h-full bg-gray-900 transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
              {STEPS.map((step, index) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    index <= currentStep
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {index < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center hidden sm:block">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="text-sm font-semibold text-gray-900 hover:text-gray-600 line-clamp-1">
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">${item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                <p>{order.address.country}</p>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-3">Order Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Placed on</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-900">Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            {["PENDING", "PROCESSING"].includes(order.status) && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}