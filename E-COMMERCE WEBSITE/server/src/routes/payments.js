import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { isAuth, isAdmin, optionalAuth } from '../middleware/auth.js';
import { createPaymentIntent, createCheckoutSession, createRefund, createOrRetrieveCustomer, listPaymentMethods } from '../services/stripe.js';

const router = express.Router();

// POST /api/payments/intent — Create PaymentIntent for Stripe Elements
router.post('/intent', optionalAuth, asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || amount <= 0) throw createError(400, 'Valid amount required.');

  let customerId;
  if (req.user) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.stripeCustomerId) {
      const customer = await createOrRetrieveCustomer({ userId: user.id, email: user.email, name: user.name });
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
      customerId = customer.id;
    } else {
      customerId = user.stripeCustomerId;
    }
  }

  const intent = await createPaymentIntent({
    amount,
    customerId,
    metadata: { orderId: orderId || '', userId: req.user?.id || 'guest' },
  });

  res.json({
    success: true,
    data: { clientSecret: intent.client_secret, paymentIntentId: intent.id },
  });
}));

// POST /api/payments/session — Create Checkout Session (Apple/Google Pay)
router.post('/session', optionalAuth, asyncHandler(async (req, res) => {
  const { items, orderId } = req.body;
  if (!items?.length) throw createError(400, 'Items required.');

  let customerId;
  if (req.user) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    customerId = user.stripeCustomerId;
  }

  // Build Stripe line items
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name, images: item.image ? [item.image] : [] },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await createCheckoutSession({
    lineItems,
    customerId,
    successUrl: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.CLIENT_URL}/checkout`,
    metadata: { orderId: orderId || '', userId: req.user?.id || 'guest' },
  });

  res.json({ success: true, data: { sessionUrl: session.url, sessionId: session.id } });
}));

// POST /api/payments/refund — Admin initiate refund
router.post('/refund', isAuth, isAdmin, asyncHandler(async (req, res) => {
  const { orderId, amount, reason } = req.body;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw createError(404, 'Order not found.');
  if (!order.stripePaymentIntentId) throw createError(400, 'No payment intent found for this order.');
  if (order.paymentStatus === 'REFUNDED') throw createError(400, 'Order already refunded.');

  const refund = await createRefund({
    paymentIntentId: order.stripePaymentIntentId,
    amount,
    reason,
  });

  // Update order status
  const isFullRefund = !amount || amount >= order.total;
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'REFUNDED',
      paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
    },
  });

  res.json({ success: true, data: { refundId: refund.id, amount: refund.amount / 100 } });
}));

// GET /api/payments/methods — Get saved payment methods
router.get('/methods', isAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user.stripeCustomerId) {
    return res.json({ success: true, data: [] });
  }

  const methods = await listPaymentMethods(user.stripeCustomerId);
  const cards = methods.data.map(m => ({
    id: m.id,
    brand: m.card.brand,
    last4: m.card.last4,
    expMonth: m.card.exp_month,
    expYear: m.card.exp_year,
  }));

  res.json({ success: true, data: cards });
}));

export default router;
