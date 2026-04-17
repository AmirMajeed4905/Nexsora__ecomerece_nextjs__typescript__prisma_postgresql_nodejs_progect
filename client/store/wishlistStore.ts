import { create } from "zustand";
import api from "@/lib/axios";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────
interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  avgRating: number;
  reviewCount: number;
  stock: number;
  category: { id: string; name: string; slug: string };
}

interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
}

interface WishlistState {
  items: WishlistItem[];
  wishlisted: Set<string>; // productIds for quick lookup
  isLoading: boolean;

  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

// ── Store ──────────────────────────────────────────────────────
export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  wishlisted: new Set(),
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/api/wishlist");
      const items: WishlistItem[] = res.data.data.wishlist;
      set({
        items,
        wishlisted: new Set(items.map((i) => i.productId)),
      });
    } catch {
      set({ items: [], wishlisted: new Set() });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId: string) => {
    const { wishlisted } = get();
    const isCurrentlyWishlisted = wishlisted.has(productId);

    // Optimistic update
    const newWishlisted = new Set(wishlisted);
    if (isCurrentlyWishlisted) {
      newWishlisted.delete(productId);
    } else {
      newWishlisted.add(productId);
    }
    set({ wishlisted: newWishlisted });

    try {
      if (isCurrentlyWishlisted) {
        await api.delete(`/api/wishlist/${productId}`);
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
        toast.success("Removed from wishlist");
      } else {
        const res = await api.post("/api/wishlist", { productId });
        set((state) => ({
          items: [res.data.data.item, ...state.items],
        }));
        toast.success("Added to wishlist!");
      }
    } catch (err: unknown) {
      // Revert optimistic update on error
      set({ wishlisted });
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    }
  },

  isWishlisted: (productId: string) => {
    return get().wishlisted.has(productId);
  },
}));