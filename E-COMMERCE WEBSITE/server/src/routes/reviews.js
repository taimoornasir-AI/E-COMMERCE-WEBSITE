import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin } from '../middleware/auth.js';
import { validate, createReviewSchema } from '../middleware/validate.js';

const router = express.Router();

// GET /api/reviews?productId=
router.get('/', asyncHandler(async (req, res) => {
  const { productId, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const where = productId ? { productId } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip, take: limitNum,
    }),
    prisma.review.count({ where }),
  ]);

  res.json({ success: true, data: reviews, meta: { total, page: pageNum, limit: limitNum } });
}));

// POST /api/reviews/:id — Review a product
router.post('/:id', isAuth, validate(createReviewSchema), asyncHandler(async (req, res) => {
  const { rating, title, body } = req.body;
  const productId = req.params.id;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw createError(404, 'Product not found.');

  // Check if user purchased the product
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: req.user.id, paymentStatus: 'PAID' },
    },
  });

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId, userId: req.user.id } },
    create: {
      productId, userId: req.user.id, rating, title, body,
      isVerified: !!purchased,
    },
    update: { rating, title, body },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  res.status(201).json({ success: true, data: review });
}));

// DELETE /api/reviews/:id — Delete own review or admin
router.delete('/:id', isAuth, asyncHandler(async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw createError(404, 'Review not found.');
  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw createError(403, 'Access denied.');
  }
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}));

export default router;
