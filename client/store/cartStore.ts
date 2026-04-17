import { create } from "zustand";
import api from "@/lib/axios";
import { toast } from "sonner";

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  stock: number;
  category: { id: string; name: string; slug: string };
}

interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
  subtotal: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearCartLocally: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  getCartItemId: (productId: string) => string | null;
}

// ── Recalculate cart totals from items ─────────────────────────
function recalculate(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, i) => {
    const price = i.product.discountPrice ?? i.product.price;
    return sum + price * i.quantity;
  }, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { total: parseFloat(total.toFixed(2)), itemCount };
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/api/cart");
      set({ cart: res.data.data.cart });
    } catch {
      set({ cart: null });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Add to Cart ──────────────────────────────────────────────
  addToCart: async (productId, quantity = 1) => {
    const { isInCart } = get();

    if (isInCart(productId)) {
      toast.info("Already in cart!", {
        description: "Update quantity from the cart page.",
        action: { label: "View Cart", onClick: () => { window.location.href = "/cart"; } },
      });
      return;
    }

    try {
      const res = await api.post("/api/cart", { productId, quantity });
      set({ cart: res.data.data.cart });
      toast.success("Added to cart!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  },

  // ── Update Item — OPTIMISTIC ──────────────────────────────────
  // UI updates instantly, API call happens in background
  updateItem: async (itemId, quantity) => {
    const { cart } = get();
    if (!cart) return;

    // Save old state for rollback
    const oldItems = cart.items;

    // Optimistic update
    const newItems = oldItems.map((i) => {
      if (i.id !== itemId) return i;
      const price = i.product.discountPrice ?? i.product.price;
      return { ...i, quantity, subtotal: parseFloat((price * quantity).toFixed(2)) };
    });
    const { total, itemCount } = recalculate(newItems);
    set({ cart: { ...cart, items: newItems, total, itemCount } });

    // Background API call
    try {
      const res = await api.put(`/api/cart/${itemId}`, { quantity });
      set({ cart: res.data.data.cart });
    } catch (err: unknown) {
      // Rollback on error
      const { total: t, itemCount: ic } = recalculate(oldItems);
      set({ cart: { ...cart, items: oldItems, total: t, itemCount: ic } });
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update");
    }
  },

  // ── Remove Item — OPTIMISTIC ──────────────────────────────────
  removeItem: async (itemId) => {
    const { cart } = get();
    if (!cart) return;

    const oldItems = cart.items;
    const newItems = oldItems.filter((i) => i.id !== itemId);
    const { total, itemCount } = recalculate(newItems);
    set({ cart: { ...cart, items: newItems, total, itemCount } });

    try {
      await api.delete(`/api/cart/${itemId}`);
    } catch {
      // Rollback
      const { total: t, itemCount: ic } = recalculate(oldItems);
      set({ cart: { ...cart, items: oldItems, total: t, itemCount: ic } });
      toast.error("Failed to remove item");
    }
  },

  // ── Clear Cart ────────────────────────────────────────────────
  clearCart: async () => {
    const { cart } = get();
    set({ cart: null }); // Optimistic
    try {
      await api.delete("/api/cart");
    } catch {
      set({ cart }); // Rollback
      toast.error("Failed to clear cart");
    }
  },

  // After order — clear locally, no API needed (backend already cleared)
  clearCartLocally: () => set({ cart: null }),

  // ── Helpers ──────────────────────────────────────────────────
  isInCart: (productId) =>
    get().cart?.items.some((i) => i.product.id === productId) ?? false,

  getItemQuantity: (productId) =>
    get().cart?.items.find((i) => i.product.id === productId)?.quantity ?? 0,

  getCartItemId: (productId) =>
    get().cart?.items.find((i) => i.product.id === productId)?.id ?? null,
}));