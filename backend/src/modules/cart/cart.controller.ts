import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/response.utils";
import { z } from "zod";

// ── Schemas ────────────────────────────────────────────────────
const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().positive().default(1),
});

const updateCartSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
});

// ── Helper: Get or Create Cart ─────────────────────────────────
const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountPrice: true,
              images: true,
              stock: true,
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                images: true,
                stock: true,
                category: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

// ── Format Cart Response ───────────────────────────────────────
const formatCart = (cart: Awaited<ReturnType<typeof getOrCreateCart>>) => {
  const items = cart.items.map((item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return {
      id: item.id,
      quantity: item.quantity,
      product: item.product,
      subtotal: parseFloat((price * item.quantity).toFixed(2)),
    };
  });

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    items,
    total: parseFloat(total.toFixed(2)),
    itemCount,
  };
};

// GET /api/cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await getOrCreateCart(req.user!.userId);
  sendSuccess(res, 200, "Cart fetched", { cart: formatCart(cart) });
};

// POST /api/cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const result = addToCartSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { productId, quantity } = result.data;

  // Check product exists and has stock
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    sendError(res, 404, "Product not found");
    return;
  }
  if (product.stock < quantity) {
    sendError(res, 400, `Only ${product.stock} items available in stock`);
    return;
  }

  const cart = await getOrCreateCart(req.user!.userId);

  // Check if item already exists
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) {
      sendError(res, 400, `Only ${product.stock} items available in stock`);
      return;
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  const updatedCart = await getOrCreateCart(req.user!.userId);
  sendSuccess(res, 200, "Item added to cart", { cart: formatCart(updatedCart) });
};

// PUT /api/cart/:itemId
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const { itemId } = req.params as { itemId: string };

  const result = updateCartSchema.safeParse(req.body);
  if (!result.success) {
    sendError(res, 400, result.error.issues[0].message);
    return;
  }

  const { quantity } = result.data;

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });

  if (!item || item.cart.userId !== req.user!.userId) {
    sendError(res, 404, "Cart item not found");
    return;
  }

  if (item.product.stock < quantity) {
    sendError(res, 400, `Only ${item.product.stock} items available in stock`);
    return;
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  const updatedCart = await getOrCreateCart(req.user!.userId);
  sendSuccess(res, 200, "Cart updated", { cart: formatCart(updatedCart) });
};

// DELETE /api/cart/:itemId
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  const { itemId } = req.params as { itemId: string };

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== req.user!.userId) {
    sendError(res, 404, "Cart item not found");
    return;
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  const updatedCart = await getOrCreateCart(req.user!.userId);
  sendSuccess(res, 200, "Item removed from cart", { cart: formatCart(updatedCart) });
};

// DELETE /api/cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!cart) {
    sendSuccess(res, 200, "Cart is already empty");
    return;
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  sendSuccess(res, 200, "Cart cleared");
};