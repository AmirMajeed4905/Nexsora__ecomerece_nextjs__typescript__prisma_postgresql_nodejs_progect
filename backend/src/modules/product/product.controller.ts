import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { createProductSchema, updateProductSchema } from "../../validations/product.schema";
import slugify from "slugify";
import {
  uploadMultipleImages,
  deleteMultipleImages,
  extractPublicId,
  CLOUDINARY_FOLDERS,
} from "../../utils/cloudinary.utils";

// GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "Products fetched", { products });
};

// GET /api/products/:slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params as { slug: string };

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  if (!product) {
    sendError(res, 404, "Product not found");
    return;
  }

  sendSuccess(res, 200, "Product fetched", { product });
};

// POST /api/products — admin only
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { name, ...rest } = result.data;

  // Generate slug from name
  const slug = slugify(name, { lower: true, strict: true });

  // Check slug already exists
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    sendError(res, 409, "Product with this name already exists");
    return;
  }

  // ── Upload Images to Cloudinary ──────────────────────────────
  let imageUrls: string[] = [];

  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    const uploaded = await uploadMultipleImages(
      files.map((f) => f.buffer),
      CLOUDINARY_FOLDERS.PRODUCTS
    );
    imageUrls = uploaded.map((u) => u.url);
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      ...rest,
      images: imageUrls,
    },
  });

  sendSuccess(res, 201, "Product created", { product });
};

// PUT /api/products/:id — admin only
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  const result = updateProductSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  // Check product exists
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    sendError(res, 404, "Product not found");
    return;
  }

  const data: Record<string, unknown> = { ...result.data };

  // Update slug if name changed
  if (result.data.name) {
    data.slug = slugify(result.data.name, { lower: true, strict: true });
  }

  // ── Update Images if new files uploaded ───────────────────────
  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    // Delete old images from Cloudinary
    if (existing.images && existing.images.length > 0) {
      const oldPublicIds = existing.images.map((url) => extractPublicId(url));
      await deleteMultipleImages(oldPublicIds);
    }

    // Upload new images
    const uploaded = await uploadMultipleImages(
      files.map((f) => f.buffer),
      CLOUDINARY_FOLDERS.PRODUCTS
    );
    data.images = uploaded.map((u) => u.url);
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  sendSuccess(res, 200, "Product updated", { product });
};

// DELETE /api/products/:id — admin only
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  // Check product exists
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    sendError(res, 404, "Product not found");
    return;
  }

  // ── Delete Images from Cloudinary ────────────────────────────
  if (existing.images && existing.images.length > 0) {
    const publicIds = existing.images.map((url) => extractPublicId(url));
    await deleteMultipleImages(publicIds);
  }

  await prisma.product.delete({ where: { id } });

  sendSuccess(res, 200, "Product deleted");
};