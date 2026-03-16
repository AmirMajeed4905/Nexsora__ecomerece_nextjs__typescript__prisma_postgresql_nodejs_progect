import { Router } from "express";
import * as authController from "./auth.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";
import { uploadSingle } from "../../middlewares/upload.middleware";

const router = Router();

// ── Public Routes ──────────────────────────────────────────────
router.post("/register", uploadSingle, asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));

// ── Protected Routes ───────────────────────────────────────────
router.post("/logout", authMiddleware, asyncHandler(authController.logout));
router.get("/me", authMiddleware, asyncHandler(authController.getMe));
router.put("/avatar", authMiddleware, uploadSingle, asyncHandler(authController.updateAvatar));
router.delete("/account", authMiddleware, asyncHandler(authController.deleteAccount));

export default router;