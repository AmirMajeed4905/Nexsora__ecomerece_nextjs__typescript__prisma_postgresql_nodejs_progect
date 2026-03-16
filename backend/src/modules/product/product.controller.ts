import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import {
  createProductSchema,
  updateProductSchema,
} from "../../validations/product.schema";
import slugify from "slugify";
import {
  uploadMultipleImages,
  deleteMultipleImages,
  extractPublicId,
  CLOUDINARY_FOLDERS,
} from "../../utils/cloudinary.utils";

// ── Types ──────────────────────────────────────────────────────
interface GetProductsQuery {
  // Cursor pagination
  cursor?: string;
  limit?: string;

  // Filters
  category?: string;       // category slug
  minPrice?: string;
  maxPrice?: string;
  isTrending?: string;     // "true" | "false"
  search?: string;         // search by name

  // Sorting
  sortBy?: "price" | "avgRating" | "reviewCount" | "createdAt" | "name";
  order?: "asc" | "desc";
}

// ── GET /api/products ──────────────────────────────────────────
// Supports: cursor pagination, search, filters, sorting
// Query params:
//   cursor, limit, category, minPrice, maxPrice,
//   isTrending, search, sortBy, order
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    cursor,
    limit = "8",
    category,
    minPrice,
    maxPrice,
    isTrending,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = req.query as GetProductsQuery;

  const take = Math.min(Math.max(parseInt(limit), 1), 50); // clamp 1–50

  // ── Build WHERE clause ─────────────────────────────────────
  const where: Record<string, unknown> = {};

  // Search by name (case-insensitive)
  if (search?.trim()) {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }

  // Filter by category slug
  if (category?.trim()) {
    where.category = { slug: category.trim() };
  }

  // Price range
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
    };
  }

  // Trending filter
  if (isTrending === "true") {
    where.isTrending = true;
  }

  // ── Allowed sort fields ────────────────────────────────────
  const allowedSortFields = ["price", "avgRating", "reviewCount", "createdAt", "name"];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeOrder = order === "asc" ? "asc" : "desc";

  // ── Cursor pagination ──────────────────────────────────────
  // Fetch take+1 to know if there's a next page
  const products = await prisma.product.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { [safeSortBy]: safeOrder },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  // Check if next page exists
  const hasNextPage = products.length > take;
  const data = hasNextPage ? products.slice(0, take) : products;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;

  sendSuccess(res, 200, "Products fetched", {
    products: data,
    pagination: {
      nextCursor,
      hasNextPage,
      limit: take,
    },
  });
};

// ── GET /api/products/trending ────────────────────────────────
// For home page — returns limited trending products (no pagination)
export const getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
  const { limit = "8" } = req.query as { limit?: string };
  const take = Math.min(Math.max(parseInt(limit), 1), 20);

  const products = await prisma.product.findMany({
    where: { isTrending: true },
    take,
    orderBy: { avgRating: "desc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  sendSuccess(res, 200, "Trending products fetched", { products });
};

// ── GET /api/products/:slug ───────────────────────────────────
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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    sendError(res, 404, "Product not found");
    return;
  }

  sendSuccess(res, 200, "Product fetched", { product });
};

// ── POST /api/products — admin only ──────────────────────────
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { name, ...rest } = result.data;

  const slug = slugify(name, { lower: true, strict: true });

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    sendError(res, 409, "Product with this name already exists");
    return;
  }

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
    data: { name, slug, ...rest, images: imageUrls },
  });

  sendSuccess(res, 201, "Product created", { product });
};

// ── PUT /api/products/:id — admin only ───────────────────────
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  const result = updateProductSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    sendError(res, 404, "Product not found");
    return;
  }

  const data: Record<string, unknown> = { ...result.data };

  if (result.data.name) {
    data.slug = slugify(result.data.name, { lower: true, strict: true });
  }

  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    if (existing.images && existing.images.length > 0) {
      const oldPublicIds = existing.images.map((url) => extractPublicId(url));
      await deleteMultipleImages(oldPublicIds);
    }

    const uploaded = await uploadMultipleImages(
      files.map((f) => f.buffer),
      CLOUDINARY_FOLDERS.PRODUCTS
    );
    data.images = uploaded.map((u) => u.url);
  }

  const product = await prisma.product.update({ where: { id }, data });

  sendSuccess(res, 200, "Product updated", { product });
};

// ── DELETE /api/products/:id — admin only ────────────────────
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    sendError(res, 404, "Product not found");
    return;
  }

  if (existing.images && existing.images.length > 0) {
    const publicIds = existing.images.map((url) => extractPublicId(url));
    await deleteMultipleImages(publicIds);
  }

  await prisma.product.delete({ where: { id } });

  sendSuccess(res, 200, "Product deleted");
};