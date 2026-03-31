import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "./cart.controller";

const router = Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update", authMiddleware, updateCartItem);
router.delete("/remove/:itemId", authMiddleware, removeCartItem);
router.delete("/clear", authMiddleware, clearCart);

export default router;