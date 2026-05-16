import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Sparkles, TrendingUp, Clock, Star } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { recommendationsApi, categoriesApi } from '../api/endpoints';

const RECENTLY_VIEWED_KEY = 'recently_viewed';

function useRecentlyViewed() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      setProducts(stored);
    } catch {}
  }, []);
  return products;
}

function SectionReveal({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProductCarousel({ title, icon: Icon, products, label, emptyMsg }) {
  const scrollRef = useRef(null);
  if (!products?.length) return null;

  return (
    <SectionReveal>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="section-label mb-1">{label}</p>
          <h2 className="section-title flex items-center gap-3">
            {Icon && <Icon size={22} className="text-accent" />}
            {title}
          </h2>
        </div>
        <Link to="/products" className="btn-ghost text-sm hidden sm:flex items-center gap-1">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-none pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product, i) => (
          <div key={product.id} className="flex-shrink-0 w-60 sm:w-72" style={{ scrollSnapAlign: 'start' }}>
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>
    </SectionReveal>
  );
}

export default function HomePage() {
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const recentlyViewed = useRecentlyViewed();

  useEffect(() => {
    recommendationsApi.get({ type: 'trending', limit: 8 })
      .then(r => setTrending(r.data.data || [])).catch(() => {});
    recommendationsApi.get({ type: 'new-arrivals', limit: 8 })
      .then(r => setNewArrivals(r.data.data || [])).catch(() => {});
    recommendationsApi.get({ type: 'bestsellers', limit: 8 })
      .then(r => setBestsellers(r.data.data || [])).catch(() => {});
    categoriesApi.list({ flat: true })
      .then(r => setCategories(r.data.data?.slice(0, 6) || [])).catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>LuxeShop — Luxury Fashion Curated for You</title>
        <meta name="description" content="Discover premium clothing, accessories and footwear. Curated luxury fashion for the modern wardrobe." />
      </Helmet>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-base via-base-surface to-base" />
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent" style={{ backgroundPosition: '80% 50%' }} />

        {/* Decorative lines */}
        <div className="absolute top-1/4 right-0 w-px h-64 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        <div className="absolute top-1/2 right-12 w-px h-32 bg-gradient-to-b from-transparent via-accent/20 to-transparent" />

        <div className="container-page relative z-10 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="section-label mb-4">New Collection 2026</p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-6xl sm:text-7xl lg:text-8xl text-text leading-[1.0] tracking-tight"
            >
              Dressed for
              <br />
              <span className="text-accent italic">Every Moment</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-text-muted text-lg mt-6 max-w-lg leading-relaxed"
            >
              A curated edit of luxury fashion. Each piece selected for its craftsmanship,
              timeless design, and the story it tells.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 mt-10"
            >
              <Link to="/products" className="btn-primary btn-lg">
                Explore Collection <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=newest" className="btn-secondary btn-lg">
                New Arrivals
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-8 mt-14 pt-8 border-t border-base-border/50"
            >
              {[
                { value: '500+', label: 'Products' },
                { value: '50+', label: 'Brands' },
                { value: '4.9★', label: 'Rating' },
                { value: '24h', label: 'Shipping' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold font-serif text-text">{stat.value}</p>
                  <p className="text-xs text-text-subtle mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16 border-t border-base-border/30">
          <div className="container-page">
            <SectionReveal className="mb-8">
              <p className="section-label mb-1">Browse by</p>
              <h2 className="section-title">Categories</h2>
            </SectionReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    to={`/products?categoryId=${cat.id}`}
                    className="group block bg-base-surface hover:bg-base-elevated border border-base-border hover:border-accent/40 rounded-lg p-4 text-center transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                      <span className="text-accent font-serif font-bold text-lg">
                        {cat.name[0]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-text group-hover:text-accent transition-colors line-clamp-1">
                      {cat.name}
                    </p>
                    {cat._count?.products !== undefined && (
                      <p className="text-[10px] text-text-subtle mt-0.5">{cat._count.products} items</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Trending ─────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-base-border/30">
        <div className="container-page">
          <ProductCarousel
            title="Trending Now"
            label="What's Hot"
            icon={TrendingUp}
            products={trending}
          />
        </div>
      </section>

      {/* ─── Feature Banner ───────────────────────────────────────────────── */}
      <SectionReveal>
        <section className="py-8">
          <div className="container-page">
            <div className="rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="section-label mb-2">Limited Time</p>
                <h2 className="font-serif text-4xl text-text">
                  20% Off Your First Order
                </h2>
                <p className="text-text-muted mt-2">Use code <span className="text-accent font-bold font-mono">LUXE20</span> at checkout</p>
              </div>
              <Link to="/products" className="btn-primary btn-lg flex-shrink-0">
                Shop Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ─── New Arrivals ─────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-base-border/30">
        <div className="container-page">
          <ProductCarousel
            title="New Arrivals"
            label="Just Landed"
            icon={Sparkles}
            products={newArrivals}
          />
        </div>
      </section>

      {/* ─── Bestsellers ──────────────────────────────────────────────────── */}
      {bestsellers.length > 0 && (
        <section className="py-16 border-t border-base-border/30">
          <div className="container-page">
            <ProductCarousel
              title="Bestsellers"
              label="Most Loved"
              icon={Star}
              products={bestsellers}
            />
          </div>
        </section>
      )}

      {/* ─── Recently Viewed ──────────────────────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section className="py-16 border-t border-base-border/30">
          <div className="container-page">
            <ProductCarousel
              title="Recently Viewed"
              label="Your History"
              icon={Clock}
              products={recentlyViewed}
            />
          </div>
        </section>
      )}

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <SectionReveal>
        <section className="py-16 border-t border-base-border/30">
          <div className="container-page">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $100' },
                { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
                { icon: '🔒', title: 'Secure Payment', desc: 'Stripe-powered checkout' },
                { icon: '⭐', title: 'Premium Quality', desc: 'Curated luxury pieces' },
              ].map(f => (
                <div key={f.title} className="text-center p-6 rounded-lg border border-base-border hover:border-accent/30 transition-colors">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-serif text-lg text-text">{f.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>
    </>
  );
}
