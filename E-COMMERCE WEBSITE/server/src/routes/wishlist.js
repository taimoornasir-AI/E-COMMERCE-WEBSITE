import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wishlist
router.get('/', isAuth, asyncHandler(async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: { select: { name: true, slug: true } },
          variants: { select: { stock: true } },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });

  const enriched = items.map(item => ({
    ...item,
    product: {
      ...item.product,
      inStock: item.product.variants.some(v => v.stock > 0),
    },
  }));

  res.json({ success: true, data: enriched });
}));

// POST /api/wishlist — Add to wishlist
router.post('/', isAuth, asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw createError(400, 'productId is required.');

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError(404, 'Product not found.');

  const item = await prisma.wishlist.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    create: { userId: req.user.id, productId },
    update: {},
    include: { product: { include: { images: { take: 1 } } } },
  });

  res.status(201).json({ success: true, data: item });
}));

// DELETE /api/wishlist/:productId
router.delete('/:productId', isAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;

  await prisma.wishlist.deleteMany({
    where: { userId: req.user.id, productId },
  });

  res.json({ success: true, data: null });
}));

// GET /api/wishlist/share/:userId — Public share link
router.get('/share/:userId', asyncHandler(async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.params.userId },
    include: {
      product: {
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: { select: { name: true, slug: true } },
          variants: { select: { stock: true } },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });

  res.json({ success: true, data: items });
}));

export default router;
