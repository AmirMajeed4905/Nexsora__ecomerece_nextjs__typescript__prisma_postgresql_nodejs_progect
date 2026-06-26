import { create } from "zustand";
import api from "@/lib/axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

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
  uniqueItemCount: number;
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
function recalculate(items: CartItem[]): { total: number; itemCount: number; uniqueItemCount: number } {
  const total = items.reduce((sum, i) => {
    const price = i.product.discountPrice ?? i.product.price;
    return sum + price * i.quantity;
  }, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const uniqueItemCount = items.length;
  return { total: parseFloat(total.toFixed(2)), itemCount, uniqueItemCount };
}

// Tracks the latest in-flight request "version" per cart item. Clicking
// +/- rapidly fires a new PUT request on every click; those requests can
// resolve out of order over the network (e.g. the response for click #2
// arrives after the response for click #5). Without this guard, whichever
// response happens to land LAST wins — even if it was for an older click —
// which is exactly the "quantity goes up then back down" bug. Each call
// to updateItem bumps the counter for that item and stamps its own
// request with the new value; when a response comes back, it's only
// applied if its stamp still matches the latest counter for that item.
const requestVersions = new Map<string, number>();

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
      toast.error(getErrorMessage(err, "Failed to add to cart"));
    }
  },

  // ── Update Item — OPTIMISTIC, race-safe ───────────────────────
  // UI updates instantly, API call happens in background. Only the
  // response from the most recent call for a given itemId is applied —
  // see the requestVersions comment above.
  updateItem: async (itemId, quantity) => {
    const { cart } = get();
    if (!cart) return;

    const oldItems = cart.items;

    const myVersion = (requestVersions.get(itemId) ?? 0) + 1;
    requestVersions.set(itemId, myVersion);

    // Optimistic update
    const newItems = oldItems.map((i) => {
      if (i.id !== itemId) return i;
      const price = i.product.discountPrice ?? i.product.price;
      return { ...i, quantity, subtotal: parseFloat((price * quantity).toFixed(2)) };
    });
    const { total, itemCount, uniqueItemCount } = recalculate(newItems);
    set({ cart: { ...cart, items: newItems, total, itemCount, uniqueItemCount } });

    // Background API call
    try {
      const res = await api.put(`/api/cart/${itemId}`, { quantity });

      // A newer click already started a request after this one — let
      // that one's response win instead of overwriting it with stale data.
      if (requestVersions.get(itemId) !== myVersion) return;

      set({ cart: res.data.data.cart });
    } catch (err: unknown) {
      // Same staleness check on the error path: don't roll back over a
      // newer, still-in-flight (or already-applied) update.
      if (requestVersions.get(itemId) !== myVersion) return;

      const { total: t, itemCount: ic, uniqueItemCount: uic } = recalculate(oldItems);
      set({ cart: { ...cart, items: oldItems, total: t, itemCount: ic, uniqueItemCount: uic } });
      toast.error(getErrorMessage(err, "Failed to update"));
    }
  },

  // ── Remove Item — OPTIMISTIC ──────────────────────────────────
  removeItem: async (itemId) => {
    const { cart } = get();
    if (!cart) return;

    const oldItems = cart.items;
    const newItems = oldItems.filter((i) => i.id !== itemId);
    const { total, itemCount, uniqueItemCount } = recalculate(newItems);
    set({ cart: { ...cart, items: newItems, total, itemCount, uniqueItemCount } });

    try {
      await api.delete(`/api/cart/${itemId}`);
    } catch {
      // Rollback
      const { total: t, itemCount: ic, uniqueItemCount: uic } = recalculate(oldItems);
      set({ cart: { ...cart, items: oldItems, total: t, itemCount: ic, uniqueItemCount: uic } });
      toast.error("Failed to remove item");
    }
  },

  // ── Clear Cart ────────────────────────────────────────────────
  clearCart: async () => {
    const { cart } = get();
    set({ cart: null }); // Optimistic
    try {
      await api.delete("/api/cart/clear");
      toast.success("Cart cleared");
    } catch (err) {
      set({ cart }); // Rollback
      toast.error(getErrorMessage(err, "Failed to clear cart"));
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
