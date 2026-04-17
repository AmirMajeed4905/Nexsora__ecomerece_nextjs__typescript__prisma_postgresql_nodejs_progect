"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: OrderItem[];
}

// ── Status Badge ───────────────────────────────────────────────
const StatusBadge = ({ status }: { status: Order["status"] }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

// ── Component ──────────────────────────────────────────────────
export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data.data.orders);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

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
          <p className="text-gray-500 text-sm mt-1">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 text-sm mb-6">When you place an order, it will appear here</p>
            <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{order.id.slice(0, 16)}...</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-2 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  <div className="ml-2">
                    <p className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                    <p className="text-sm font-bold text-gray-900">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}