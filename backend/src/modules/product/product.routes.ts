import { Router } from "express";
import * as productController from "./product.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

// Public routes
router.get("/", asyncHandler(productController.getProducts));
router.get("/:slug", asyncHandler(productController.getProductBySlug));

// Admin only routes
router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(productController.createProduct));
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(productController.updateProduct));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(productController.deleteProduct));

export default router;