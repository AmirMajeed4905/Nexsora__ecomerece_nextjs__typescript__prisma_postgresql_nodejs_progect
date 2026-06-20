// src/modules/order/order.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { createOrderSchema, updateOrderStatusSchema } from "../../validations/order.schema";

// ── POST /api/orders ───────────────────────────────────────────
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { address } = result.data;
  const userId = req.user!.userId;

  // Get user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    sendError(res, 400, "Cart is empty");
    return;
  }

  // Validate stock for all items
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      sendError(res, 400, `"${item.product.name}" has only ${item.product.stock} items in stock`);
      return;
    }
  }

  // Calculate total
  const total = cart.items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Create order + decrement stock + clear cart — all inside ONE transaction.
  // (Previously stock-decrement and cart-clear ran AFTER the transaction,
  // so a failure there could leave an order created but stock untouched.
  // Moving everything into the transaction keeps order/stock/cart consistent.)
  const newOrder = await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          total: parseFloat(total.toFixed(2)),
          address,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.discountPrice ?? item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  price: true,
                  discountPrice: true,
                },
              },
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

      return order;
    },
    { timeout: 10000 } // Increase transaction timeout to 10s
  );

  sendSuccess(res, 201, "Order placed successfully", { order: newOrder });
};

// ── GET /api/orders ────────────────────────────────────────────
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "Orders fetched", { orders });
};

// ── GET /api/orders/:id ────────────────────────────────────────
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: true, price: true, discountPrice: true },
          },
        },
      },
    },
  });

  if (!order) {
    sendError(res, 404, "Order not found");
    return;
  }

  if (order.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
    sendError(res, 403, "Access denied");
    return;
  }

  sendSuccess(res, 200, "Order fetched", { order });
};

// ── PATCH /api/orders/:id/cancel ──────────────────────────────
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });

  if (!order) {
    sendError(res, 404, "Order not found");
    return;
  }

  if (order.userId !== req.user!.userId) {
    sendError(res, 403, "Access denied");
    return;
  }

  if (!["PENDING", "PROCESSING"].includes(order.status)) {
    sendError(res, 400, "Only pending or processing orders can be cancelled");
    return;
  }

  // Cancel order + restore stock
  const cancelledOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return updated;
  });

  sendSuccess(res, 200, "Order cancelled", { order: cancelledOrder });
};

// ── DELETE /api/orders/:id ─────────────────────────────────────
// Lets a user permanently remove an order from their order history.
// Only allowed for CANCELLED or DELIVERED orders — an order that's still
// PENDING/PROCESSING/SHIPPED represents real, in-flight business (stock
// already reserved, possibly already paid via Stripe), so deleting that
// record would hide it without actually resolving it. Cancel first, then
// delete is the safe path.
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    sendError(res, 404, "Order not found");
    return;
  }

  if (order.userId !== req.user!.userId) {
    sendError(res, 403, "Access denied");
    return;
  }

  if (!["CANCELLED", "DELIVERED"].includes(order.status)) {
    sendError(res, 400, "Only cancelled or delivered orders can be deleted");
    return;
  }

  // OrderItem rows cascade-delete automatically (see schema.prisma).
  await prisma.order.delete({ where: { id } });

  sendSuccess(res, 200, "Order deleted");
};

// ── GET /api/orders/admin/all — admin only ─────────────────────
export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      items: { include: { product: { select: { id: true, name: true, images: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  sendSuccess(res, 200, "All orders fetched", { orders });
};

// ── PATCH /api/orders/admin/:id/status — admin only ───────────
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = updateOrderStatusSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    sendError(res, 404, "Order not found");
    return;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: result.data.status },
  });

  sendSuccess(res, 200, "Order status updated", { order: updated });
};
