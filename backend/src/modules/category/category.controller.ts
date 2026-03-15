import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { createCategorySchema, updateCategorySchema } from "../../validations/category.schema";
import slugify from "slugify";

// GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  sendSuccess(res, 200, "Categories fetched", { categories });
};

// GET /api/categories/:slug
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    sendError(res, 404, "Category not found");
    return;
  }

  sendSuccess(res, 200, "Category fetched", { category });
};

// POST /api/categories — admin only
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const result = createCategorySchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { name, ...rest } = result.data;
  const slug = slugify(name, { lower: true, strict: true });

  // Check already exists
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    sendError(res, 409, "Category already exists");
    return;
  }

  const category = await prisma.category.create({
    data: { name, slug, ...rest },
  });

  sendSuccess(res, 201, "Category created", { category });
};

// PUT /api/categories/:id — admin only
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  const result = updateCategorySchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    sendError(res, 404, "Category not found");
    return;
  }

  const data: Record<string, unknown> = { ...result.data };

  if (result.data.name) {
    data.slug = slugify(result.data.name, { lower: true, strict: true });
  }

  const category = await prisma.category.update({
    where: { id },
    data,
  });

  sendSuccess(res, 200, "Category updated", { category });
};

// DELETE /api/categories/:id — admin only
// DELETE /api/categories/:id — admin only
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    sendError(res, 404, "Category not found");
    return;
  }

  // Check if category has products
  const productsCount = await prisma.product.count({ where: { categoryId: id } });
  if (productsCount > 0) {
    sendError(res, 400, "Cannot delete category with existing products");
    return;
  }

  await prisma.category.delete({ where: { id } });

  sendSuccess(res, 200, "Category deleted");
};