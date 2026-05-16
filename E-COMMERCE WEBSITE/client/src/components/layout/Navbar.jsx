import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, User, Search, Menu, X, ChevronDown,
  LogOut, Package, Settings, LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { categoriesApi } from '../../api/endpoints';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { getItemCount, openCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    categoriesApi.list().then(res => setCategories(res.data.data?.slice(0, 6) || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Shop', href: '/products' },
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Bestsellers', href: '/products?sort=bestSelling' },
  ];

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-accent text-text-inverse text-xs font-medium text-center py-2 px-4 tracking-wide">
        Free shipping on orders over $100 · Use code <span className="font-bold">LUXE20</span> for 20% off
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-base/95 backdrop-blur-md shadow-elevation-2 border-b border-base-border'
            : 'bg-base border-b border-base-border/50'
        }`}
      >
        <div className="container-page">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 group">
              <span className="font-serif text-2xl font-light tracking-wider text-text group-hover:text-accent transition-colors duration-300">
                Luxe<span className="text-accent">Shop</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-text-muted hover:text-text transition-colors accent-underline"
                >
                  {link.label}
                </Link>
              ))}
              {categories.length > 0 && (
                <div className="relative group">
                  <button className="text-sm font-medium text-text-muted hover:text-text transition-colors flex items-center gap-1">
                    Categories <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-base-surface border border-base-border rounded-lg shadow-elevation-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50">
                    {categories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/products?categoryId=${cat.id}`}
                        className="block px-4 py-2 text-sm text-text-muted hover:text-text hover:bg-base-elevated transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)} className="btn-icon hidden sm:flex" aria-label="Search">
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="btn-icon relative hidden sm:flex" aria-label="Wishlist">
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-text-inverse text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button onClick={openCart} className="btn-icon relative" aria-label="Cart">
                <ShoppingBag size={18} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-accent text-text-inverse text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User Menu */}
              {isAuthenticated() ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="btn-icon flex items-center gap-2"
                    aria-label="User menu"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-base-border" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                        <span className="text-accent text-xs font-semibold">
                          {user?.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-base-surface border border-base-border rounded-lg shadow-elevation-3 py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b border-base-border">
                          <p className="text-sm font-medium text-text truncate">{user?.name}</p>
                          <p className="text-xs text-text-subtle truncate">{user?.email}</p>
                        </div>
                        <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-base-elevated transition-colors">
                          <User size={15} /> Profile
                        </Link>
                        <Link to="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-base-elevated transition-colors">
                          <Package size={15} /> Orders
                        </Link>
                        {isAdmin() && (
                          <>
                            <div className="border-t border-base-border my-1" />
                            <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-base-elevated transition-colors">
                              <LayoutDashboard size={15} /> Admin Panel
                            </Link>
                          </>
                        )}
                        <div className="border-t border-base-border my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-base-elevated transition-colors w-full text-left"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="btn-secondary btn-sm hidden sm:flex">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="btn-icon lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-base-border overflow-hidden bg-base-surface"
            >
              <nav className="container-page py-4 flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link key={link.href} to={link.href} className="py-3 text-sm font-medium text-text-muted hover:text-text border-b border-base-border/50 transition-colors">
                    {link.label}
                  </Link>
                ))}
                <Link to="/wishlist" className="py-3 text-sm font-medium text-text-muted hover:text-text border-b border-base-border/50 flex items-center gap-2">
                  <Heart size={16} /> Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </Link>
                {!isAuthenticated() && (
                  <div className="flex gap-3 mt-3">
                    <Link to="/login" className="btn-secondary btn-sm flex-1 text-center">Sign In</Link>
                    <Link to="/register" className="btn-primary btn-sm flex-1 text-center">Register</Link>
                  </div>
                )}
                <button
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  className="flex items-center gap-2 py-3 text-sm font-medium text-text-muted hover:text-text mt-1"
                >
                  <Search size={16} /> Search
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overlay"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 z-[60] bg-base-surface border-b border-base-border shadow-elevation-3"
            >
              <div className="container-page py-4">
                <form onSubmit={handleSearch} className="flex items-center gap-4">
                  <Search size={20} className="text-text-muted flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products, categories, tags..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-text text-lg placeholder-text-subtle outline-none"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="btn-icon">
                    <X size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
