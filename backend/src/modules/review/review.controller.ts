import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { z } from "zod";

// ── Schemas ────────────────────────────────────────────────────
const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3, "Comment must be at least 3 characters").max(500),
});

const updateReviewSchema = createReviewSchema.partial();

// ── Helper: Recalculate product avg rating ─────────────────────
const recalculateRating = async (productId: string) => {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: parseFloat((result._avg.rating ?? 0).toFixed(1)),
      reviewCount: result._count.rating,
    },
  });
};

// ── POST /api/reviews/:productId ───────────────────────────────
export const createReview = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params as { productId: string };
  const userId = req.user!.userId;

  const result = createReviewSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  // Check product exists
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    sendError(res, 404, "Product not found");
    return;
  }

  // Check if user already reviewed
  const existingReview = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existingReview) {
    sendError(res, 409, "You have already reviewed this product");
    return;
  }

  // Check if user has purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: "DELIVERED" },
    },
  });
  if (!hasPurchased) {
    sendError(res, 403, "You can only review products you have purchased");
    return;
  }

  const review = await prisma.review.create({
    data: { rating: result.data.rating, comment: result.data.comment, userId, productId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Recalculate product avg rating
  await recalculateRating(productId);

  sendSuccess(res, 201, "Review submitted", { review });
};

// ── GET /api/reviews/:productId ────────────────────────────────
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params as { productId: string };
  const { cursor, limit = "10" } = req.query as Record<string, string>;
  const take = Math.min(parseInt(limit) || 10, 50);

  const reviews = await prisma.review.findMany({
    where: { productId },
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = reviews.length > take;
  const items = hasNextPage ? reviews.slice(0, take) : reviews;
  const nextCursor = hasNextPage ? items[items.length - 1].id : null;

  // Rating distribution
  const distribution = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { rating: true },
  });

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: distribution.find((d) => d.rating === r)?._count.rating ?? 0,
  }));

  sendSuccess(res, 200, "Reviews fetched", {
    reviews: items,
    pagination: { nextCursor, hasNextPage },
    ratingDistribution: ratingDist,
  });
};

// ── PUT /api/reviews/:id ───────────────────────────────────────
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const userId = req.user!.userId;

  const result = updateReviewSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    sendError(res, 404, "Review not found");
    return;
  }

  if (review.userId !== userId) {
    sendError(res, 403, "You can only edit your own reviews");
    return;
  }

  const updated = await prisma.review.update({
    where: { id },
    data: result.data,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  await recalculateRating(review.productId);

  sendSuccess(res, 200, "Review updated", { review: updated });
};

// ── DELETE /api/reviews/:id ────────────────────────────────────
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const userId = req.user!.userId;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    sendError(res, 404, "Review not found");
    return;
  }

  // Allow owner or admin to delete
  if (review.userId !== userId && req.user!.role !== "ADMIN") {
    sendError(res, 403, "You can only delete your own reviews");
    return;
  }

  await prisma.review.delete({ where: { id } });
  await recalculateRating(review.productId);

  sendSuccess(res, 200, "Review deleted");
};