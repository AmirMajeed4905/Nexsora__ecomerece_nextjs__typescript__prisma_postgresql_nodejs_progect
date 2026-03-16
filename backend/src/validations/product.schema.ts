import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().default(0),
  isTrending: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean().default(false)
  ),
  categoryId: z.string().min(1, "Category is required"),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;