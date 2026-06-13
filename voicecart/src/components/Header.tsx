'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProducts } from '@/data/products';
import { Product } from '@/types';

export function Header() {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      setResults(searchProducts(val));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = (product: Product) => {
    setShowResults(false);
    setQuery('');
    router.push(`/search?q=${encodeURIComponent(product.name)}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="header">
      <div className="header-main">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="header-logo">
            <div>
              <div className="header-logo-text">
                <span className="amazon">Voice</span>
                <span className="prime">Cart</span>
              </div>
              <div className="header-logo-sub">by Amazon</div>
            </div>
          </div>
        </Link>

        <div className="header-search" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, position: 'relative' }}>
            <select aria-label="Category">
              <option>All</option>
              <option>Fruits & Vegetables</option>
              <option>Dairy</option>
              <option>Staples</option>
              <option>Snacks</option>
              <option>Beverages</option>
              <option>Personal Care</option>
              <option>Household</option>
            </select>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search VoiceCart"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => { if (results.length > 0) setShowResults(true); }}
            />
            <button type="submit" className="header-search-btn" aria-label="Search">🔍</button>
            {showResults && results.length > 0 && (
              <div className="search-results">
                {results.map(p => (
                  <div key={p.id} className="search-result-item" onClick={() => handleResultClick(p)}>
                    <img src={p.imageUrl} alt={p.name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                    <div className="result-info">
                      <div className="result-name">{p.name}</div>
                      <div className="result-price">₹{p.price}</div>
                      <div className="result-category">{p.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="header-links desktop-only">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Link href="/members" className="header-link" style={{ color: '#fff', textDecoration: 'none' }}>
                <span className="top-label">Hello, {user?.name?.split(' ')[0]}</span>
                <span className="main-label">Account & Lists</span>
              </Link>
              <button className="header-link" onClick={handleLogout} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 2 }}>
                <span className="top-label">&nbsp;</span>
                <span className="main-label" style={{ fontSize: 12 }}>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="header-link" style={{ color: '#fff', textDecoration: 'none' }}>
              <span className="top-label">Hello, Sign in</span>
              <span className="main-label">Account & Lists</span>
            </Link>
          )}
          <Link href="/dashboard" className="header-link" style={{ color: '#fff', textDecoration: 'none' }}>
            <span className="top-label">Returns</span>
            <span className="main-label">& Orders</span>
          </Link>
        </div>

        <Link href="/voice-cart" className="header-cart" style={{ color: '#fff', textDecoration: 'none' }}>
          <span className="header-cart-icon">🛒</span>
          <span className="header-cart-text desktop-only">Cart</span>
          {totalItems > 0 && <span className="header-cart-badge">{totalItems}</span>}
        </Link>
      </div>
    </header>
  );
}
