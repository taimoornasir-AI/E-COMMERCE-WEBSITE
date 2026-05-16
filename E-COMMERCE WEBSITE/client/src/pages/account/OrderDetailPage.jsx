import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { ordersApi } from '../../api/endpoints';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ordersApi.get(id)
      .then(res => setOrder(res.data.data))
      .catch(() => navigate('/account/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="container-page py-10">
      <div className="skeleton h-8 w-64 mb-6" />
      <div className="skeleton h-[400px] w-full rounded-lg" />
    </div>
  );

  if (!order) return null;

  const discount = order.coupon ? (order.coupon.discountType === 'PERCENTAGE' ? (order.subtotal * order.coupon.discountValue) / 100 : order.coupon.discountValue) : 0;
  const shipping = order.subtotal > 100 ? 0 : 9.99;
  const tax = (order.subtotal - discount) * 0.08;

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-success text-white';
      case 'SHIPPED': return 'bg-blue-500 text-white';
      case 'CANCELLED': return 'bg-error text-white';
      default: return 'bg-base-elevated text-text';
    }
  };

  const shippingAddr = order.shippingAddress;

  return (
    <>
      <Helmet><title>Order #{order.id.slice(0, 8).toUpperCase()} | LuxeShop</title></Helmet>
      <div className="container-page py-10 max-w-4xl">
        <Link to="/account/orders" className="text-sm text-text-muted hover:text-text flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Back to Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-text">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-text-muted mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-serif text-lg text-text mb-4 flex items-center gap-2"><Package size={18} /> Items</h2>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-base-border/50 last:border-0 last:pb-0">
                    <Link to={`/products/${item.product?.slug}`} className="w-16 h-20 rounded bg-base-elevated overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                    </Link>
                    <div className="flex-1">
                      <Link to={`/products/${item.product?.slug}`} className="font-medium text-text hover:text-accent transition-colors">
                        {item.product?.name}
                      </Link>
                      {item.variant?.name && <p className="text-xs text-text-muted mt-0.5">{item.variant.name}</p>}
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                        <p className="font-semibold text-text">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-serif text-lg text-text mb-4">Summary</h2>
              <div className="space-y-2 text-sm border-b border-base-border pb-4 mb-4">
                <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-text-muted">Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Tax</span><span>${tax.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between font-semibold text-lg text-text">
                <span>Total</span><span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-serif text-lg text-text mb-4 flex items-center gap-2"><MapPin size={18} /> Shipping</h2>
              {shippingAddr ? (
                <div className="text-sm text-text-muted space-y-1">
                  <p className="font-medium text-text">{shippingAddr.firstName} {shippingAddr.lastName}</p>
                  <p>{shippingAddr.line1}</p>
                  {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                  <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zip}</p>
                  <p>{shippingAddr.country}</p>
                </div>
              ) : (
                <p className="text-sm text-text-muted">No shipping info</p>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-serif text-lg text-text mb-4 flex items-center gap-2"><CreditCard size={18} /> Payment</h2>
              <div className="text-sm text-text-muted space-y-1">
                <p>Status: <span className="font-medium text-text">{order.paymentStatus}</span></p>
                {order.stripePaymentIntentId && <p className="text-xs break-all mt-2">Ref: {order.stripePaymentIntentId}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
