'use client';
import React from 'react';
import { ReorderPrediction, getUrgencyColor } from '@/utils/reorderPredictor';

interface ReorderPopupProps {
  predictions: ReorderPrediction[];
  onDismiss: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onAddAll: () => void;
}

export function ReorderPopup({ predictions, onDismiss, onAddToCart, onAddAll }: ReorderPopupProps) {
  if (predictions.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      padding: 16, paddingBottom: 24,
      background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        padding: 20, pointerEvents: 'auto',
        maxHeight: '60vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--amazon-text)', margin: 0 }}>
              ⏰ Time to Reorder
            </h3>
            <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', margin: '2px 0 0' }}>
              Based on your purchase history
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onDismiss}
            style={{ fontSize: 18, padding: '4px 8px', lineHeight: 1 }}>✕</button>
        </div>

        {predictions.map((p, i) => (
          <div key={p.product.id} className="animate-slideUp"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--amazon-border-light)',
            }}
          >
            <span style={{ fontSize: 24 }}>{p.product.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)', margin: 0 }}>
                {p.product.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', margin: '2px 0' }}>
                You order every {p.avgIntervalDays} days · Last ordered {p.daysSinceLastOrder} days ago
              </p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                  background: getUrgencyColor(p.urgency) + '20',
                  color: getUrgencyColor(p.urgency),
                }}>
                  {p.urgency === 'high' ? '🔴 Running out' : p.urgency === 'medium' ? '🟡 Soon' : '🟢 Getting low'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--amazon-price)' }}>₹{p.product.price} × {p.suggestedQuantity}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ fontSize: 11, whiteSpace: 'nowrap' }}
              onClick={() => onAddToCart(p.product.id, p.suggestedQuantity)}>
              + Add
            </button>
          </div>
        ))}

        {predictions.length > 1 && (
          <button className="btn btn-primary w-full" style={{ marginTop: 12 }}
            onClick={onAddAll}>
            🛒 Add All ({predictions.length} items · ₹{predictions.reduce((s, p) => s + p.suggestedQuantity * p.product.price, 0)})
          </button>
        )}
      </div>
    </div>
  );
}
