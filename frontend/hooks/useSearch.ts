import { useState, useCallback } from "react";
import api from "@/lib/axios";

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
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Pagination {
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
}

interface SearchResult {
  products: Product[];
  pagination: Pagination;
}

interface UseSearchReturn {
  results: Product[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<SearchResult>("/api/products", {
        params: {
          search: query.trim(),
          limit: 10,
        },
      });

      // ✅ FIX: no double "data"
      setResults(res.data.products);
    } catch (err) {
      setError("Failed to fetch search results");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clear,
  };
};