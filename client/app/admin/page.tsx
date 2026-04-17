"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";

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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {href && (
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-purple-100 text-purple-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
};

// ── Page ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock,     setLowStock]     = useState<LowStockProduct[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);

  useEffect(() => {
    api.get("/api/admin/stats")
      .then((res) => {
        setStats(res.data.data.stats);
        setRecentOrders(res.data.data.recentOrders);
        setLowStock(res.data.data.lowStockProducts);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Revenue"    value={`$${stats?.totalRevenue.toFixed(2) ?? 0}`}  icon={<span className="text-lg">💰</span>} color="bg-green-50"  />
        <StatCard label="Total Orders"     value={stats?.totalOrders ?? 0}     icon={<span className="text-lg">📦</span>} color="bg-blue-50"   href="/admin/orders" />
        <StatCard label="Pending Orders"   value={stats?.pendingOrders ?? 0}   icon={<span className="text-lg">⏳</span>} color="bg-yellow-50" href="/admin/orders" />
        <StatCard label="Total Products"   value={stats?.totalProducts ?? 0}   icon={<span className="text-lg">🛍️</span>} color="bg-purple-50" href="/admin/products" />
        <StatCard label="Total Categories" value={stats?.totalCategories ?? 0} icon={<span className="text-lg">🏷️</span>} color="bg-rose-50"   href="/admin/categories" />
        <StatCard label="Total Users"      value={stats?.totalUsers ?? 0}      icon={<span className="text-lg">👥</span>} color="bg-gray-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-gray-900 font-semibold">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                    {order.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{order.user.name}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""} · ${order.total.toFixed(2)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Low Stock Alert</h2>
            <Link href="/admin/products" className="text-xs text-gray-500 hover:text-gray-900 font-semibold">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStock.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">All products well stocked!</p>
            ) : (
              lowStock.map((product) => (
                <div key={product.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category.name}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {product.stock === 0 ? "Out" : `${product.stock} left`}
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