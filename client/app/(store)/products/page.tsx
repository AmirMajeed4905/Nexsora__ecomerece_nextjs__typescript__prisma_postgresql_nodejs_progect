import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

// ── SEO Metadata ───────────────────────────────────────────────
export const metadata: Metadata = {
  title: "All Products | Nexora",
  description: "Browse our full collection of products. Filter by category, price, and sort by rating or newest arrivals.",
  openGraph: {
    title: "All Products | Nexora",
    description: "Browse our full collection of products.",
    type: "website",
    url: "https://nexora.com/products",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products | Nexora",
    description: "Browse our full collection of products.",
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}