import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth } from '../middleware/auth.js';
import { validate, cartItemSchema } from '../middleware/validate.js';

const router = express.Router();

// GET /api/cart
router.get('/', isAuth, asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, slug: true, price: true, isActive: true,
              images: { orderBy: { order: 'asc' }, take: 1 },
            },
          },
          variant: {
            select: { id: true, name: true, size: true, color: true, stock: true, price: true },
          },
        },
      },
    },
  });

  if (!cart) {
    return res.json({ success: true, data: { items: [], subtotal: 0 } });
  }

  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.variant.price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  res.json({ success: true, data: { ...cart, subtotal } });
}));

// POST /api/cart — Add or update item
router.post('/', isAuth, validate(cartItemSchema), asyncHandler(async (req, res) => {
  const { variantId, quantity } = req.body;

  // Validate variant exists and has stock
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { product: { select: { id: true, isActive: true } } },
  });
  if (!variant) throw createError(404, 'Variant not found.');
  if (!variant.product.isActive) throw createError(400, 'Product is not available.');
  if (variant.stock < quantity) throw createError(400, `Only ${variant.stock} units available.`);

  // Get or create cart
  const cart = await prisma.cart.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id },
    update: {},
  });

  // Upsert cart item
  const item = await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, productId: variant.product.id, variantId, quantity },
    update: { quantity },
    include: {
      product: { select: { id: true, name: true, slug: true, price: true } },
      variant: { select: { id: true, name: true, size: true, color: true, price: true, stock: true } },
    },
  });

  res.json({ success: true, data: item });
}));

// PUT /api/cart/:itemId
router.put('/:itemId', isAuth, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId },
    include: { cart: true, variant: true },
  });

  if (!item || item.cart.userId !== req.user.id) throw createError(404, 'Cart item not found.');
  if (item.variant.stock < quantity) throw createError(400, `Only ${item.variant.stock} units available.`);

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: {
      product: { select: { id: true, name: true, price: true } },
      variant: { select: { id: true, name: true, price: true, stock: true } },
    },
  });

  res.json({ success: true, data: updated });
}));

// DELETE /api/cart/:itemId
router.delete('/:itemId', isAuth, asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== req.user.id) throw createError(404, 'Cart item not found.');

  await prisma.cartItem.delete({ where: { id: itemId } });
  res.json({ success: true, data: null });
}));

// DELETE /api/cart — Clear entire cart
router.delete('/', isAuth, asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  res.json({ success: true, data: null });
}));

export default router;
