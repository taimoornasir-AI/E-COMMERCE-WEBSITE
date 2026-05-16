import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { productsApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productsApi.list({ limit: 100 });
      setProducts(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Helmet><title>Manage Products | Admin</title></Helmet>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-text">Products</h1>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>

        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-base-elevated overflow-hidden">
                        {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium text-text">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category?.name || '-'}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn-icon text-info hover:text-info mx-1"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="btn-icon text-error hover:text-error mx-1"><Trash2 size={16} /></button>
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
