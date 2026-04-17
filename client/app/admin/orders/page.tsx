"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; slug: string; images: string[] };
}

interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-purple-100 text-purple-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get("/api/orders")
      .then((res) => setOrders(res.data.data.orders ?? []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      // ✅ Update status in list — don't remove, show as CANCELLED
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: "CANCELLED" } : o)
      );
      toast.success("Order cancelled");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">Your orders will appear here</p>
            <Link href="/products" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                    <p className="text-sm font-mono font-semibold text-gray-700">{order.id.slice(0, 16)}...</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Products preview */}
                <div className="flex items-center gap-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                  <div className="ml-1">
                    <p className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                    <p className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link href={`/orders/${order.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
                    View Details →
                  </Link>

                  {/* ✅ Cancel button — only for PENDING or PROCESSING */}
                  {["PENDING", "PROCESSING"].includes(order.status) && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                      className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}