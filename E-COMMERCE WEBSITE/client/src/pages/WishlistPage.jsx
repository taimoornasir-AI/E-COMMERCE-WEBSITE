import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingBag, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function WishlistPage() {
  const { items, fetchWishlist, toggle, isLoading } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => { fetchWishlist(); }, []);

  const handleMoveToCart = (item) => {
    const variant = item.product?.variants?.[0];
    if (variant) addItem(variant, item.product, 1);
  };

  const shareLink = `${window.location.origin}/wishlist/share/${user?.id}`;

  return (
    <>
      <Helmet><title>My Wishlist | LuxeShop</title></Helmet>
      <div className="container-page py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-1">Saved Items</p>
            <h1 className="section-title">My Wishlist</h1>
            {items.length > 0 && <p className="text-text-muted text-sm mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>}
          </div>
          {isAuthenticated() && items.length > 0 && (
            <button
              onClick={() => { navigator.clipboard.writeText(shareLink); }}
              className="btn-secondary btn-sm flex items-center gap-2"
            >
              <ExternalLink size={14} /> Share List
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-base-elevated flex items-center justify-center mx-auto mb-5">
              <Heart size={36} className="text-text-subtle" />
            </div>
            <h2 className="font-serif text-2xl text-text mb-2">Your wishlist is empty</h2>
            <p className="text-text-muted mb-6">Save items you love for later</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {items.map((item, i) => {
                const product = item.product;
                if (!product) return null;
                const image = product.images?.[0]?.url;
                const inStock = product.variants?.some(v => v.stock > 0);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="card overflow-hidden group"
                  >
                    <div className="relative aspect-[3/4] bg-base-elevated img-zoom overflow-hidden">
                      {image ? (
                        <img src={image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-base-elevated" />
                      )}
                      <button
                        onClick={() => toggle(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-error/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="p-4">
                      <Link to={`/products/${product.slug}`}>
                        <h3 className="font-serif text-sm text-text hover:text-accent transition-colors line-clamp-1">{product.name}</h3>
                      </Link>
                      <p className="font-semibold text-text mt-1">${product.price.toFixed(2)}</p>
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={!inStock}
                        className={`w-full mt-3 text-xs py-2.5 flex items-center justify-center gap-2 rounded transition-all ${
                          inStock ? 'btn-primary' : 'bg-base-elevated text-text-subtle cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag size={13} />
                        {inStock ? 'Move to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
