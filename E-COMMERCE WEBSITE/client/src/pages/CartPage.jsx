import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function CartPage() {
  const { items, getItems, updateItem, removeItem, getSubtotal, coupon } = useCartStore();
  const navigate = useNavigate();

  const cartItems = getItems();
  const subtotal = getSubtotal();

  const discount = coupon
    ? coupon.discountType === 'PERCENTAGE'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue
    : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet><title>Your Cart | LuxeShop</title></Helmet>
        <div className="container-page py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-base-elevated flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-text-subtle" />
          </div>
          <h1 className="font-serif text-3xl text-text mb-3">Your cart is empty</h1>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Discover our latest collections to find something you'll love.
          </p>
          <Link to="/products" className="btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Your Cart ({cartItems.length}) | LuxeShop</title></Helmet>
      <div className="container-page py-10">
        <h1 className="font-serif text-3xl text-text mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items List */}
          <div className="lg:w-2/3 space-y-6">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-base-border text-xs font-semibold text-text-muted uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => {
                const price = item.variant?.price ?? item.product?.price ?? 0;
                return (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:items-center py-4 border-b border-base-border/50">
                    <div className="col-span-1 sm:col-span-6 flex gap-4">
                      <Link to={`/products/${item.product?.slug}`} className="w-20 h-24 rounded bg-base-elevated overflow-hidden flex-shrink-0">
                         {item.product?.images?.[0]?.url && (
                           <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                         )}
                      </Link>
                      <div className="flex-1">
                        <Link to={`/products/${item.product?.slug}`}>
                          <h3 className="font-serif text-base text-text hover:text-accent transition-colors">
                            {item.product?.name}
                          </h3>
                        </Link>
                        {item.variant?.name && (
                          <p className="text-sm text-text-muted mt-1">{item.variant.name}</p>
                        )}
                        <p className="text-sm font-semibold text-text mt-2 sm:hidden">${price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-3 flex justify-between sm:justify-center items-center mt-2 sm:mt-0">
                      <div className="flex items-center gap-1 border border-base-border rounded">
                        <button
                          onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text"
                        >
                          {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text"
                          disabled={item.variant?.stock <= item.quantity}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="sm:hidden text-sm text-error flex items-center gap-1">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>

                    <div className="hidden sm:flex col-span-3 justify-end items-center gap-4">
                      <p className="font-semibold text-text">${(price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeItem(item.id)} className="text-text-subtle hover:text-error transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="card p-6 sticky top-24">
              <h2 className="font-serif text-xl text-text mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm border-b border-base-border pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-text">${subtotal.toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-success">
                    <span className="flex items-center gap-1"><Tag size={12}/> Discount ({coupon.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Estimated Shipping</span>
                  <span className={shipping === 0 ? 'text-success' : 'text-text'}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 100 && (
                  <p className="text-xs text-text-subtle border-l-2 border-accent pl-2 py-1">
                    Add ${(100 - subtotal).toFixed(2)} more to your cart for free shipping.
                  </p>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Estimated Tax</span>
                  <span className="text-text">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-lg text-text mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full btn-lg mb-4"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="text-center mt-4">
                 <Link to="/products" className="text-sm text-text-muted hover:text-accent flex items-center justify-center gap-1">
                    ← Continue Shopping
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
