import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();

  if (!product) return null;

  const image = product.images?.[0]?.url;
  const inWishlist = isInWishlist(product.id);
  const firstVariant = product.variants?.[0];
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    addItem(firstVariant, product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="group"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="card product-card cursor-pointer">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-base-elevated img-zoom overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-base-elevated">
                <Eye size={32} className="text-text-subtle" />
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount && (
                <span className="badge-amber text-[10px] font-bold">
                  -{discount}%
                </span>
              )}
              {!product.inStock && (
                <span className="badge-gray text-[10px]">Sold Out</span>
              )}
              {product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                <span className="badge-green text-[10px]">New</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <button
                onClick={handleWishlist}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-elevation-2 transition-all duration-200 ${
                  inWishlist
                    ? 'bg-accent text-text-inverse'
                    : 'bg-base-surface/90 text-text hover:bg-base-elevated'
                }`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Quick add button */}
            {product.inStock && firstVariant && (
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={handleAddToCart}
                  className="w-full btn-primary py-2.5 text-xs font-semibold tracking-wide"
                >
                  <ShoppingBag size={14} /> Quick Add
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            {product.category && (
              <p className="text-[10px] font-medium text-text-subtle uppercase tracking-widest mb-1">
                {product.category.name}
              </p>
            )}
            <h3 className="font-serif text-base text-text group-hover:text-accent transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>

            {/* Rating */}
            {product.averageRating && (
              <div className="flex items-center gap-1 mt-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={11}
                      className={star <= Math.round(product.averageRating) ? 'text-accent fill-accent' : 'text-base-border fill-base-border'}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-text-subtle">({product.reviewCount || 0})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-semibold text-text">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-text-subtle line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Variants preview (colors) */}
            {product.variants?.length > 1 && (
              <div className="flex items-center gap-1 mt-2">
                {[...new Set(product.variants.map(v => v.color).filter(Boolean))].slice(0, 4).map(color => (
                  <div
                    key={color}
                    className="w-3.5 h-3.5 rounded-full border border-base-border"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {product.variants.length > 4 && (
                  <span className="text-[10px] text-text-subtle">+{product.variants.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
