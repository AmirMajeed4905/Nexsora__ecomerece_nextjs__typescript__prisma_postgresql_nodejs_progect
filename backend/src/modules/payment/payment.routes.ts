import { Router } from "express";
import express from "express";
import * as paymentController from "./payment.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import asyncHandler from "../../utils/asyncHandler";

const router = Router();

// Webhook needs raw body — must be before express.json()
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(paymentController.stripeWebhook)
);


// Protected routes
router.post("/create-intent", authMiddleware, asyncHandler(paymentController.createPaymentIntent));
router.post("/cod",           authMiddleware, asyncHandler(paymentController.createCODOrder));

export default router;