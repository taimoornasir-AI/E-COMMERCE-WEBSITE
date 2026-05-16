import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/inventory — All variants with stock levels
router.get('/', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { lowStock, page = 1, limit = 50, search } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (lowStock === 'true') {
    where.stock = { lte: prisma.variant.fields.lowStockThreshold };
  }

  const variants = await prisma.variant.findMany({
    where,
    include: {
      product: {
        select: { id: true, name: true, slug: true, sku: true, isActive: true },
      },
    },
    orderBy: { stock: 'asc' },
    skip,
    take: limitNum,
  });

  // Filter low stock post-query (since we can't compare two columns in Prisma easily)
  const filtered = lowStock === 'true'
    ? variants.filter(v => v.stock <= v.lowStockThreshold)
    : variants;

  const total = await prisma.variant.count({ where });

  res.json({
    success: true,
    data: filtered,
    meta: { total, page: pageNum, limit: limitNum },
  });
}));

// GET /api/inventory/low-stock
router.get('/low-stock', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const variants = await prisma.variant.findMany({
    include: {
      product: { select: { id: true, name: true, slug: true, isActive: true } },
    },
    orderBy: { stock: 'asc' },
  });

  const lowStock = variants.filter(v => v.stock <= v.lowStockThreshold);

  res.json({ success: true, data: lowStock, meta: { total: lowStock.length } });
}));

// PUT /api/inventory/:variantId — Update stock
router.put('/:variantId', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { stock, delta, reason, lowStockThreshold } = req.body;
  const { variantId } = req.params;

  const variant = await prisma.variant.findUnique({ where: { id: variantId } });
  if (!variant) throw createError(404, 'Variant not found.');

  let newStock = variant.stock;
  if (delta !== undefined) {
    newStock = Math.max(0, variant.stock + parseInt(delta));
  } else if (stock !== undefined) {
    newStock = Math.max(0, parseInt(stock));
  }

  const updated = await prisma.$transaction(async (tx) => {
    const v = await tx.variant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
        ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) }),
      },
      include: { product: { select: { name: true } } },
    });

    // Log the change
    if (delta !== undefined || stock !== undefined) {
      await tx.stockLog.create({
        data: {
          variantId,
          userId: req.user.id,
          delta: newStock - variant.stock,
          reason: reason || 'Manual adjustment',
        },
      });
    }

    return v;
  });

  res.json({ success: true, data: updated });
}));

// GET /api/inventory/:variantId/logs — Stock adjustment history
router.get('/:variantId/logs', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const logs = await prisma.stockLog.findMany({
    where: { variantId: req.params.variantId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ success: true, data: logs });
}));

// GET /api/inventory/export — CSV export
router.get('/export/csv', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const variants = await prisma.variant.findMany({
    include: { product: { select: { name: true, sku: true, categoryId: true } } },
    orderBy: [{ product: { name: 'asc' } }, { name: 'asc' }],
  });

  const rows = [
    ['Product', 'Variant', 'SKU', 'Stock', 'Low Stock Threshold', 'Status'],
    ...variants.map(v => [
      v.product.name,
      v.name,
      v.sku || '',
      v.stock,
      v.lowStockThreshold,
      v.stock === 0 ? 'Out of Stock' : v.stock <= v.lowStockThreshold ? 'Low Stock' : 'In Stock',
    ]),
  ];

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
  res.send(csv);
}));

export default router;
