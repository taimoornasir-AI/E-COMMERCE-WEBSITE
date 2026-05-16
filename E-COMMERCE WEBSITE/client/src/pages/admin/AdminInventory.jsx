import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, Download } from 'lucide-react';
import { inventoryApi } from '../../api/endpoints';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      inventoryApi.list({ limit: 50 }),
      inventoryApi.lowStock()
    ]).then(([listRes, lowRes]) => {
      setItems(listRes.data.data);
      setLowStock(lowRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const res = await inventoryApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Helmet><title>Inventory | Admin</title></Helmet>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl text-text">Inventory</h1>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>

        {lowStock.length > 0 && (
          <div className="mb-8 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 text-warning mb-2 font-medium">
              <AlertCircle size={18} /> Low Stock Alerts ({lowStock.length})
            </div>
            <div className="space-y-1 text-sm text-text">
              {lowStock.slice(0,3).map(i => (
                <p key={i.id}>{i.product?.name} ({i.name}) - Only {i.stock} left</p>
              ))}
              {lowStock.length > 3 && <p className="text-text-muted">...and {lowStock.length - 3} more</p>}
            </div>
          </div>
        )}

        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td className="font-medium">{i.product?.name}</td>
                  <td>{i.name}</td>
                  <td>{i.stock}</td>
                  <td>
                    <span className={`badge ${i.stock === 0 ? 'badge-error' : i.stock <= 5 ? 'badge-warning' : 'badge-green'}`}>
                      {i.stock === 0 ? 'Out of Stock' : i.stock <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
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
