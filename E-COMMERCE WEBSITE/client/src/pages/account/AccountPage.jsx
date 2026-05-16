import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { User, Mail, Shield } from 'lucide-react';

export default function AccountPage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await usersApi.update(user.id, formData);
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet><title>My Account | LuxeShop</title></Helmet>
      <div className="container-page py-10 max-w-4xl">
        <h1 className="font-serif text-3xl text-text mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="card p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-3xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <h2 className="font-medium text-lg text-text">{user?.name}</h2>
              <p className="text-sm text-text-muted">{user?.email}</p>
              <div className="mt-4 inline-block badge-gray">
                 {user?.role}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl text-text flex items-center gap-2"><User size={20} /> Personal Information</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-sm text-accent hover:text-accent-light">Edit</button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="input max-w-md"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm text-text">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Mail size={12}/> Email Address</p>
                    <p className="text-sm text-text">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Shield size={12}/> Password</p>
                    <p className="text-sm text-text">••••••••</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
