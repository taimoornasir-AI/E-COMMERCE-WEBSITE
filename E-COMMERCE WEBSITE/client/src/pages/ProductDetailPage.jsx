import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, Star, ChevronRight, ChevronLeft,
  ZoomIn, Truck, RotateCcw, Shield, Share2, Check
} from 'lucide-react';
import { productsApi, recommendationsApi } from '../api/endpoints';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/product/ProductCard';

const RECENTLY_VIEWED_KEY = 'recently_viewed';

function addToRecentlyViewed(product) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    const filtered = stored.filter(p => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 10);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {}
}

function ImageGallery({ images, productName }) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  if (!images?.length) return (
    <div className="aspect-[3/4] bg-base-elevated rounded-lg flex items-center justify-center">
      <ZoomIn size={48} className="text-text-subtle" />
    </div>
  );

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className={`relative aspect-[3/4] rounded-lg overflow-hidden bg-base-elevated cursor-zoom-in ${zoomed ? 'cursor-zoom-out' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].url}
            alt={`${productName} - Image ${current + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={zoomed ? {
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: 'scale(2)',
              transition: 'transform 0.1s ease',
            } : {}}
          />
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(prev => (prev - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-base/80 backdrop-blur-sm border border-base-border flex items-center justify-center text-text hover:border-accent transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrent(prev => (prev + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-base/80 backdrop-blur-sm border border-base-border flex items-center justify-center text-text hover:border-accent transition-all"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1 rounded-full transition-all duration-200 ${i === current ? 'w-6 bg-accent' : 'w-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-20 rounded overflow-hidden border-2 transition-all ${
                i === current ? 'border-accent' : 'border-base-border hover:border-accent/50'
              }`}
            >
              <img src={img.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [similar, setSimilar] = useState([]);
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    productsApi.get(slug)
      .then(res => {
        const p = res.data.data;
        setProduct(p);
        setSelectedVariant(p.variants?.[0] || null);
        addToRecentlyViewed({ ...p, images: p.images?.slice(0, 1) });
        if (p.id) {
          recommendationsApi.get({ type: 'similar', productId: p.id, limit: 4 })
            .then(r => setSimilar(r.data.data || [])).catch(() => {});
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;
    setAdding(true);
    await addItem(selectedVariant, product, quantity);
    setAdding(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Group variants by size, color
  const sizes = product ? [...new Set(product.variants?.map(v => v.size).filter(Boolean))] : [];
  const colors = product ? [...new Set(product.variants?.map(v => v.color).filter(Boolean))] : [];

  const findVariant = (size, color) => {
    return product?.variants?.find(v =>
      (!size || v.size === size) && (!color || v.color === color)
    );
  };

  const handleSizeSelect = (size) => {
    const variant = findVariant(size, selectedVariant?.color);
    setSelectedVariant(variant || product.variants?.[0]);
  };

  const handleColorSelect = (color) => {
    const variant = findVariant(selectedVariant?.size, color);
    setSelectedVariant(variant || product.variants?.[0]);
  };

  if (loading) return (
    <div className="container-page py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="skeleton aspect-[3/4] rounded-lg" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-10 w-3/4 rounded" />
          <div className="skeleton h-6 w-32 rounded" />
          <div className="skeleton h-24 w-full rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  const averageRating = product.averageRating;
  const stockLevel = selectedVariant?.stock || 0;

  return (
    <>
      <Helmet>
        <title>{product.name} | LuxeShop</title>
        <meta name="description" content={product.description?.slice(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description?.slice(0, 160)} />
        {product.images?.[0]?.url && <meta property="og:image" content={product.images[0].url} />}
      </Helmet>

      <div className="container-page py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-muted mb-8">
          <Link to="/" className="hover:text-text transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-text transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <Link to={`/products?categoryId=${product.category.id}`} className="hover:text-text transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-text truncate max-w-32">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ─── Images ─────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ImageGallery images={product.images} productName={product.name} />
          </motion.div>

          {/* ─── Info ───────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">

            {/* Category & rating */}
            <div className="flex items-center justify-between">
              {product.category && (
                <Link to={`/products?categoryId=${product.category.id}`} className="section-label hover:text-accent-light transition-colors">
                  {product.category.name}
                </Link>
              )}
              {averageRating && (
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} className={s <= Math.round(averageRating) ? 'text-accent fill-accent' : 'text-base-border fill-base-border'} />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">({product.reviewCount})</span>
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif text-4xl lg:text-5xl text-text leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-text">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-text-subtle line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
              {discount && (
                <span className="badge-amber text-sm font-bold">Save {discount}%</span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stockLevel > 5 ? 'bg-success' : stockLevel > 0 ? 'bg-warning' : 'bg-error'}`} />
              <span className={`text-sm ${stockLevel > 5 ? 'text-success' : stockLevel > 0 ? 'text-warning' : 'text-error'}`}>
                {stockLevel === 0 ? 'Out of Stock' : stockLevel <= 5 ? `Only ${stockLevel} left` : 'In Stock'}
              </span>
            </div>

            {/* Description */}
            <p className="text-text-muted leading-relaxed">{product.description}</p>

            {/* Color selector */}
            {colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text">Color</p>
                  <p className="text-sm text-text-muted">{selectedVariant?.color}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 rounded text-sm border transition-all ${
                        selectedVariant?.color === color
                          ? 'border-accent text-accent bg-accent/10'
                          : 'border-base-border text-text-muted hover:border-accent/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text">Size</p>
                  <button className="text-xs text-accent hover:text-accent-light">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => {
                    const variantForSize = findVariant(size, selectedVariant?.color) || findVariant(size, null);
                    const outOfStock = !variantForSize || variantForSize.stock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && handleSizeSelect(size)}
                        disabled={outOfStock}
                        className={`w-12 h-12 rounded text-sm font-medium border transition-all relative ${
                          selectedVariant?.size === size
                            ? 'border-accent text-accent bg-accent/10'
                            : outOfStock
                              ? 'border-base-border/50 text-text-subtle cursor-not-allowed'
                              : 'border-base-border text-text-muted hover:border-accent/50'
                        }`}
                      >
                        {size}
                        {outOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-px bg-text-subtle/30 rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            {stockLevel > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-base-border rounded overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-11 flex items-center justify-center text-text-muted hover:text-text transition-colors"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-medium text-text">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(stockLevel, q + 1))}
                      className="w-10 h-11 flex items-center justify-center text-text-muted hover:text-text transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || !selectedVariant}
                    className={`flex-1 btn btn-lg transition-all ${
                      addedSuccess
                        ? 'bg-success text-white'
                        : 'btn-primary'
                    }`}
                  >
                    {adding ? (
                      <span className="animate-spin w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full" />
                    ) : addedSuccess ? (
                      <><Check size={18} /> Added!</>
                    ) : (
                      <><ShoppingBag size={18} /> Add to Cart</>
                    )}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggle(product.id)}
                    className={`btn-icon w-12 h-12 rounded border flex-shrink-0 ${
                      inWishlist ? 'border-accent text-accent bg-accent/10' : 'border-base-border'
                    }`}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-base-border">
              {[
                { icon: Truck, text: 'Free shipping over $100' },
                { icon: RotateCcw, text: '30-day returns' },
                { icon: Shield, text: 'Secure checkout' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5 p-2">
                  <Icon size={18} className="text-accent" />
                  <p className="text-[11px] text-text-subtle leading-tight">{text}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <Link key={tag} to={`/products?search=${tag}`} className="badge-gray text-xs hover:border-accent/30 transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── Reviews Section ─────────────────────────────────────────── */}
        {product.reviews?.length > 0 && (
          <section className="mt-16 pt-12 border-t border-base-border">
            <h2 className="font-serif text-3xl text-text mb-8">
              Customer Reviews
              {averageRating && <span className="text-accent ml-3">{averageRating.toFixed(1)} ★</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map(review => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        {review.user?.avatar ? (
                          <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-accent text-sm font-bold">{review.user?.name?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{review.user?.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} className={s <= review.rating ? 'text-accent fill-accent' : 'text-base-border fill-base-border'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.isVerified && <span className="badge-green text-[10px]">Verified</span>}
                  </div>
                  {review.title && <p className="text-sm font-medium text-text mt-3">{review.title}</p>}
                  {review.body && <p className="text-sm text-text-muted mt-1 leading-relaxed">{review.body}</p>}
                  <p className="text-xs text-text-subtle mt-3">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Similar Products ─────────────────────────────────────────── */}
        {similar.length > 0 && (
          <section className="mt-16 pt-12 border-t border-base-border">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="section-label mb-1">You May Also Like</p>
                <h2 className="section-title">Similar Products</h2>
              </div>
              <Link to="/products" className="btn-ghost text-sm flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {similar.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
