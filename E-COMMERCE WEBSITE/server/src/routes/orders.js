import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin, optionalAuth } from '../middleware/auth.js';
import { validate, createOrderSchema } from '../middleware/validate.js';
import { sendOrderConfirmation } from '../services/email.js';

const router = express.Router();

const ORDER_INCLUDE = {
  items: {
    include: {
      product: { select: { id: true, name: true, slug: true } },
      variant: { select: { id: true, name: true, size: true, color: true } },
    },
  },
  address: true,
  coupon: { select: { code: true, discountType: true, discountValue: true } },
  user: { select: { id: true, name: true, email: true } },
};

// GET /api/orders — User's orders or all orders (admin)
router.get('/', isAuth, asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'ADMIN';
  const { page = 1, limit = 20, status, search } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const where = isAdmin ? {} : { userId: req.user.id };
  if (status) where.status = status;
  if (isAdmin && search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        ...ORDER_INCLUDE,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  });
}));

// GET /api/orders/:id
router.get('/:id', isAuth, asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: ORDER_INCLUDE,
  });

  if (!order) throw createError(404, 'Order not found.');
  if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
    throw createError(403, 'Access denied.');
  }

  res.json({ success: true, data: order });
}));

// POST /api/orders — Create order
router.post('/', optionalAuth, validate(createOrderSchema), asyncHandler(async (req, res) => {
  const { addressId, shippingSnapshot, guestEmail, couponCode, items } = req.body;

  if (!req.user && !guestEmail) throw createError(400, 'Guest email required for guest checkout.');

  // Validate all variants and get their data
  const variantIds = items.map(i => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { id: true, name: true, isActive: true, price: true } } },
  });

  if (variants.length !== variantIds.length) throw createError(400, 'One or more variants not found.');

  for (const item of items) {
    const variant = variants.find(v => v.id === item.variantId);
    if (!variant.product.isActive) throw createError(400, `${variant.product.name} is no longer available.`);
    if (variant.stock < item.quantity) throw createError(400, `Insufficient stock for ${variant.product.name}.`);
  }

  // Calculate pricing
  const subtotal = items.reduce((sum, item) => {
    const variant = variants.find(v => v.id === item.variantId);
    const price = variant.price ?? variant.product.price;
    return sum + price * item.quantity;
  }, 0);

  let discount = 0;
  let couponId;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      if (!coupon.minOrder || subtotal >= coupon.minOrder) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          discount = coupon.discountType === 'PERCENTAGE'
            ? (subtotal * coupon.discountValue) / 100
            : coupon.discountValue;
          couponId = coupon.id;
        }
      }
    }
  }

  const shipping = subtotal > 100 ? 0 : 9.99;
  const taxRate = 0.08;
  const taxable = subtotal - discount;
  const tax = taxable * taxRate;
  const total = taxable + tax + shipping;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock
    for (const item of items) {
      await tx.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Increment coupon usage
    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId: req.user?.id,
        guestEmail,
        addressId,
        shippingSnapshot,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        couponId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: items.map(item => {
            const variant = variants.find(v => v.id === item.variantId);
            return {
              variantId: item.variantId,
              productId: variant.product.id,
              quantity: item.quantity,
              priceAtPurchase: variant.price ?? variant.product.price,
              variantSnapshot: { name: variant.name, size: variant.size, color: variant.color },
            };
          }),
        },
      },
      include: ORDER_INCLUDE,
    });

    return newOrder;
  });

  // Send confirmation email (non-blocking)
  const email = req.user ? (await prisma.user.findUnique({ where: { id: req.user.id } }))?.email : guestEmail;
  if (email) {
    sendOrderConfirmation({ to: email, order, items: order.items }).catch(console.error);
  }

  res.status(201).json({ success: true, data: order });
}));

// PUT /api/orders/:id/status — Admin update status
router.put('/:id/status', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { status, trackingNumber, carrier } = req.body;

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, ...(trackingNumber && { trackingNumber }), ...(carrier && { carrier }) },
    include: ORDER_INCLUDE,
  });

  res.json({ success: true, data: order });
}));

export default router;

// Helper needed by payments route
export { ORDER_INCLUDE };
