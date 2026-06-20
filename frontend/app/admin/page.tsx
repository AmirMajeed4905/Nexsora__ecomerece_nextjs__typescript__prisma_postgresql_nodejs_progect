"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";
import SectionSpinner from "@/components/ui/SectionSpinner";

// ── Types ──────────────────────────────────────────────────────
interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null };
  items: { product: { name: string; images: string[] } }[];
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  images: string[];
  category: { name: string };
}

// ── Status color map ───────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-purple-100 text-purple-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
};

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 hover:shadow-md transition-shadow h-full">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        {href && (
          <svg
            className="w-3.5 h-3.5 text-gray-300 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}

// ── Page ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock,     setLowStock]     = useState<LowStockProduct[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);

  useEffect(() => {
    api
      .get("/api/admin/stats")
      .then((res) => {
        setStats(res.data.data.stats);
        setRecentOrders(res.data.data.recentOrders);
        setLowStock(res.data.data.lowStockProducts);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <SectionSpinner />;
  }

  return (
    <div className="space-y-5 md:space-y-6">

      {/* ── Stats Grid ──
          mobile:  2 columns
          tablet:  3 columns
          desktop: 6 columns (only on very wide screens)
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${stats?.totalRevenue.toFixed(2) ?? "0.00"}`}
          icon={<span className="text-base">💰</span>}
          color="bg-green-50"
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={<span className="text-base">📦</span>}
          color="bg-blue-50"
          href="/admin/orders"
        />
        <StatCard
          label="Pending Orders"
          value={stats?.pendingOrders ?? 0}
          icon={<span className="text-base">⏳</span>}
          color="bg-yellow-50"
          href="/admin/orders"
        />
        <StatCard
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={<span className="text-base">🛍️</span>}
          color="bg-purple-50"
          href="/admin/products"
        />
        <StatCard
          label="Categories"
          value={stats?.totalCategories ?? 0}
          icon={<span className="text-base">🏷️</span>}
          color="bg-rose-50"
          href="/admin/categories"
        />
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<span className="text-base">👥</span>}
          color="bg-gray-50"
        />
      </div>

      {/* ── Bottom two panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-gray-900 text-sm">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-gray-400 hover:text-gray-900 font-semibold transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto max-h-80 md:max-h-96">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-2xl mb-2">📋</span>
                <p className="text-sm text-gray-400">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                    {order.user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {order.user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                      <span className="font-medium text-gray-600">
                        ${order.total.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-gray-900 text-sm">Low Stock Alert</h2>
            <Link
              href="/admin/products"
              className="text-xs text-gray-400 hover:text-gray-900 font-semibold transition-colors"
            >
              Manage →
            </Link>
          </div>

          <div className="divide-y divide-gray-50 overflow-y-auto max-h-80 md:max-h-96">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-2xl mb-2">✅</span>
                <p className="text-sm text-gray-400">All products well stocked!</p>
              </div>
            ) : (
              lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Product image */}
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {product.category.name}
                    </p>
                  </div>

                  {/* Stock badge */}
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {product.stock === 0 ? "Out of stock" : `${product.stock} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}