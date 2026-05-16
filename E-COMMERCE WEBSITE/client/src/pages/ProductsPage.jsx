import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productsApi, categoriesApi } from '../api/endpoints';

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[3/4]" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const debounceRef = useRef(null);

  // Filter state from URL
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sort = searchParams.get('sort') || 'createdAt_desc';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') || '';

  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const updateParams = useCallback((updates) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    categoriesApi.list({ flat: true }).then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const [sortField, sortOrder] = sort.split('_');
    setLoading(true);
    const params = {
      page, limit: 20,
      sort: sortField, order: sortOrder,
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(inStock && { inStock }),
    };

    productsApi.list(params)
      .then(r => {
        setProducts(r.data.data || []);
        setTotal(r.data.meta?.total || 0);
        setPages(r.data.meta?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, categoryId, sort, page, minPrice, maxPrice, inStock]);

  const handlePriceFilter = () => {
    updateParams({ minPrice: priceMin, maxPrice: priceMax });
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceMin('');
    setPriceMax('');
  };

  const activeFilterCount = [categoryId, minPrice, maxPrice, inStock].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>{search ? `"${search}" — Search Results` : 'Shop All Products'} | LuxeShop</title>
        <meta name="description" content="Browse our full collection of luxury fashion. Filter by category, price, and more." />
      </Helmet>

      <div className="container-page py-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="section-label mb-1">{search ? 'Search Results' : 'Collection'}</p>
          <h1 className="section-title">
            {search ? `"${search}"` : 'All Products'}
          </h1>
          {!loading && (
            <p className="text-text-muted text-sm mt-1">{total} {total === 1 ? 'product' : 'products'}</p>
          )}
        </div>

        <div className="flex gap-6">
          {/* ─── Filter Sidebar (desktop) ──────────────────────────── */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-accent hover:text-accent-light">
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Category</h4>
              <div className="space-y-1">
                <button
                  onClick={() => updateParams({ categoryId: '' })}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${!categoryId ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateParams({ categoryId: cat.id })}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors flex justify-between ${categoryId === cat.id ? 'text-accent bg-accent/10' : 'text-text-muted hover:text-text'}`}
                  >
                    <span>{cat.name}</span>
                    {cat._count?.products !== undefined && (
                      <span className="text-text-subtle text-xs">{cat._count.products}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Price Range</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                  className="input text-sm py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                  className="input text-sm py-2"
                />
              </div>
              <button onClick={handlePriceFilter} className="btn-secondary w-full text-xs py-2">
                Apply
              </button>
            </div>

            {/* Availability */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Availability</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock === 'true'}
                  onChange={e => updateParams({ inStock: e.target.checked ? 'true' : '' })}
                  className="rounded"
                />
                <span className="text-sm text-text-muted">In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* ─── Products Area ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen(true)}
                className="btn-secondary btn-sm lg:hidden flex items-center gap-2"
              >
                <SlidersHorizontal size={14} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-3 ml-auto">
                <select
                  value={sort}
                  onChange={e => updateParams({ sort: e.target.value })}
                  className="select text-sm py-2 w-48"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* View toggle */}
                <div className="hidden sm:flex border border-base-border rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-accent text-text-inverse' : 'text-text-muted hover:text-text'}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-accent text-text-inverse' : 'text-text-muted hover:text-text'}`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {(search || categoryId || minPrice || maxPrice || inStock) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {search && (
                  <span className="badge-amber flex items-center gap-1.5">
                    <Search size={11} /> {search}
                    <button onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('search'); return n; })}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {categoryId && (
                  <span className="badge-gray flex items-center gap-1.5">
                    {categories.find(c => c.id === categoryId)?.name || 'Category'}
                    <button onClick={() => updateParams({ categoryId: '' })}><X size={11} /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="badge-gray flex items-center gap-1.5">
                    ${minPrice || '0'} – ${maxPrice || '∞'}
                    <button onClick={() => { updateParams({ minPrice: '', maxPrice: '' }); setPriceMin(''); setPriceMax(''); }}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {inStock && (
                  <span className="badge-green flex items-center gap-1.5">
                    In Stock
                    <button onClick={() => updateParams({ inStock: '' })}><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-serif text-2xl text-text mb-2">No products found</h3>
                  <p className="text-text-muted mb-6">Try adjusting your filters or search term</p>
                  <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${sort}-${page}-${categoryId}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}
                >
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', p); return n; })}
                    className={`w-9 h-9 rounded text-sm font-medium transition-all ${page === p ? 'bg-accent text-text-inverse' : 'bg-base-surface text-text-muted hover:text-text border border-base-border hover:border-accent/50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay lg:hidden" onClick={() => setFilterOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-base-surface border-r border-base-border z-50 overflow-y-auto p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl text-text">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="btn-icon"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Category</h4>
                  <div className="space-y-1">
                    <button onClick={() => { updateParams({ categoryId: '' }); setFilterOpen(false); }} className={`w-full text-left text-sm px-2 py-2 rounded ${!categoryId ? 'text-accent bg-accent/10' : 'text-text-muted'}`}>All</button>
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => { updateParams({ categoryId: cat.id }); setFilterOpen(false); }} className={`w-full text-left text-sm px-2 py-2 rounded ${categoryId === cat.id ? 'text-accent bg-accent/10' : 'text-text-muted'}`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Price</h4>
                  <div className="flex gap-2 mb-2">
                    <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} className="input text-sm py-2" />
                    <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} className="input text-sm py-2" />
                  </div>
                  <button onClick={() => { handlePriceFilter(); setFilterOpen(false); }} className="btn-primary w-full text-sm py-2">Apply</button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={inStock === 'true'} onChange={e => { updateParams({ inStock: e.target.checked ? 'true' : '' }); setFilterOpen(false); }} />
                  <span className="text-sm text-text-muted">In Stock Only</span>
                </label>
                {activeFilterCount > 0 && (
                  <button onClick={() => { clearFilters(); setFilterOpen(false); }} className="btn-secondary w-full">Clear All Filters</button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
