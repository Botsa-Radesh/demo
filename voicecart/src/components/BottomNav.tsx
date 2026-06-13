'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/voice-cart', label: 'Cart', icon: '🛒' },
  { href: '/carts', label: 'Carts', icon: '🛍️' },
  { href: '/splits', label: 'Splits', icon: '💰' },
  { href: '/dashboard', label: 'Coins', icon: '🪙' },
  { href: '/members', label: 'Profile', icon: '👤' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <button className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">
                {item.icon}
                {item.href === '/voice-cart' && totalItems > 0 && (
                  <span style={{ fontSize: 9, color: 'var(--amazon-orange)', marginLeft: 1 }}>{totalItems}</span>
                )}
              </span>
              <span>{item.label}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
