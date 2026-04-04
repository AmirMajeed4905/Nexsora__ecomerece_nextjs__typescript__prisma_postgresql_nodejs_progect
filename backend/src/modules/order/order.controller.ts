// src/modules/order/order.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { z } from "zod";

// ── Schemas ────────────────────────────────────────────────────
const createOrderSchema = z.object({
  address: z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone is required"),
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// ── POST /api/orders ───────────────────────────────────────────
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
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

    // Create order + order items (transaction-safe)
    const newOrder = await prisma.$transaction(
      async (tx) => {
        return await tx.order.create({
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
      },
      { timeout: 10000 } // Increase transaction timeout to 10s
    );

    // Decrement stock (outside transaction)
    await Promise.all(
      cart.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    sendSuccess(res, 201, "Order placed successfully", { order: newOrder });
  } catch (err: any) {
    console.error("Create order error:", err);
    sendError(res, 500, "Failed to create order");
  }
};

// ── GET /api/orders ────────────────────────────────────────────
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (err: any) {
    sendError(res, 500, "Failed to fetch orders");
  }
};

// ── GET /api/orders/:id ────────────────────────────────────────
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (err: any) {
    sendError(res, 500, "Failed to fetch order");
  }
};

// ── PATCH /api/orders/:id/cancel ──────────────────────────────
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (err: any) {
    sendError(res, 500, "Failed to cancel order");
  }
};

// ── GET /api/orders/admin/all — admin only ─────────────────────
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, 200, "All orders fetched", { orders });
  } catch (err: any) {
    sendError(res, 500, "Failed to fetch all orders");
  }
};

// ── PATCH /api/orders/admin/:id/status — admin only ───────────
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const result = updateStatusSchema.safeParse(req.body);
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
  } catch (err: any) {
    sendError(res, 500, "Failed to update order status");
  }
};