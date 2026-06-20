import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { createCategorySchema, updateCategorySchema } from "../../validations/category.schema";
import slugify from "slugify";
import {
  uploadImage,
  deleteImage,
  updateImage,
  extractPublicId,
  CLOUDINARY_FOLDERS,
} from "../../utils/cloudinary.utils";

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

  const { name } = result.data;
  const slug = slugify(name, { lower: true, strict: true });

  // Check already exists
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    sendError(res, 409, "Category already exists");
    return;
  }

  // ── Upload Image to Cloudinary ───────────────────────────────
  let imageUrl: string | undefined;

const files = (req.files ?? []) as any[]; 
 if (files.length > 0) {
    const file = files[0];
    const uploaded = await uploadImage(
      file.buffer,
      CLOUDINARY_FOLDERS.CATEGORIES,
      { width: 600, quality: 90 }
    );
    imageUrl = uploaded.url;
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      ...(imageUrl && { image: imageUrl }),
    },
  });

  sendSuccess(res, 201, "Category created", { category });
};

// PUT /api/categories/:id — admin only
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  // ── Remove empty strings from body ───────────────────────────
  const cleanBody = Object.fromEntries(
    Object.entries(req.body).filter(([_, v]) => v !== "")
  );

  const result = updateCategorySchema.safeParse(cleanBody);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    sendError(res, 404, "Category not found");
    return;
  }

  const data: Record<string, unknown> = {};

  // ── Handle Slug Update (only if name provided) ──────────────
  if (result.data?.name) {
    data.name = result.data.name;
    
    const newSlug = slugify(result.data.name, { lower: true, strict: true });
    
    // Check if new slug already exists elsewhere
    const slugExists = await prisma.category.findUnique({
      where: { slug: newSlug },
    });
    
    if (slugExists && slugExists.id !== id) {
      sendError(res, 409, "Category with this name already exists");
      return;
    }
    
    data.slug = newSlug;
  }

  // ── Update Image if new file uploaded ────────────────────────
const files = (req.files ?? []) as any[];
  if (files.length > 0) {
    const file = files[0];
    if (existing.image) {
      // Delete old + upload new
      const oldPublicId = extractPublicId(existing.image);
      const uploaded = await updateImage(
        oldPublicId,
        file.buffer,
        CLOUDINARY_FOLDERS.CATEGORIES
      );
      data.image = uploaded.url;
    } else {
      // No old image — just upload
      const uploaded = await uploadImage(
        file.buffer,
        CLOUDINARY_FOLDERS.CATEGORIES,
        { width: 600, quality: 90 }
      );
      data.image = uploaded.url;
    }
  }

  // ── Only update if there are changes ────────────────────────
  if (Object.keys(data).length === 0) {
    sendError(res, 400, "No fields to update");
    return;
  }

  const category = await prisma.category.update({
    where: { id },
    data,
  });

  sendSuccess(res, 200, "Category updated", { category });
};

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

  // ── Delete Image from Cloudinary ─────────────────────────────
  if (existing.image) {
    const publicId = extractPublicId(existing.image);
    await deleteImage(publicId);
  }

  await prisma.category.delete({ where: { id } });

  sendSuccess(res, 200, "Category deleted");
};