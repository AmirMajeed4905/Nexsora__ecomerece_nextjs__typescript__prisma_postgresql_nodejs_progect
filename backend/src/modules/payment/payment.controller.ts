import { Request, Response } from "express";
import * as Stripe from "stripe";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { ENV } from "../../config/env";
import { z } from "zod";

const stripe = new Stripe.default(ENV.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });

const createPaymentSchema = z.object({
  address: z.object({
    fullName:   z.string().min(1),
    phone:      z.string().min(1),
    street:     z.string().min(1),
    city:       z.string().min(1),
    state:      z.string().min(1),
    postalCode: z.string().min(1),
    country:    z.string().min(1),
  }),
});

// ── POST /api/payments/create-intent ──────────────────────────
// Creates Stripe PaymentIntent from user's cart
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

  // Validate stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      sendError(res, 400, `"${item.product.name}" has only ${item.product.stock} items in stock`);
      return;
    }
  }

  const total = cart.items.reduce((sum, item) => {
    return sum + (item.product.discountPrice ?? item.product.price) * item.quantity;
  }, 0);

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(total * 100), // Stripe uses cents
    currency: "usd",
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

// ── POST /api/payments/webhook ─────────────────────────────────
// Stripe webhook — called when payment succeeds
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
  } catch {
    res.status(400).json({ message: "Webhook signature verification failed" });
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as any;
    const { userId, cartId, address } = intent.metadata;

    // Get cart
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

    // Create order in transaction
    await prisma.$transaction(async (tx) => {
      // Create order
      await tx.order.create({
        data: {
          userId,
          total:    parseFloat(total.toFixed(2)),
          address:  JSON.parse(address),
          stripeId: intent.id,
          status:   "PROCESSING", // Payment done — move to processing
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity:  item.quantity,
              price:     item.product.discountPrice ?? item.product.price,
            })),
          },
        },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });
  }

  res.json({ received: true });
};

// ── POST /api/payments/cod ─────────────────────────────────────
// Cash on Delivery — no Stripe needed
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
        data:  { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  sendSuccess(res, 201, "Order placed successfully", { order });
};