import Link from "next/link";

export default function FeaturedBanner() {
  return (
    <section className="py-8 px-4" aria-label="Featured offer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Main Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 p-8 md:p-10 flex flex-col justify-between min-h-55">
            <div className="absolute inset-0 bg-linear-to-br from-gray-800 to-gray-900" />
            <div className="relative z-10">
              <span className="inline-block text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">
                Limited Time
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                Summer Sale
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Up to 70% off on selected items
              </p>
              <Link
                href="/products?sortBy=price&order=asc"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white text-sm font-bold rounded-xl hover:bg-rose-600 transition-colors"
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-white/5" aria-hidden="true" />
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border border-white/5" aria-hidden="true" />
          </div>

          {/* Two small banners */}
          <div className="grid grid-cols-1 gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-rose-50 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">New Arrivals</p>
                <h3 className="text-xl font-black text-gray-900">Fresh Picks</h3>
                <Link
                  href="/products?sortBy=createdAt&order=desc"
                  className="text-xs font-semibold text-gray-700 underline underline-offset-2 mt-2 inline-block hover:text-rose-500 transition-colors"
                >
                  Explore →
                </Link>
              </div>
              <div className="text-5xl" aria-hidden="true">✨</div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-gray-100 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Top Rated</p>
                <h3 className="text-xl font-black text-gray-900">Best Sellers</h3>
                <Link
                  href="/products?sortBy=avgRating&order=desc"
                  className="text-xs font-semibold text-gray-700 underline underline-offset-2 mt-2 inline-block hover:text-rose-500 transition-colors"
                >
                  Explore →
                </Link>
              </div>
              <div className="text-5xl" aria-hidden="true">⭐</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}