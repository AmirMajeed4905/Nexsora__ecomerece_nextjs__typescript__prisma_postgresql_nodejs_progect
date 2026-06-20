"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/axios";
import SectionSpinner from "@/components/ui/SectionSpinner";

// ── Types ──────────────────────────────────────────────────────
type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[] };
}

interface Order {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
}

// ── Status config ──────────────────────────────────────────────
const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:    "Pending",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING:    "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED:    "bg-purple-100 text-purple-800",
  DELIVERED:  "bg-green-100 text-green-800",
  CANCELLED:  "bg-red-100 text-red-800",
};

// All statuses admin can pick — no restrictions, admin has full control
const ALL_STATUSES: OrderStatus[] = [
  "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED",
];

// ── Single Order Row ───────────────────────────────────────────
function OrderRow({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === order.status || updating) return;
    setUpdating(true);
    try {
      await api.patch(`/api/orders/admin/${order.id}/status`, { status: newStatus });
      onStatusChange(order.id, newStatus);
      toast.success(`Order → ${STATUS_LABEL[newStatus]}`);
    } catch {
      toast.error("Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Main info row */}
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-4">

          {/* Top: customer + date + total */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm shrink-0">
                {order.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{order.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{order.user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="text-right shrink-0">
              <p className="font-black text-gray-900 text-base">${order.total.toFixed(2)}</p>
              <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Bottom: status control + items toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            {/* Current status badge */}
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full w-fit ${STATUS_COLOR[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>

            {/* Status changer — full select, admin picks any status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0">Change to:</span>
              <select
                value=""
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                disabled={updating}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>Select status…</option>
                {ALL_STATUSES.filter((s) => s !== order.status).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              {updating && (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* View items toggle */}
            <button
              onClick={() => setExpanded((p) => !p)}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              {expanded ? "Hide items" : "View items"}
              <svg
                className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Order ID */}
          <p className="font-mono text-[10px] text-gray-300">ID: {order.id}</p>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0">
              {/* Product image */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0">
                {item.product.images[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name} fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">—</div>
                )}
              </div>
              <p className="flex-1 text-sm text-gray-700 font-medium truncate">{item.product.name}</p>
              <p className="text-xs text-gray-400 shrink-0">
                {item.quantity} × ${item.price.toFixed(2)}
              </p>
              <p className="text-sm font-bold text-gray-900 shrink-0 w-16 text-right">
                ${(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-end px-5 py-3">
            <p className="text-sm font-bold text-gray-900">Total: ${order.total.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [refreshKey,   setRefreshKey]   = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    api.get("/api/orders/admin/all")
      .then((res) => { if (!cancelled) setOrders(res.data.data.orders ?? []); })
      .catch(() => { if (!cancelled) toast.error("Failed to load orders"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  // Filter + search
  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "ALL" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.user.name.toLowerCase().includes(q) ||
      o.user.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Counts for filter tabs
  const counts: Record<string, number> = { ALL: orders.length };
  for (const s of ALL_STATUSES) counts[s] = orders.filter((o) => o.status === s).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400">{orders.length} total</p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by order ID, customer name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ALL", ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shrink-0
              ${filterStatus === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
          >
            {s === "ALL" ? "All" : STATUS_LABEL[s]}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
              ${filterStatus === s ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {isLoading ? (
        <SectionSpinner heightClassName="py-24" spinnerSizeClassName="w-7 h-7" />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm font-semibold text-gray-700">No orders found</p>
          <p className="text-xs text-gray-400 mt-1">
            {search || filterStatus !== "ALL" ? "Try changing your filters" : "No orders yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center pb-4">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}