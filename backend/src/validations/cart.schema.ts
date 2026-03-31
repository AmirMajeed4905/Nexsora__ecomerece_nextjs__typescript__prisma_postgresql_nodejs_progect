import { z } from "zod";

// Add item to cart
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
});

// Update cart item quantity
export const updateCartSchema = z.object({
  itemId: z.string().min(1, "Cart item ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

// Remove cart item
export const removeCartItemSchema = z.object({
  itemId: z.string().min(1, "Cart item ID is required"),
});