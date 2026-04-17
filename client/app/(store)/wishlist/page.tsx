"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import StarRating from "@/components/ui/StarRating";
import WishlistButton from "@/components/ui/WishlistButton";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const { items, isLoading, fetchWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user, fetchWishlist]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-busy="true">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">
            {items.length} saved {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Save items you love to come back to them later</p>
            <Link
              href="/products"
              className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const { product } = item;
              const displayPrice = product.discountPrice ?? product.price;
              const discount = product.discountPrice
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : null;

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Image */}
                  <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-gray-50">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {discount && (
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">
                        -{discount}%
                      </span>
                    )}
                    {/* Remove from wishlist */}
                    <div className="absolute top-2.5 right-2.5">
                      <WishlistButton productId={product.id} variant="icon" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
                      {product.category.name}
                    </p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-rose-500 transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 mb-3">
                      <StarRating rating={product.avgRating} size="xs" />
                      <span className="text-xs text-gray-400">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-bold text-gray-900">${displayPrice.toFixed(2)}</span>
                        {discount && (
                          <span className="text-xs text-gray-400 line-through ml-1.5">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product.id, 1)}
                        disabled={product.stock === 0}
                        aria-label={`Add ${product.name} to cart`}
                        className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {product.stock === 0 && (
                      <p className="text-xs text-red-500 mt-2 font-medium">Out of Stock</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}