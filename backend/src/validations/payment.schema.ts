import { z } from "zod";
import { addressSchema } from "./address.schema";

export const createPaymentSchema = z.object({
  address: addressSchema,
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
