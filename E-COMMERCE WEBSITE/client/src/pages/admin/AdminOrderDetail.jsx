import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { ordersApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    ordersApi.get(id).then(r => {
      setOrder(r.data.data);
      setStatus(r.data.data.status);
    });
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      await ordersApi.updateStatus(id, { status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (!order) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Helmet><title>Order {order.id.slice(0,8)} | Admin</title></Helmet>
      <div>
        <Link to="/admin/orders" className="text-sm text-text-muted hover:text-text flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl text-text">Order #{order.id.slice(0,8)}</h1>
          <div className="flex gap-2">
            <select value={status} onChange={e => setStatus(e.target.value)} className="select">
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button onClick={handleUpdateStatus} className="btn-primary">Update</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 card p-6">
            <h3 className="font-serif text-lg mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p>${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-1 space-y-6">
             <div className="card p-6">
                <h3 className="font-serif text-lg mb-4">Summary</h3>
                <div className="flex justify-between mb-2"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
             </div>
             <div className="card p-6">
                <h3 className="font-serif text-lg mb-4">Customer</h3>
                <p className="text-sm">{order.shippingAddress?.email}</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
