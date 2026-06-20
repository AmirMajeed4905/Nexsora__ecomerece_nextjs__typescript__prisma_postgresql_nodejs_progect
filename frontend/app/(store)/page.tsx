import type { Metadata } from "next";
import HeroCarousel from "@/components/shared/HeroCarousel";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import FeaturedBanner from "@/components/home/FeaturedBanner";
import TrendingProducts from "@/components/home/TrendingProducts";

// ── SEO ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Nexora — Modern E-Commerce",
  description:
    "Shop the latest trends at Nexora. Discover thousands of products across all categories with fast shipping and easy returns.",
  openGraph: {
    title: "Nexora — Modern E-Commerce",
    description:
      "Shop the latest trends at Nexora. Discover thousands of products with fast shipping.",
    type: "website",
    url: "https://nexora.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora — Modern E-Commerce",
    description: "Shop the latest trends at Nexora.",
  },
};

// ── Page ───────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Features strip */}
      <FeaturesStrip />

      {/* Categories */}
      <CategoriesGrid />

      {/* Banners */}
      <FeaturedBanner />

      {/* Trending Products */}
      <TrendingProducts />
    </main>
  );
}