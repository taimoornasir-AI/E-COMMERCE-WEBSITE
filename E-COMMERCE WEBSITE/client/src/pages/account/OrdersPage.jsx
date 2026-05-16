import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ChevronRight } from 'lucide-react';
import { ordersApi } from '../../api/endpoints';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list({ limit: 50 })
      .then(res => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'badge-green';
      case 'SHIPPED': return 'badge-blue';
      case 'CANCELLED': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  return (
    <>
      <Helmet><title>My Orders | LuxeShop</title></Helmet>
      <div className="container-page py-10 max-w-5xl">
        <h1 className="font-serif text-3xl text-text mb-8">Order History</h1>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-6 skeleton h-24" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 card">
            <Package size={40} className="text-text-subtle mx-auto mb-4" />
            <h2 className="font-serif text-xl text-text mb-2">No orders yet</h2>
            <p className="text-text-muted mb-6">When you place an order, it will appear here.</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-text">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={getStatusColor(order.status)}>{order.status}</span>
                  </div>
                  <p className="text-sm text-text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-text-muted mt-1">{order.items?.length || 0} items • ${order.total.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-base-surface bg-base-elevated overflow-hidden relative z-[3-i]">
                        {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-base-surface bg-base-elevated flex items-center justify-center text-[10px] font-medium z-0">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <Link to={`/account/orders/${order.id}`} className="btn-secondary btn-sm flex items-center gap-1">
                    Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
