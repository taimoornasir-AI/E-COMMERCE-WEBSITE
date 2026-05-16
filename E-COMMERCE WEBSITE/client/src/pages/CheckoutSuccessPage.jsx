import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { ordersApi } from '../api/endpoints';

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const orderId = params.get('orderId');

  useEffect(() => {
    if (orderId) {
      ordersApi.get(orderId).then(r => setOrder(r.data.data)).catch(() => {});
    }
  }, [orderId]);

  return (
    <>
      <Helmet><title>Order Confirmed | LuxeShop</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="font-serif text-4xl text-text mb-2">Order Confirmed!</h1>
          <p className="text-text-muted mb-1">Thank you for your purchase.</p>
          {order && <p className="text-text-subtle text-sm mb-6">Order #{order.id.slice(0, 8).toUpperCase()}</p>}

          {order && (
            <div className="card p-5 text-left mb-6 space-y-3">
              <h2 className="font-serif text-lg text-text">Order Summary</h2>
              {order.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-muted">{item.product?.name} × {item.quantity}</span>
                  <span className="text-text">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-base-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-accent">${order.total?.toFixed(2)}</span>
              </div>
            </div>
          )}

          <p className="text-text-muted text-sm mb-6">
            A confirmation email has been sent. We'll notify you when your order ships.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {order && (
              <Link to={`/account/orders/${order.id}`} className="btn-secondary flex items-center gap-2 justify-center">
                <Package size={16} /> Track Order
              </Link>
            )}
            <Link to="/products" className="btn-primary flex items-center gap-2 justify-center">
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
