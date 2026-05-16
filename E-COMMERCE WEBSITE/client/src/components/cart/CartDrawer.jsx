import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export default function CartDrawer() {
  const { isOpen, closeCart, getItems, updateItem, removeItem, getSubtotal, coupon } = useCartStore();
  const items = getItems();
  const subtotal = getSubtotal();
  const navigate = useNavigate();

  const discount = coupon
    ? coupon.discountType === 'PERCENTAGE'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue
    : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal - discount + shipping;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-base-surface border-l border-base-border z-50 flex flex-col shadow-elevation-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-base-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-accent" />
                <h2 className="font-serif text-xl text-text">Your Cart</h2>
                {items.length > 0 && (
                  <span className="badge-amber text-xs">{items.length}</span>
                )}
              </div>
              <button onClick={closeCart} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-base-elevated flex items-center justify-center">
                    <ShoppingBag size={32} className="text-text-subtle" />
                  </div>
                  <div>
                    <p className="font-serif text-xl text-text">Your cart is empty</p>
                    <p className="text-sm text-text-muted mt-1">Add items to get started</p>
                  </div>
                  <button onClick={closeCart} className="btn-primary mt-2">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => {
                    const price = item.variant?.price ?? item.product?.price ?? 0;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-4 pb-4 border-b border-base-border/50 last:border-0"
                      >
                        {/* Image */}
                        <Link to={`/products/${item.product?.slug}`} onClick={closeCart} className="flex-shrink-0">
                          <div className="w-20 h-24 rounded bg-base-elevated overflow-hidden">
                            {item.product?.images?.[0]?.url ? (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-base-elevated" />
                            )}
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.product?.slug}`} onClick={closeCart}>
                            <p className="font-serif text-sm text-text hover:text-accent transition-colors line-clamp-1">
                              {item.product?.name}
                            </p>
                          </Link>
                          {item.variant?.name && (
                            <p className="text-xs text-text-muted mt-0.5">{item.variant.name}</p>
                          )}
                          <p className="text-sm font-semibold text-text mt-1">
                            ${(price * item.quantity).toFixed(2)}
                          </p>

                          {/* Qty controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 border border-base-border rounded">
                              <button
                                onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                                className="p-1.5 text-text-muted hover:text-text transition-colors"
                                aria-label="Decrease quantity"
                              >
                                {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                              </button>
                              <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="p-1.5 text-text-muted hover:text-text transition-colors"
                                disabled={item.variant?.stock <= item.quantity}
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-text-subtle hover:text-error transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="border-t border-base-border px-6 py-5 space-y-4">
                {/* Coupon */}
                {coupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Coupon ({coupon.code})</span>
                    <span className="text-success">-${discount.toFixed(2)}</span>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Shipping</span>
                    <span className={shipping === 0 ? 'text-success text-sm' : 'text-text text-sm'}>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 100 && (
                    <p className="text-xs text-text-subtle">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between font-semibold border-t border-base-border pt-2 mt-2">
                    <span className="text-text">Estimated Total</span>
                    <span className="text-accent">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <button onClick={handleCheckout} className="btn-primary w-full">
                  Checkout <ArrowRight size={16} />
                </button>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="btn-secondary w-full text-center block"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
