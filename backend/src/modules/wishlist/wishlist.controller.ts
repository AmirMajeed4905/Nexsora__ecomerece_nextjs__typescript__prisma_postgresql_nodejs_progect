import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { z } from "zod";

const addToWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

// ── GET /api/wishlist ──────────────────────────────────────────
export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.user!.userId },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { id: "desc" },
  });

  sendSuccess(res, 200, "Wishlist fetched", { wishlist });
};

// ── POST /api/wishlist ─────────────────────────────────────────
export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  const result = addToWishlistSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { productId } = result.data;
  const userId = req.user!.userId;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    sendError(res, 404, "Product not found");
    return;
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) {
    sendError(res, 409, "Product already in wishlist");
    return;
  }

  const item = await prisma.wishlist.create({
    data: { userId, productId },
    include: {
      product: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  sendSuccess(res, 201, "Added to wishlist", { item });
};

// ── DELETE /api/wishlist/:productId ───────────────────────────
export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params as { productId: string };
  const userId = req.user!.userId;

  const item = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (!item) {
    sendError(res, 404, "Item not found in wishlist");
    return;
  }

  await prisma.wishlist.delete({
    where: { userId_productId: { userId, productId } },
  });

  sendSuccess(res, 200, "Removed from wishlist");
};

// ── GET /api/wishlist/check/:productId ────────────────────────
export const checkWishlist = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params as { productId: string };
  const userId = req.user!.userId;

  const item = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  sendSuccess(res, 200, "Wishlist status", { isWishlisted: !!item });
};