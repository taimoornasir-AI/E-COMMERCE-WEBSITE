import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye } from 'lucide-react';
import { ordersApi } from '../../api/endpoints';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.list({ limit: 50 }).then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Helmet><title>Manage Orders | Admin</title></Helmet>
      <div>
        <h1 className="font-serif text-3xl text-text mb-8">Orders</h1>

        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.id.slice(0,8)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.shippingAddress?.email || 'Guest'}</td>
                  <td>${o.total.toFixed(2)}</td>
                  <td><span className={`badge ${o.status === 'DELIVERED' ? 'badge-green' : 'badge-gray'}`}>{o.status}</span></td>
                  <td className="text-right">
                    <Link to={`/admin/orders/${o.id}`} className="btn-icon text-accent inline-flex"><Eye size={16} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
