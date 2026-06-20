import { z } from "zod";

// ── Shared Address Schema ───────────────────────────────────────
// Used by both order.controller.ts (createOrder) and
// payment.controller.ts (createPaymentIntent, createCODOrder)
// to avoid duplicating the same shape in two places.
export const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export type AddressInput = z.infer<typeof addressSchema>;
