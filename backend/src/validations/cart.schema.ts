import { z } from "zod";

// ── Add item to cart ─────────────────────────────────────────────
// z.coerce.number() so quantity sent as a string (e.g. from a form) is
// still accepted and converted correctly.
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().positive().default(1),
});

// ── Update cart item quantity ───────────────────────────────────
// itemId comes from the route param, not the body, so it is intentionally
// not part of this schema.
export const updateCartSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
