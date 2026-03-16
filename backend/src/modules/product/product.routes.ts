import { Router } from "express";
import * as productController from "./product.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import asyncHandler from "../../utils/asyncHandler";
import { uploadMultiple } from "../../middlewares/upload.middleware";

const router = Router();

// ── Public Routes ──────────────────────────────────────────────
router.get("/", asyncHandler(productController.getProducts));
router.get("/:slug", asyncHandler(productController.getProductBySlug));

// ── Admin Only Routes ──────────────────────────────────────────
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  uploadMultiple,
  asyncHandler(productController.createProduct)
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  uploadMultiple,
  asyncHandler(productController.updateProduct)
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  asyncHandler(productController.deleteProduct)
);

export default router;