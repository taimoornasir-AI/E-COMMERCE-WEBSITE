import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/recommendations?userId=&productId=&type=
router.get('/', asyncHandler(async (req, res) => {
  const { userId, productId, type = 'similar', limit = 8 } = req.query;
  const limitNum = Math.min(20, parseInt(limit));

  let products = [];

  if (type === 'similar' && productId) {
    // Content-based: same category + overlapping tags
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, tags: true, id: true },
    });

    if (product) {
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          id: { not: productId },
          OR: [
            { categoryId: product.categoryId },
            { tags: { hasSome: product.tags } },
          ],
        },
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          variants: { select: { stock: true } },
          _count: { select: { orderItems: true } },
        },
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
      });
    }
  } else if (type === 'trending') {
    // Trending: most ordered in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trending = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: sevenDaysAgo }, paymentStatus: 'PAID' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limitNum,
    });

    const ids = trending.map(t => t.productId);
    const trendingProducts = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        variants: { select: { stock: true } },
      },
    });

    // Preserve ranking order
    products = ids
      .map(id => trendingProducts.find(p => p.id === id))
      .filter(Boolean);
  } else if (type === 'bestsellers') {
    const bestsellers = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limitNum,
    });

    const ids = bestsellers.map(b => b.productId);
    const bestProducts = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        variants: { select: { stock: true } },
      },
    });
    products = ids.map(id => bestProducts.find(p => p.id === id)).filter(Boolean);

  } else if (type === 'new-arrivals') {
    products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });
  } else if (type === 'bundle' && productId) {
    // "Complete the Look" — find bundles containing this product
    const bundles = await prisma.bundle.findMany({
      where: { isActive: true, products: { some: { productId } } },
      include: {
        products: {
          where: { productId: { not: productId } },
          include: {
            product: {
              include: {
                images: { orderBy: { order: 'asc' }, take: 1 },
                variants: { select: { stock: true } },
              },
            },
          },
        },
      },
      take: 1,
    });
    products = bundles.flatMap(b => b.products.map(bp => bp.product)).slice(0, limitNum);
  }

  // Add computed fields
  const enriched = products.map(p => ({
    ...p,
    inStock: p.variants?.some(v => v.stock > 0),
  }));

  res.json({ success: true, data: enriched });
}));

export default router;
