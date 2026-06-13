'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCoins } from '@/context/CoinsContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/NotificationToast';
import { useMembers } from '@/context/MembersContext';
import { products } from '@/data/products';
import { Product } from '@/types';

const categories = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'Fruits & Vegetables', label: 'Fruits & Veg', emoji: '🥬' },
  { id: 'Dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'Staples', label: 'Staples', emoji: '🍚' },
  { id: 'Snacks', label: 'Snacks', emoji: '🍪' },
  { id: 'Beverages', label: 'Beverages', emoji: '🥤' },
  { id: 'Personal Care', label: 'Personal Care', emoji: '🧴' },
  { id: 'Household', label: 'Household', emoji: '🧹' },
];

function StarRating({ rating }: { rating: number }) {
  const stars = '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  return <span className="stars">{stars}</span>;
}

export default function HomePage() {
  const router = useRouter();
  const { balance, nextMilestone } = useCoins();
  const { addItem, activeCart, activeCartId, createPersonalCart, setActiveCart, personalCartId } = useCart();
  const { currentUserId, getMemberById } = useMembers();
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');

  const productRatings = useMemo(() => {
    const ratings: Record<string, { rating: number; count: number }> = {};
    products.forEach((p, i) => {
      ratings[p.id] = {
        rating: 3.5 + (i % 5) * 0.3,
        count: 100 + (i * 37) % 5000,
      };
    });
    return ratings;
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

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

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">🎙️ AI-POWERED VOICE SHOPPING</div>
          <h1>
            Your Flat Shops Together <span className="hero-highlight">in 30 Seconds</span>
          </h1>
          <p>Voice-powered group shopping for your Amazon quick-commerce needs. Just speak, and we&apos;ll handle the rest.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/voice-cart" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              🎙️ Start Voice Shopping
            </Link>
            <Link href="/common-cart" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
              👥 Create Group Cart
            </Link>
          </div>
        </div>
        <div className="hero-products">
          <div className="hero-product-icon">🛒</div>
          <div className="hero-product-icon">🎤</div>
          <div className="hero-product-icon">👥</div>
          <div className="hero-product-icon">🪙</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 16px' }}>
        {/* Category Strip */}
        <div className="category-strip">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Deals Banner */}
        <div className="deals-banner animate-fadeIn">
          <div>
            <h2>🔥 Today&apos;s Deals</h2>
            <p>Limited time offers on your favorite products</p>
          </div>
          <div className="deals-timer">
            <span>⏱️</span>
            <span>Ends in: <strong>12h 35m</strong></span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="content-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              {activeCategory === 'all' ? '🔥 Trending Products' : `📦 ${activeCategory}`}
            </h2>
            <button className="btn btn-link" onClick={() => setActiveCategory('all')}>
              {activeCategory !== 'all' ? 'View All' : ''}
            </button>
          </div>

          <div className="product-grid">
            {filteredProducts.slice(0, 12).map(product => {
              const rating = productRatings[product.id];
              return (
                <div key={product.id} className="product-card animate-fadeIn">
                  <div
                    className="product-image"
                    onClick={() => router.push(`/voice-cart?add=${product.id}`)}
                    style={{ overflow: 'hidden' }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                      onError={(e) => { const img = e.target as HTMLImageElement; img.style.display = 'none'; const parent = img.parentElement; if (parent) { parent.textContent = product.emoji; } }}
                    />
                  </div>
                  <div
                    className="product-title"
                    onClick={() => router.push(`/voice-cart?add=${product.id}`)}
                  >
                    {product.name}
                  </div>
                  <div className="product-rating">
                    <StarRating rating={rating.rating} />
                    <span className="count">({rating.count.toLocaleString()})</span>
                  </div>
                  <div className="product-price">
                    <span className="price-symbol">₹</span>{product.price}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginBottom: 8 }}>
                    {product.brand} · {product.unit}
                  </div>
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Link href="/voice-cart" style={{ textDecoration: 'none' }}>
            <div className="amazon-card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer' }}>
              <span style={{ fontSize: 40 }}>🎙️</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 4px', color: 'var(--amazon-text)' }}>Solo Voice Cart</h3>
              <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Shop alone with voice commands</p>
            </div>
          </Link>
          <Link href="/common-cart" style={{ textDecoration: 'none' }}>
            <div className="amazon-card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer' }}>
              <span style={{ fontSize: 40 }}>🏠</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 4px', color: 'var(--amazon-text)' }}>Common Cart</h3>
              <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Create or join a group shopping cart</p>
            </div>
          </Link>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div className="amazon-card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer' }}>
              <span style={{ fontSize: 40 }}>🪙</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 4px', color: 'var(--amazon-text)' }}>Amazon Coins</h3>
              <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Earn & redeem rewards</p>
            </div>
          </Link>
          <Link href="/members" style={{ textDecoration: 'none' }}>
            <div className="amazon-card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer' }}>
              <span style={{ fontSize: 40 }}>👤</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '12px 0 4px', color: 'var(--amazon-text)' }}>Members</h3>
              <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Manage profiles & preferences</p>
            </div>
          </Link>
        </div>

        {/* Coins Banner */}
        <div className="content-section" style={{ border: '1px solid #f0c14b', background: '#fffbf0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)' }}>🪙 My Amazon Coins Balance</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--amazon-orange)', marginTop: 2 }}>{balance.toLocaleString()}</p>
            </div>
            <Link href="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>View Dashboard</Link>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-fill" style={{ width: `${nextMilestone.progress * 100}%` }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 4 }}>
            {nextMilestone.remaining > 0
              ? `${nextMilestone.remaining} more coins to unlock ${nextMilestone.label}`
              : 'All rewards unlocked!'}
          </p>
        </div>
      </div>
    </div>
  );
}
