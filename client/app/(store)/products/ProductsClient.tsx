/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

// ── Types ──────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  avgRating: number;
  reviewCount: number;
  isTrending: boolean;
  stock: number;
  category: Category;
}

interface Pagination {
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
}

type SortBy = "createdAt" | "price" | "avgRating" | "reviewCount" | "name";
type Order = "asc" | "desc";
type ViewMode = "grid" | "list";

const SORT_OPTIONS = [
  { label: "Newest First",        value: "createdAt_desc" },
  { label: "Oldest First",        value: "createdAt_asc"  },
  { label: "Price: Low to High",  value: "price_asc"      },
  { label: "Price: High to Low",  value: "price_desc"     },
  { label: "Top Rated",           value: "avgRating_desc" },
  { label: "Most Reviewed",       value: "reviewCount_desc"},
  { label: "Name: A–Z",           value: "name_asc"       },
];

// ── Helpers ────────────────────────────────────────────────────
function discountPercent(price: number, discountPrice: number | null) {
  if (!discountPrice || discountPrice >= price) return null;
  return Math.round(((price - discountPrice) / price) * 100);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half   = !filled && rating >= star - 0.5;
        return (
          <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`h${star}`}>
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#d1d5db" />
                  </linearGradient>
                </defs>
                <path fill={`url(#h${star})`} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </>
            ) : (
              <path fill={filled ? "#f59e0b" : "#d1d5db"} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            )}
          </svg>
        );
      })}
    </div>
  );
}

// ── Grid Card ──────────────────────────────────────────────────
function GridCard({
  product,
  onAddToCart,
  isAdding,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
  isAdding: boolean;
}) {
  const discount     = discountPercent(product.price, product.discountPrice);
  const displayPrice = product.discountPrice ?? product.price;

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {product.isTrending && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">Hot</span>}
            {discount && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">-{discount}%</span>}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">{product.category.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 hover:text-rose-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.avgRating} />
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
            {discount && <span className="text-xs text-gray-400 line-through ml-1.5">${product.price.toFixed(2)}</span>}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isAdding || product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        )}
      </div>
    </article>
  );
}

// ── List Card ──────────────────────────────────────────────────
function ListCard({
  product,
  onAddToCart,
  isAdding,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
  isAdding: boolean;
}) {
  const discount     = discountPercent(product.price, product.discountPrice);
  const displayPrice = product.discountPrice ?? product.price;

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 flex">
      <Link href={`/products/${product.slug}`} className="relative w-36 sm:w-48 shrink-0 bg-gray-50" aria-label={product.name}>
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 144px, 192px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {product.isTrending && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">Hot</span>
          </div>
        )}
      </Link>
      <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{product.category.name}</p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-2 hover:text-rose-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={product.avgRating} />
            <span className="text-xs text-gray-400">{product.avgRating.toFixed(1)} · {product.reviewCount} reviews</span>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
            {discount && (
              <>
                <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
                <span className="text-xs font-bold text-rose-500">-{discount}%</span>
              </>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={isAdding || product.stock === 0}
            aria-label={`Add ${product.name} to cart`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            )}
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Skeletons ──────────────────────────────────────────────────
function GridSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse" aria-hidden="true">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-gray-100 rounded w-1/4" />
          <div className="w-8 h-8 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse flex h-36" aria-hidden="true">
      <div className="w-48 bg-gray-100 shrink-0" />
      <div className="flex-1 p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded w-28 mt-auto" />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function ProductsClient() {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ nextCursor: null, hasNextPage: false, limit: 12 });

  const [view,           setView]           = useState<ViewMode>("grid");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortValue,      setSortValue]      = useState("createdAt_desc");
  const [search,         setSearch]         = useState("");
  const [searchInput,    setSearchInput]    = useState("");
  const [minPrice,       setMinPrice]       = useState("");
  const [maxPrice,       setMaxPrice]       = useState("");
  const [loading,        setLoading]        = useState(true);
  const [loadingMore,    setLoadingMore]    = useState(false);
  const [addingId,       setAddingId]       = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch categories once
  useEffect(() => {
    api.get("/api/categories")
      .then((res) => setCategories(res.data.data.categories ?? []))
      .catch(() => {});
  }, []);

  // Core fetch
  const fetchProducts = useCallback(async (cursor?: string) => {
    const [sortBy, order] = sortValue.split("_") as [SortBy, Order];

    const params: Record<string, string> = { limit: "12", sortBy, order };
    if (cursor)                       params.cursor   = cursor;
    if (activeCategory !== "all")     params.category = activeCategory;
    if (search)                       params.search   = search;
    if (minPrice)                     params.minPrice = minPrice;
    if (maxPrice)                     params.maxPrice = maxPrice;

    const res = await api.get("/api/products", { params });
    const { products: fetched, pagination: pg } = res.data.data;

    if (cursor) {
      setProducts((prev) => [...prev, ...fetched]);
    } else {
      setProducts(fetched);
    }
    setPagination(pg);
  }, [sortValue, activeCategory, search, minPrice, maxPrice]);

  // Reset on filter change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchProducts()
      .catch(() => { if (!cancelled) toast.error("Failed to load products"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [fetchProducts]);

  // Load more
  const handleLoadMore = async () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) return;
    setLoadingMore(true);
    await fetchProducts(pagination.nextCursor).catch(() => toast.error("Failed to load more"));
    setLoadingMore(false);
  };

  // Search debounce
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 400);
  };

  // Add to cart
  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    setAddingId(product.id);
    await addToCart(product.id, 1);
    setAddingId(null);
  };

  return (
    <>
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">All Products</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""}${pagination.hasNextPage ? "+" : ""}`}
            </p>
          </div>

          {/* Search + Price */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min $"
                aria-label="Minimum price"
                min="0"
                className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
              />
              <span className="text-gray-300 text-sm" aria-hidden="true">–</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max $"
                aria-label="Maximum price"
                min="0"
                className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all bg-white"
              />
            </div>
          </div>

          {/* Category + Sort + View */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Filter by category">
              <button
                role="tab"
                aria-selected={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === cat.slug ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label htmlFor="sort-select" className="sr-only">Sort by</label>
              <select
                id="sort-select"
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                className="text-xs font-medium border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white text-gray-700 cursor-pointer hover:border-gray-400 transition-colors"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden" role="group" aria-label="View mode">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  className={`p-2 transition-colors ${view === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
                  </svg>
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={`p-2 transition-colors ${view === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            view === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" aria-busy="true" aria-label="Loading products">
                {Array.from({ length: 8 }).map((_, i) => <GridSkeleton key={i} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-4" aria-busy="true">
                {Array.from({ length: 4 }).map((_, i) => <ListSkeleton key={i} />)}
              </div>
            )
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400 font-semibold">No products found</p>
              <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <GridCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  isAdding={addingId === p.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.map((p) => (
                <ListCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  isAdding={addingId === p.id}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && pagination.hasNextPage && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading...
                  </>
                ) : "Load More"}
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}