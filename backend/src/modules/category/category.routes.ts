import { Router } from "express";
import * as categoryController from "./category.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

// Public routes
router.get("/", asyncHandler(categoryController.getCategories));
router.get("/:slug", asyncHandler(categoryController.getCategoryBySlug));

// Admin only routes
router.post("/", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(categoryController.createCategory));
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(categoryController.updateCategory));
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), asyncHandler(categoryController.deleteCategory));

export default router;