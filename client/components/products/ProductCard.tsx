"use client";

import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";
import WishlistButton from "@/components/ui/WishlistButton";

export interface ProductCardProps {
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
  onAddToCart: (productId: string) => void;
  isAdding?: boolean;
}

function discountPercent(price: number, discountPrice: number | null) {
  if (!discountPrice || discountPrice >= price) return null;
  return Math.round(((price - discountPrice) / price) * 100);
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  discountPrice,
  images,
  avgRating,
  reviewCount,
  isTrending,
  stock,
  category,
  onAddToCart,
  isAdding = false,
}: ProductCardProps) {
  const discount     = discountPercent(price, discountPrice);
  const displayPrice = discountPrice ?? price;

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${slug}`} aria-label={name} className="block">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {isTrending && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                Hot
              </span>
            )}
            {discount && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton productId={id} variant="icon" />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
          {category.name}
        </p>

        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 hover:text-rose-500 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mb-3">
          <StarRating rating={avgRating} size="xs" count={reviewCount} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
            {discount && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart(id)}
            disabled={isAdding || stock === 0}
            aria-label={`Add ${name} to cart`}
            className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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

        {stock === 0 && (
          <p className="text-xs text-red-500 mt-1.5 font-medium">Out of Stock</p>
        )}
      </div>
    </article>
  );
}

// ── Skeleton ───────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse" aria-hidden="true">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 bg-gray-100 rounded w-1/4" />
          <div className="w-8 h-8 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}