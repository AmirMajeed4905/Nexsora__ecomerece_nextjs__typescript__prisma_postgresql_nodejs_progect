import { Router } from "express";
import * as categoryController from "./category.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import asyncHandler from "../../utils/asyncHandler";
import { uploadSingle } from "../../middlewares/upload.middleware";

const router = Router();

// ── Public Routes ──────────────────────────────────────────────
router.get("/", asyncHandler(categoryController.getCategories));
router.get("/:slug", asyncHandler(categoryController.getCategoryBySlug));

// ── Admin Only Routes ──────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  uploadSingle,
  asyncHandler(categoryController.createCategory)
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  uploadSingle,
  asyncHandler(categoryController.updateCategory)
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(categoryController.deleteCategory)
);

export default router;