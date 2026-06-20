import { Router } from "express";
import * as cartController from "./cart.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

// All cart routes are protected
router.use(authMiddleware);

router.get("/", asyncHandler(cartController.getCart));
router.post("/", asyncHandler(cartController.addToCart));
router.put("/:itemId", asyncHandler(cartController.updateCartItem));
router.delete("/clear", asyncHandler(cartController.clearCart));
router.delete("/:itemId", asyncHandler(cartController.removeCartItem));

export default router;