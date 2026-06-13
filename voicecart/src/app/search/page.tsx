'use client';
import React, { Suspense, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useMembers } from '@/context/MembersContext';
import { useToast } from '@/components/NotificationToast';
import { searchProducts } from '@/data/products';
import { Product } from '@/types';

const ALL_CATEGORIES = [
  'All',
  'Fruits & Vegetables',
  'Dairy',
  'Staples',
  'Snacks',
  'Beverages',
  'Personal Care',
  'Household',
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

function StarRating({ rating }: { rating: number }) {
  return <span style={{ color: '#FEBD69', fontSize: 13 }}>{'⭐'.repeat(Math.floor(rating))}</span>;
}

function SearchResultsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';

  const { addItem, activeCartId, activeCart, createPersonalCart, setActiveCart, personalCartId } = useCart();
  const { currentUserId, getMemberById } = useMembers();
  const { showToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');

  const allResults = useMemo(() => searchProducts(q), [q]);

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? allResults : allResults.filter(p => p.category === activeCategory);
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allResults, activeCategory, sortBy]);

  // Fake but consistent ratings
  const getRating = useCallback((id: string) => {
    const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return { rating: 3.5 + (seed % 5) * 0.3, count: 100 + (seed * 37) % 5000 };
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!activeCartId) {
      if (!personalCartId) {
        createPersonalCart(currentUserId, getMemberById(currentUserId)?.name || 'You');
      } else {
        setActiveCart(personalCartId);
      }
    }
    addItem(product, 1, currentUserId, false);
    showToast(`${product.name} added to cart!`, 'success');
  };

  // Category counts for sidebar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allResults.length };
    for (const p of allResults) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [allResults]);

  if (!q.trim()) {
    return (
      <div style={{ maxWidth: 900, margin: '60px auto', textAlign: 'center', padding: '0 16px' }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <h2 style={{ marginTop: 12, color: 'var(--amazon-text)' }}>What are you looking for?</h2>
        <p style={{ color: 'var(--amazon-text-secondary)', marginTop: 8 }}>
          Use the search bar above to find products.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '16px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: 'var(--amazon-text-secondary)', marginBottom: 12 }}>
        <span
          style={{ cursor: 'pointer', color: 'var(--amazon-link)' }}
          onClick={() => router.push('/')}
        >
          Home
        </span>
        {' › '}
        <span>Search results for &quot;<strong style={{ color: 'var(--amazon-text)' }}>{q}</strong>&quot;</span>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 200,
          flexShrink: 0,
          background: '#fff',
          border: '1px solid var(--amazon-border)',
          borderRadius: 8,
          padding: 16,
          position: 'sticky',
          top: 80,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--amazon-text)' }}>
            Department
          </div>
          {ALL_CATEGORIES.map(cat => (
            <div
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeCategory === cat ? 700 : 400,
                color: activeCategory === cat ? 'var(--amazon-orange-dark)' : 'var(--amazon-text)',
                background: activeCategory === cat ? '#fff8e1' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 2,
              }}
            >
              <span>{cat}</span>
              <span style={{ color: 'var(--amazon-text-muted)', fontWeight: 400 }}>
                ({categoryCounts[cat] || 0})
              </span>
            </div>
          ))}
        </aside>

        {/* ── Main results ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Results header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div style={{ fontSize: 14, color: 'var(--amazon-text-secondary)' }}>
              {filtered.length > 0
                ? <>
                    <strong style={{ color: 'var(--amazon-text)' }}>{filtered.length}</strong>
                    {' result'}
                    {filtered.length !== 1 ? 's' : ''}
                    {' for '}
                    <strong>&quot;{q}&quot;</strong>
                    {activeCategory !== 'All' && <> in <strong>{activeCategory}</strong></>}
                  </>
                : <>No results for <strong>&quot;{q}&quot;</strong></>
              }
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* No results state */}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--amazon-text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
              <h3 style={{ color: 'var(--amazon-text)', marginBottom: 8 }}>
                No results found{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
              </h3>
              <p style={{ fontSize: 14, marginBottom: 16 }}>
                Try a different search term or browse all categories.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setActiveCategory('All')}
              >
                Show all categories
              </button>
            </div>
          )}

          {/* Product grid */}
          {filtered.length > 0 && (
            <div className="product-grid">
              {filtered.map(product => {
                const { rating, count } = getRating(product.id);
                return (
                  <div key={product.id} className="product-card animate-fadeIn">
                    <div
                      className="product-image"
                      onClick={() => router.push(`/voice-cart?add=${product.id}`)}
                      style={{ overflow: 'hidden', cursor: 'pointer' }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                        onError={e => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) parent.textContent = product.emoji;
                        }}
                      />
                    </div>

                    <div
                      className="product-title"
                      onClick={() => router.push(`/voice-cart?add=${product.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name}
                    </div>

                    <div className="product-rating">
                      <StarRating rating={rating} />
                      <span className="count" style={{ marginLeft: 4 }}>({count.toLocaleString()})</span>
                    </div>

                    <div className="product-price">
                      <span className="price-symbol">₹</span>{product.price}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginBottom: 4 }}>
                      {product.brand} · {product.unit}
                    </div>

                    {/* Category badge */}
                    <div style={{
                      display: 'inline-block',
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 10,
                      background: '#eaf4fb',
                      color: 'var(--amazon-blue)',
                      marginBottom: 8,
                      fontWeight: 500,
                    }}>
                      {product.category}
                    </div>

                    {product.stockStatus === 'low_stock' && (
                      <div style={{ fontSize: 11, color: '#B12704', marginBottom: 4 }}>
                        Only a few left!
                      </div>
                    )}
                    {product.stockStatus === 'out_of_stock' && (
                      <div style={{ fontSize: 11, color: '#B12704', marginBottom: 4 }}>
                        Currently unavailable
                      </div>
                    )}

                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockStatus === 'out_of_stock'}
                    >
                      {product.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 32 }}>🔍</div>
        <p style={{ marginTop: 8, color: 'var(--amazon-text-secondary)' }}>Searching...</p>
      </div>
    }>
      <SearchResultsInner />
    </Suspense>
  );
}
