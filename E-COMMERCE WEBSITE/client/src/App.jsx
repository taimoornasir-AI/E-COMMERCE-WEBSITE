import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';
import CartDrawer from './components/cart/CartDrawer';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AccountPage = lazy(() => import('./pages/account/AccountPage'));
const OrdersPage = lazy(() => import('./pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/account/OrderDetailPage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f5f0e8',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#d4a853', secondary: '#0f0f0f' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f0f0f' } },
          }}
        />

        <CartDrawer />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected customer routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/orders" element={<OrdersPage />} />
                <Route path="/account/orders/:id" element={<OrderDetailPage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute adminOnly />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/inventory" element={<AdminInventory />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}
