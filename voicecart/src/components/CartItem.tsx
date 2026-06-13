'use client';
import React from 'react';
import { CartItem as CartItemType } from '@/types';

interface Props {
  item: CartItemType;
  onRemove: (id: string) => void;
  onToggleShared: (id: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  showSharedToggle?: boolean;
  memberName?: string;
  allergyWarning?: boolean;
  onAllergyClick?: () => void;
}

export function CartItemRow({
  item,
  onRemove,
  onToggleShared,
  onUpdateQty,
  showSharedToggle = true,
  memberName,
  allergyWarning,
  onAllergyClick,
}: Props) {
  return (
    <div className={`amazon-card cart-item-enter ${allergyWarning ? 'animate-shake' : ''}`}
      style={{ display: 'flex', gap: 12, alignItems: 'center', borderColor: allergyWarning ? 'rgba(177,39,4,0.3)' : undefined, padding: 12 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#f5f5f5',
      }}>
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.textContent = item.product.emoji; (e.target as HTMLImageElement).parentElement!.style.fontSize = '24px'; }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>{item.product.name}</span>
          {allergyWarning && (
            <span className="badge badge-error" onClick={onAllergyClick} style={{ cursor: 'pointer' }}>
              ⚠️ Allergy
            </span>
          )}
          {item.product.stockStatus === 'out_of_stock' && (
            <span className="badge badge-error">Out of Stock</span>
          )}
          {item.product.stockStatus === 'low_stock' && (
            <span className="badge badge-warning">Low Stock</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>₹{item.product.price}/{item.product.unit}</span>
          {memberName && (
            <span style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>by {memberName}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="btn btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0, fontSize: 16, borderRadius: '50%' }}
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}>−</button>
          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center', color: 'var(--amazon-text)' }}>{item.quantity}</span>
          <button className="btn btn-ghost btn-sm" style={{ width: 28, height: 28, padding: 0, fontSize: 16, borderRadius: '50%' }}
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}>+</button>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, minWidth: 50, textAlign: 'right', color: 'var(--amazon-price)' }}>
          ₹{item.product.price * item.quantity}
        </span>
        {showSharedToggle && (
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: '4px 8px' }}
            onClick={() => onToggleShared(item.id)} title="Toggle shared">
            {item.isShared ? '👥' : '👤'}
          </button>
        )}
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--amazon-error)', fontSize: 16, padding: 4 }}
          onClick={() => onRemove(item.id)}>✕</button>
      </div>
    </div>
  );
}
