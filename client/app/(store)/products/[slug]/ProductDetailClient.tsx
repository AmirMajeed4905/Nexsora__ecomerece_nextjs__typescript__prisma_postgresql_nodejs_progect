/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import ReviewSection from "@/components/products/ReviewSection";

// ── Types ──────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: { id: string; name: string; avatar?: string };
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  avgRating: number;
  reviewCount: number;
  stock: number;
  isTrending: boolean;
  category: Category;
  reviews?: Review[];
}

// ── Helpers ────────────────────────────────────────────────────
function discountPercent(price: number, discountPrice: number | null) {
  if (!discountPrice || discountPrice >= price) return null;
  return Math.round(((price - discountPrice) / price) * 100);
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half   = !filled && rating >= star - 0.5;
        return (
          <svg key={star} className={sz} viewBox="0 0 24 24" aria-hidden="true">
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

// ── Image Gallery ──────────────────────────────────────────────
function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
        <Image
          src={images[selected]}
          alt={`${name} - Image ${selected + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Product images">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={selected === idx}
              className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                selected === idx ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews Section ────────────────────────────────────────────
function ReviewsSection({ reviews = [] }: { reviews?: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {review.user.avatar ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image src={review.user.avatar} alt={review.user.name} fill sizes="32px" className="object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{review.user.name}</p>
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
            <time className="text-xs text-gray-400" dateTime={review.createdAt}>
              {new Date(review.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </time>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}

// ── Related Products ───────────────────────────────────────────
function RelatedProducts({ categorySlug, currentId }: { categorySlug: string; currentId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/api/products", { params: { category: categorySlug, limit: "5" } })
      .then((res) => {
        const filtered = (res.data.data.products as Product[])
          .filter((p) => p.id !== currentId)
          .slice(0, 4);
        setProducts(filtered);
      })
      .catch(() => {});
  }, [categorySlug, currentId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 mb-6">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group">
            <article>
              <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mb-3">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-rose-500 transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                ${(product.discountPrice ?? product.price).toFixed(2)}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function ProductDetailClient({ slug }: { slug: string }) {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [product,   setProduct]   = useState<Product | null>(null);
  const [quantity,  setQuantity]  = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [isAdding,  setIsAdding]  = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    api.get(`/api/products/${slug}`)
      .then((res) => { setProduct(res.data.data.product); setError(null); })
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsAdding(true);
    await addToCart(product.id, quantity);
    setIsAdding(false);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" aria-live="polite" aria-busy="true">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-4">{error || "Product not found"}</p>
          <Link href="/products" className="text-sm text-gray-900 font-semibold underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount     = discountPercent(product.price, product.discountPrice);
  const displayPrice = product.discountPrice ?? product.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-900 transition-colors">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/products" className="hover:text-gray-900 transition-colors">Products</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium line-clamp-1" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Image Gallery */}
          <ImageGallery images={product.images} name={product.name} />

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category & Trending */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {product.category.name}
              </Link>
              {product.isTrending && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700">
                  🔥 Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <StarRating rating={product.avgRating} />
              <span className="text-sm font-semibold text-gray-900">{product.avgRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-6 flex-wrap">
              <span className="text-4xl font-black text-gray-900">${displayPrice.toFixed(2)}</span>
              {discount && (
                <>
                  <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>
                  <span className="text-base font-bold text-rose-500">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mb-5">
              {product.stock > 10 ? (
                <p className="text-sm font-semibold text-green-600">✓ In Stock</p>
              ) : product.stock > 0 ? (
                <p className="text-sm font-semibold text-amber-600">⚠ Only {product.stock} left</p>
              ) : (
                <p className="text-sm font-semibold text-red-600">✕ Out of Stock</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden" role="group" aria-label="Quantity">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock === 0}
                  aria-label="Decrease quantity"
                  className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
                    setQuantity(val);
                  }}
                  aria-label="Quantity"
                  className="w-12 h-11 text-center border-x border-gray-200 text-sm font-semibold outline-none"
                  min="1"
                  max={product.stock}
                  disabled={product.stock === 0}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock === 0 || quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdding}
                className="flex-1 h-11 bg-gray-900 text-white font-semibold rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isAdding ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
              {[
                { icon: "✓", label: "Free Returns" },
                { icon: "🚚", label: "Fast Shipping" },
                { icon: "🔒", label: "Secure Payment" },
              ].map(({ icon, label }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-gray-50">
                  <div className="text-xl mb-1" aria-hidden="true">{icon}</div>
                  <p className="text-xs text-gray-600 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        
           <ReviewSection
  productId={product.id}
  avgRating={product.avgRating}
  reviewCount={product.reviewCount}
  reviews={product.reviews ?? []}
/>
   

        {/* Reviews */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mb-16 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Customer Reviews
              <span className="text-base font-normal text-gray-400 ml-2">({product.reviewCount})</span>
            </h2>
            <ReviewsSection reviews={product.reviews} />
          </section>
        )}

        {/* Related Products */}
        <RelatedProducts categorySlug={product.category.slug} currentId={product.id} />
      </main>
    </div>
  );
}