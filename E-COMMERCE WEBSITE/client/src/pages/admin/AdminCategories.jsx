import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tag } from 'lucide-react';
import { categoriesApi } from '../../api/endpoints';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.list({ flat: true }).then(r => setCategories(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Helmet><title>Manage Categories | Admin</title></Helmet>
      <div>
        <h1 className="font-serif text-3xl text-text mb-8">Categories</h1>
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td className="font-medium flex items-center gap-2"><Tag size={14} className="text-text-muted"/> {c.name}</td>
                  <td className="text-text-muted">{c.slug}</td>
                  <td>{c._count?.products || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
