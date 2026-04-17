"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import ProductCard, { ProductCardSkeleton } from "../products/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

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
  category: { id: string; name: string; slug: string };
}

export default function TrendingProducts() {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [products,  setProducts]  = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId,  setAddingId]  = useState<string | null>(null);

  useEffect(() => {
    api.get("/api/products/trending", { params: { limit: "8" } })
      .then((res) => setProducts(res.data.data.products ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    setAddingId(productId);
    await addToCart(productId, 1);
    setAddingId(null);
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-gray-50" aria-labelledby="trending-heading">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">
              🔥 Hot Right Now
            </p>
            <h2
              id="trending-heading"
              className="text-3xl font-black text-gray-900 tracking-tight"
            >
              Trending Products
            </h2>
          </div>
          <Link
            href="/products?sortBy=avgRating&order=desc"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:flex items-center gap-1"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={handleAddToCart}
                  isAdding={addingId === product.id}
                />
              ))
          }
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}