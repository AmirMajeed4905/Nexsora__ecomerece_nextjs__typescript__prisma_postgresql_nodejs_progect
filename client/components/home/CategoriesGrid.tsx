"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count?: { products: number };
}

// ── Skeleton ───────────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-square rounded-2xl bg-gray-100 mb-3" />
      <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mx-auto mt-1.5" />
    </div>
  );
}

// ── Category Card ──────────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group text-center"
      aria-label={`Browse ${category.name}`}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-3 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 14vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors duration-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800 group-hover:text-rose-500 transition-colors">
        {category.name}
      </h3>
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading,  setIsLoading]  = useState(true);

  useEffect(() => {
    api.get("/api/categories")
      .then((res) => setCategories(res.data.data.categories ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="py-14 px-4" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">
              Explore
            </p>
            <h2
              id="categories-heading"
              className="text-3xl font-black text-gray-900 tracking-tight"
            >
              Shop by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:flex items-center gap-1"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => <CategorySkeleton key={i} />)
            : categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)
          }
        </div>

        {/* Mobile view all */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/products"
            className="text-sm font-semibold text-gray-700 underline underline-offset-4"
          >
            View all categories
          </Link>
        </div>
      </div>
    </section>
  );
}