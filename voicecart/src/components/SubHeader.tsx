'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categoryLinks = [
  { href: '/', label: 'All' },
  { href: '/voice-cart', label: 'Voice Cart', emoji: '🎙️' },
  { href: '/common-cart', label: 'Common Cart', emoji: '🏠' },
  { href: '/dashboard', label: 'Dashboard', emoji: '📊' },
  { href: '/members', label: 'Members', emoji: '👥' },
  { href: '/split-payment', label: 'Split & Pay', emoji: '💳' },
];

export function SubHeader() {
  const pathname = usePathname();

  return (
    <div className="sub-header desktop-only">
      <div className="sub-header-inner">
        <Link href="/" className="sub-header-item" style={{ fontWeight: 700 }}>
          <span className="hamburger">
            <span /><span /><span />
          </span>
          All
        </Link>
        {categoryLinks.slice(1).map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`sub-header-item ${pathname === link.href ? 'active' : ''}`}
          >
            {link.emoji && <span>{link.emoji}</span>}
            {link.label}
          </Link>
        ))}
        <span className="sub-header-item" style={{ opacity: 0.6 }}>Today&apos;s Deals</span>
        <span className="sub-header-item" style={{ opacity: 0.6 }}>Customer Service</span>
        <span className="sub-header-item" style={{ opacity: 0.6 }}>Gift Cards</span>
        <span className="sub-header-item" style={{ opacity: 0.6 }}>Sell</span>
      </div>
    </div>
  );
}
