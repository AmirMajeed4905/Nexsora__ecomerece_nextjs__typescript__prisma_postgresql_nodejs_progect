import { prisma } from "../../config/prisma";
import { Request, Response } from "express";
import {
  addToCartSchema,
  updateCartSchema,
  removeCartItemSchema,
} from "../../validations/cart.schema";

// ── Get Cart ─────────────────────────────────────────────
export const getCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

 const cart = await prisma.cart.findUnique({
  where: { userId },
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            discountPrice: true,
            images: true,
          },
        },
      },
    },
  },
});

  res.json(cart);
};

// ── Add To Cart ──────────────────────────────────────────
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { productId, quantity } = addToCartSchema.parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) { res.status(404).json({ message: "Product not found" }); return; }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) { res.status(400).json({ message: "Stock exceeded" }); return; }

    await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: newQuantity } });
  } else {
    if (product.stock < quantity) { res.status(400).json({ message: "Not enough stock" }); return; }
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  }

  res.json({ message: "Item added to cart" });
};

// ── Update Cart Item ─────────────────────────────────────
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const { itemId, quantity } = updateCartSchema.parse(req.body);

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { product: true, cart: true },
  });

  if (!item) { res.status(404).json({ message: "Item not found" }); return; }
  if (item.cart.userId !== req.user!.userId) { res.status(403).json({ message: "Unauthorized" }); return; }
  if (item.product.stock < quantity) { res.status(400).json({ message: "Stock exceeded" }); return; }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  res.json({ message: "Cart updated" });
};

// ── Remove Item ──────────────────────────────────────────
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  const { itemId } = removeCartItemSchema.parse(req.params);

  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item) { res.status(404).json({ message: "Item not found" }); return; }
  if (item.cart.userId !== req.user!.userId) { res.status(403).json({ message: "Unauthorized" }); return; }

  await prisma.cartItem.delete({ where: { id: itemId } });
  res.json({ message: "Item removed" });
};

// ── Clear Cart ───────────────────────────────────────────
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) { res.json({ message: "Cart already empty" }); return; }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ message: "Cart cleared" });
};