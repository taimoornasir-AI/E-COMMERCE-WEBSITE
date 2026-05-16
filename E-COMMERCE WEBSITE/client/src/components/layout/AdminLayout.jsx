import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Layers,
  LogOut, ChevronRight, Store, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Inventory', href: '/admin/inventory', icon: Layers },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-base">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-base-surface border-r border-base-border flex flex-col">
        {/* Brand */}
        <div className="p-5 border-b border-base-border">
          <NavLink to="/" className="flex items-center gap-2 text-text hover:text-accent transition-colors">
            <Store size={18} className="text-accent" />
            <span className="font-serif text-lg">Luxe<span className="text-accent">Shop</span></span>
          </NavLink>
          <p className="text-xs text-text-subtle mt-1 font-medium tracking-wide uppercase">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-base-border space-y-1">
          <NavLink to="/" className="nav-item">
            <Store size={16} /> View Store
          </NavLink>
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-text truncate">{user?.name}</p>
              <p className="text-[10px] text-text-subtle truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item w-full text-left text-error hover:text-error hover:bg-error/10">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
