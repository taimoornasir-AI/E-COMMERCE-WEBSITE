import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { paymentsApi, ordersApi, couponsApi } from '../api/endpoints';

const STEPS = ['Cart Review', 'Shipping', 'Payment', 'Confirmation'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              i < current ? 'bg-success text-white' :
              i === current ? 'bg-accent text-text-inverse' :
              'bg-base-elevated text-text-subtle border border-base-border'
            }`}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === current ? 'text-text font-medium' : 'text-text-subtle'}`}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-3 transition-colors duration-500 ${i < current ? 'bg-success' : 'bg-base-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function CartReview({ items, subtotal, coupon, setCoupon, onNext }) {
  const [couponCode, setCouponCode] = useState(coupon?.code || '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const { setCoupon: storeCoupon } = useCartStore();

  const discount = coupon ? (coupon.discountType === 'PERCENTAGE' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue) : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax + shipping;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res = await couponsApi.validate(couponCode, subtotal);
      storeCoupon(res.data.data);
      setCoupon(res.data.data);
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  if (!items.length) return (
    <div className="text-center py-12">
      <p className="font-serif text-2xl text-text mb-4">Your cart is empty</p>
      <button onClick={() => window.location.href = '/products'} className="btn-primary">Continue Shopping</button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map(item => {
          const price = item.variant?.price ?? item.product?.price ?? 0;
          return (
            <div key={item.id} className="card p-4 flex gap-4">
              <div className="w-16 h-20 rounded bg-base-elevated overflow-hidden flex-shrink-0">
                {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-serif text-base text-text">{item.product?.name}</p>
                {item.variant?.name && <p className="text-xs text-text-muted mt-0.5">{item.variant.name}</p>}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                  <p className="font-semibold text-text">${(price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {/* Coupon */}
        <div className="card p-4">
          <p className="text-sm font-medium text-text mb-3">Promo Code</p>
          <div className="flex gap-2">
            <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="input text-sm py-2 flex-1" placeholder="LUXE20" />
            <button onClick={applyCoupon} disabled={couponLoading} className="btn-secondary text-sm px-4 py-2 whitespace-nowrap">
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
          {couponError && <p className="text-error text-xs mt-1">{couponError}</p>}
          {coupon && <p className="text-success text-xs mt-1">✓ {coupon.code} applied</p>}
        </div>

        {/* Summary */}
        <div className="card p-4 space-y-3">
          <h3 className="font-serif text-lg text-text">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{shipping === 0 ? <span className="text-success">Free</span> : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-base-border"><span>Total</span><span className="text-accent">${total.toFixed(2)}</span></div>
          </div>
          <button onClick={onNext} className="btn-primary w-full">
            Proceed to Shipping <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShippingForm({ onNext, onBack, shippingData, setShippingData }) {
  const { user } = useAuthStore();
  const [form, setForm] = useState(shippingData || {
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    line1: '', line2: '', city: '', state: '', zip: '', country: 'US', phone: '',
  });

  const update = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setShippingData(form);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">First Name *</label><input value={form.firstName} onChange={update('firstName')} className="input" required /></div>
        <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Last Name *</label><input value={form.lastName} onChange={update('lastName')} className="input" required /></div>
      </div>
      <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Email *</label><input type="email" value={form.email} onChange={update('email')} className="input" required /></div>
      <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Address Line 1 *</label><input value={form.line1} onChange={update('line1')} className="input" placeholder="123 Main St" required /></div>
      <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Address Line 2</label><input value={form.line2} onChange={update('line2')} className="input" placeholder="Apt, Suite, etc." /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">City *</label><input value={form.city} onChange={update('city')} className="input" required /></div>
        <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">State *</label><input value={form.state} onChange={update('state')} className="input" required /></div>
        <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">ZIP *</label><input value={form.zip} onChange={update('zip')} className="input" required /></div>
      </div>
      <div><label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Phone</label><input type="tel" value={form.phone} onChange={update('phone')} className="input" /></div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">← Back</button>
        <button type="submit" className="btn-primary flex-1">Continue to Payment <ChevronRight size={16} /></button>
      </div>
    </form>
  );
}

function PaymentStep({ onBack, onComplete, subtotal, shippingData, coupon }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const { getItems, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const discount = coupon ? (coupon.discountType === 'PERCENTAGE' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue) : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax + shipping;

  const handleDemoPayment = async () => {
    setProcessing(true); setError('');
    try {
      const items = getItems();
      const orderItems = items.map(item => ({ variantId: item.variant.id, quantity: item.quantity }));
      const order = await ordersApi.create({
        shippingSnapshot: shippingData,
        guestEmail: user ? undefined : shippingData?.email,
        couponCode: coupon?.code,
        items: orderItems,
      });
      await clearCart();
      navigate(`/checkout/success?orderId=${order.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally { setProcessing(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-accent" />
          <h3 className="font-serif text-xl text-text">Secure Payment</h3>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-text-muted mb-1">Demo Mode</p>
          <p className="text-text font-semibold">Total: ${total.toFixed(2)}</p>
          <p className="text-xs text-text-subtle mt-2">
            In production, this would show Stripe Elements for card input.
            Click below to simulate a successful payment.
          </p>
        </div>

        {error && <div className="bg-error/10 border border-error/20 rounded p-3 text-sm text-error mb-4">{error}</div>}

        <div className="flex gap-3">
          <button onClick={onBack} className="btn-secondary flex-1">← Back</button>
          <button onClick={handleDemoPayment} disabled={processing} className="btn-primary flex-1">
            {processing ? (
              <span className="animate-spin w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full" />
            ) : `Place Order · $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [shippingData, setShippingData] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const { getItems, getSubtotal, coupon: storedCoupon } = useCartStore();
  const items = getItems();
  const subtotal = getSubtotal();

  useEffect(() => {
    if (storedCoupon) setCoupon(storedCoupon);
  }, []);

  return (
    <>
      <Helmet><title>Checkout | LuxeShop</title></Helmet>
      <div className="container-page py-10 max-w-5xl">
        <h1 className="font-serif text-3xl text-text text-center mb-8">Checkout</h1>
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {step === 0 && <CartReview items={items} subtotal={subtotal} coupon={coupon} setCoupon={setCoupon} onNext={() => setStep(1)} />}
            {step === 1 && <ShippingForm onNext={() => setStep(2)} onBack={() => setStep(0)} shippingData={shippingData} setShippingData={setShippingData} />}
            {step === 2 && <PaymentStep onBack={() => setStep(1)} onComplete={() => setStep(3)} subtotal={subtotal} shippingData={shippingData} coupon={coupon} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
