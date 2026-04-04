import { Router } from "express";
import * as orderController from "./order.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import roleMiddleware from "../../middlewares/role.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

// ── User Routes (Protected) ────────────────────────────────────
router.use(authMiddleware);

router.post("/", asyncHandler(orderController.createOrder));
router.get("/", asyncHandler(orderController.getMyOrders));
router.get("/:id", asyncHandler(orderController.getOrderById));
router.patch("/:id/cancel", asyncHandler(orderController.cancelOrder));

// ── Admin Routes ───────────────────────────────────────────────
router.get("/admin/all", roleMiddleware("ADMIN"), asyncHandler(orderController.getAllOrders));
router.patch("/admin/:id/status", roleMiddleware("ADMIN"), asyncHandler(orderController.updateOrderStatus));

export default router;