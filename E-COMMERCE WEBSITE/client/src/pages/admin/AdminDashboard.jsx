import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { DollarSign, Package, ShoppingCart, Users, ArrowUpRight } from 'lucide-react';
import { ordersApi, productsApi, usersApi } from '../../api/endpoints';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0, orders: 0, products: 0, users: 0, recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersApi.list({ limit: 10 }),
      productsApi.list({ limit: 1 }),
      usersApi.list({ limit: 1 })
    ]).then(([ordersRes, productsRes, usersRes]) => {
      const orders = ordersRes.data.data;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0);
      setStats({
        revenue: totalRevenue,
        orders: ordersRes.data.meta?.total || 0,
        products: productsRes.data.meta?.total || 0,
        users: usersRes.data.meta?.total || 0,
        recentOrders: orders.slice(0, 5)
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-success bg-success/10' },
    { title: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'text-info bg-info/10' },
    { title: 'Products', value: stats.products, icon: Package, color: 'text-accent bg-accent/10' },
    { title: 'Customers', value: stats.users, icon: Users, color: 'text-warning bg-warning/10' },
  ];

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Helmet><title>Admin Dashboard | LuxeShop</title></Helmet>
      <div>
        <h1 className="font-serif text-3xl text-text mb-8">Dashboard Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="card p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">{s.title}</p>
                <h3 className="text-2xl font-bold text-text">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-6 border-b border-base-border">
            <h2 className="font-serif text-xl text-text">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-accent hover:text-accent-light flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="table-wrapper border-0 rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.id.slice(0,8)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.shippingAddress?.email || 'Guest'}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td><span className={`badge ${order.status === 'DELIVERED' ? 'badge-green' : 'badge-gray'}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
