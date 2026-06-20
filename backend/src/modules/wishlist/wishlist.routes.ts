import { Router } from "express";
import * as wishlistController from "./wishlist.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncHandler(wishlistController.getWishlist));
router.post("/", asyncHandler(wishlistController.addToWishlist));
router.get("/check/:productId", asyncHandler(wishlistController.checkWishlist));
router.delete("/:productId", asyncHandler(wishlistController.removeFromWishlist));

export default router;