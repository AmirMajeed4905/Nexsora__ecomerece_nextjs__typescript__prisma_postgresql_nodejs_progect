import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

// ── Dynamic SEO Metadata ───────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products/${slug}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return {
        title: "Product Not Found | Nexora",
        description: "This product could not be found.",
      };
    }

    const data = await res.json();
    const product = data.data.product;

    return {
      title: `${product.name} | Nexora`,
      description: product.description?.slice(0, 160) || `Buy ${product.name} at Nexora`,
      openGraph: {
        title: `${product.name} | Nexora`,
        description: product.description?.slice(0, 160),
        images: product.images?.[0] ? [{ url: product.images[0], alt: product.name }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Nexora`,
        description: product.description?.slice(0, 160),
        images: product.images?.[0] ? [product.images[0]] : [],
      },
    };
  } catch {
    return {
      title: "Product | Nexora",
      description: "Shop products at Nexora",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}