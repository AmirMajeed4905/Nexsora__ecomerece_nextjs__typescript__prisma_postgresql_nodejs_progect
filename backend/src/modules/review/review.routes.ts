import { Router } from "express";
import * as reviewController from "./review.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

// ── Public ─────────────────────────────────────────────────────
router.get("/:productId", asyncHandler(reviewController.getProductReviews));

// ── Protected ──────────────────────────────────────────────────
router.post("/:productId", authMiddleware, asyncHandler(reviewController.createReview));
router.put("/:id", authMiddleware, asyncHandler(reviewController.updateReview));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN", "CUSTOMER"), asyncHandler(reviewController.deleteReview));

export default router;