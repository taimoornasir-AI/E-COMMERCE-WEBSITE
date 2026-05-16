import Stripe from 'stripe';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const createOrRetrieveCustomer = async ({ userId, email, name }) => {
  // This is called when a user doesn't have a stripeCustomerId yet
  const customer = await stripe.customers.create({ email, name, metadata: { userId } });
  return customer;
};

export const createPaymentIntent = async ({ amount, currency = 'usd', customerId, metadata = {} }) => {
  const params = {
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    payment_method_types: ['card'],
  };
  if (customerId) {
    params.customer = customerId;
    params.setup_future_usage = 'off_session'; // Save card for future use
  }
  return stripe.paymentIntents.create(params);
};

export const createCheckoutSession = async ({ lineItems, successUrl, cancelUrl, customerId, metadata = {} }) => {
  const params = {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    payment_intent_data: { metadata },
    billing_address_collection: 'required',
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
    automatic_tax: { enabled: false },
  };
  if (customerId) params.customer = customerId;
  return stripe.checkout.sessions.create(params);
};

export const createRefund = async ({ paymentIntentId, amount, reason = 'requested_by_customer' }) => {
  const params = { payment_intent: paymentIntentId, reason };
  if (amount) params.amount = Math.round(amount * 100);
  return stripe.refunds.create(params);
};

export const listPaymentMethods = async (customerId) => {
  return stripe.paymentMethods.list({ customer: customerId, type: 'card' });
};

export const verifyWebhookSignature = (payload, signature) => {
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

export default stripe;
