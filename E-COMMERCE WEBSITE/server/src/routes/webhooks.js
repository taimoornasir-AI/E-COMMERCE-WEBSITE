import express from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyWebhookSignature } from '../services/stripe.js';

const router = express.Router();

// POST /api/webhooks/stripe
router.post('/stripe', asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = verifyWebhookSignature(req.body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
  }

  console.log(`[Webhook] Received: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      const { orderId } = intent.metadata;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            stripePaymentIntentId: intent.id,
          },
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      const { orderId } = intent.metadata;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
        });

        // Restore stock
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });
        if (order) {
          for (const item of order.items) {
            await prisma.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
      break;
    }

    case 'checkout.session.completed': {
      const session = event.data.object;
      const { orderId } = session.metadata;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            stripeSessionId: session.id,
          },
        });
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const intent = charge.payment_intent;
      if (intent) {
        const isFullRefund = charge.amount_refunded >= charge.amount;
        await prisma.order.updateMany({
          where: { stripePaymentIntentId: intent },
          data: {
            status: isFullRefund ? 'REFUNDED' : 'PROCESSING',
            paymentStatus: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          },
        });
      }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
}));

export default router;
