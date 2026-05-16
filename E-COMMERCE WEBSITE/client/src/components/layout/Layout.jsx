import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';

export default function Layout() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  // Fetch user data on mount / auth change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated()]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const noFooterRoutes = ['/checkout'];
  const showFooter = !noFooterRoutes.some(r => location.pathname.startsWith(r));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
