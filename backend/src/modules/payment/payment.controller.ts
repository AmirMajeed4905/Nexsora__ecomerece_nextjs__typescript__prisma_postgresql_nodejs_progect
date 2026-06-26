import { Request, Response } from "express";
import Stripe from "stripe";

import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { ENV } from "../../config/env";
import { createPaymentSchema } from "../../validations/payment.schema";

// Stripe client
const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
});

// ── POST /api/payments/create-intent ──────────────────────────
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  const result = createPaymentSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const userId = req.user!.userId;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    sendError(res, 400, "Cart is empty");
    return;
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      sendError(res, 400, `"${item.product.name}" has only ${item.product.stock} items in stock`);
      return;
    }
  }

  const total = cart.items.reduce((sum, item) => {
    return sum + (item.product.discountPrice ?? item.product.price) * item.quantity;
  }, 0);

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(total * 100),
    currency: "usd",
    // Required for the client-side <PaymentElement/> to have any payment
    // method to render. Without this, Stripe doesn't know which payment
    // methods to offer, the PaymentElement has nothing to mount, and
    // confirmPayment() later fails with "no mounted Payment Element".
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId,
      cartId:  cart.id,
      address: JSON.stringify(result.data.address),
    },
  });

  sendSuccess(res, 200, "Payment intent created", {
    clientSecret: paymentIntent.client_secret,
    total:        parseFloat(total.toFixed(2)),
  });
};

// ── POST /api/payments/confirm ──────────────────────────────────
// Called by the frontend immediately after stripe.confirmPayment()
// succeeds. This is the PRIMARY way orders get created for card
// payments — not the webhook below. Reasons:
//   1. Webhooks never reach http://localhost in local development, so
//      relying on the webhook alone meant orders were never created
//      while testing locally.
//   2. In production the webhook still requires a separate one-time
//      setup step (registering the endpoint + secret in the Stripe
//      Dashboard) that's easy to forget, leaving payments "stuck" with
//      money taken but no order. Confirming straight from the client
//      request doesn't depend on that extra configuration.
// We still re-verify the PaymentIntent status server-side via the Stripe
// API rather than trusting the client outright, so this stays safe even
// though the trigger comes from the browser.
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  const { paymentIntentId } = req.body as { paymentIntentId?: string };
  if (!paymentIntentId) {
    sendError(res, 400, "paymentIntentId is required");
    return;
  }

  const userId = req.user!.userId;

  // If a webhook already created this order (e.g. in production where
  // both paths can fire), don't create a duplicate.
  const existing = await prisma.order.findUnique({ where: { stripeId: paymentIntentId } });
  if (existing) {
    sendSuccess(res, 200, "Order already placed", { order: existing });
    return;
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (intent.status !== "succeeded") {
    sendError(res, 400, "Payment has not succeeded yet");
    return;
  }

  if (intent.metadata?.userId !== userId) {
    sendError(res, 403, "Access denied");
    return;
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    // Cart already cleared (e.g. webhook beat us to it) — nothing to do.
    sendSuccess(res, 200, "Order already placed");
    return;
  }

  const total = cart.items.reduce((sum, item) => {
    return sum + (item.product.discountPrice ?? item.product.price) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total:    parseFloat(total.toFixed(2)),
        address:  JSON.parse(intent.metadata.address),
        stripeId: intent.id,
        status:   "PROCESSING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity:  item.quantity,
            price:     item.product.discountPrice ?? item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
          },
        },
      },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  sendSuccess(res, 201, "Order placed successfully", { order });
};

// ── POST /api/payments/webhook ─────────────────────────────────
// Kept as a safety net for production: if the browser tab closes right
// after payment succeeds (before the /confirm call above fires), this
// still creates the order once Stripe's servers reach this endpoint.
// The stripeId uniqueness check in /confirm (and the cart-already-empty
// check here) keep the two paths from double-creating an order.
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  let event: any;   // ← Temporary any to bypass strict type issue

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).json({ message: "Webhook signature verification failed" });
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as any;   // ← Safe any cast

    const { userId, cartId, address } = intent.metadata || {};

    if (!userId || !cartId || !address) {
      console.error("Missing metadata in payment intent");
      res.json({ received: true });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      res.json({ received: true });
      return;
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.discountPrice ?? item.product.price) * item.quantity;
    }, 0);

    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          userId,
          total:    parseFloat(total.toFixed(2)),
          address:  JSON.parse(address),
          stripeId: intent.id,
          status:   "PROCESSING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity:  item.quantity,
              price:     item.product.discountPrice ?? item.product.price,
            })),
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });
  }

  res.json({ received: true });
};

// ── POST /api/payments/cod ─────────────────────────────────────
export const createCODOrder = async (req: Request, res: Response): Promise<void> => {
  const result = createPaymentSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const userId = req.user!.userId;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    sendError(res, 400, "Cart is empty");
    return;
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      sendError(res, 400, `"${item.product.name}" has only ${item.product.stock} items in stock`);
      return;
    }
  }

  const total = cart.items.reduce((sum, item) => {
    return sum + (item.product.discountPrice ?? item.product.price) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total:   parseFloat(total.toFixed(2)),
        address: result.data.address,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity:  item.quantity,
            price:     item.product.discountPrice ?? item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
          },
        },
      },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  sendSuccess(res, 201, "Order placed successfully", { order });
};