import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Ban } from 'lucide-react';
import { usersApi } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    usersApi.list({ limit: 50 }).then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  };

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await usersApi.updateRole(id, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Helmet><title>Manage Users | Admin</title></Helmet>
      <div>
        <h1 className="font-serif text-3xl text-text mb-8">Users</h1>
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-amber' : 'badge-gray'}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <button onClick={() => handleRoleToggle(u.id, u.role)} className="btn-icon mx-1" title="Toggle Role">
                      <Shield size={16} className={u.role === 'ADMIN' ? 'text-accent' : 'text-text-muted'} />
                    </button>
                    <button className="btn-icon mx-1 text-error" title="Deactivate">
                      <Ban size={16} />
                    </button>
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
