import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin } from '../middleware/auth.js';
import { validate, createCouponSchema } from '../middleware/validate.js';

const router = express.Router();

// POST /api/coupons/validate — Check coupon validity
router.post('/validate', isAuth, asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) throw createError(400, 'Coupon code required.');

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) throw createError(404, 'Invalid or expired coupon code.');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw createError(400, 'Coupon has expired.');
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw createError(400, 'Coupon usage limit reached.');
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw createError(400, `Minimum order of $${coupon.minOrder.toFixed(2)} required for this coupon.`);
  }

  const discount = coupon.discountType === 'PERCENTAGE'
    ? (subtotal * coupon.discountValue) / 100
    : coupon.discountValue;

  res.json({
    success: true,
    data: {
      id: coupon.id, code: coupon.code,
      discountType: coupon.discountType, discountValue: coupon.discountValue,
      discount: Math.min(discount, subtotal),
    },
  });
}));

// GET /api/coupons — Admin: list all coupons
router.get('/', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: coupons });
}));

// POST /api/coupons — Admin: create coupon
router.post('/', isAuth, isAdmin, validate(createCouponSchema), asyncHandler(async (req, res) => {
  const coupon = await prisma.coupon.create({ data: req.body });
  res.status(201).json({ success: true, data: coupon });
}));

// PUT /api/coupons/:id — Admin: update coupon
router.put('/:id', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const updated = await prisma.coupon.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, data: updated });
}));

// DELETE /api/coupons/:id
router.delete('/:id', isAuth, isAdmin, asyncHandler(async (req, res) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}));

export default router;
