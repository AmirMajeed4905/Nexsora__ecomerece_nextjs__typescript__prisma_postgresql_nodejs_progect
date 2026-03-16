import { Router } from "express";
import {
  getProducts,
  getTrendingProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product.controller";
import asyncHandler from "../../utils/asyncHandler";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import { uploadMultiple } from "../../middlewares/upload.middleware";

const router = Router();

// ── Public routes ─────────────────────────────────────────────

// GET /api/products?cursor=&limit=&category=&minPrice=&maxPrice=&isTrending=&search=&sortBy=&order=
router.get("/", asyncHandler(getProducts));

// GET /api/products/trending?limit=8   ← for home page
router.get("/trending", asyncHandler(getTrendingProducts));

// GET /api/products/:slug
router.get("/:slug", asyncHandler(getProductBySlug));

// ── Admin only routes ─────────────────────────────────────────

// POST /api/products
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  uploadMultiple,
  asyncHandler(createProduct)
);

// PUT /api/products/:id
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  uploadMultiple,
  asyncHandler(updateProduct)
);

// DELETE /api/products/:id
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(deleteProduct));

export default router;