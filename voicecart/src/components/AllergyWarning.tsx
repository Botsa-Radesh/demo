'use client';
import React from 'react';
import { AllergyWarning as AllergyWarningType } from '@/utils/allergyChecker';
import { useCart } from '@/context/CartContext';
import { useToast } from './NotificationToast';

interface Props {
  warning: AllergyWarningType;
  onClose: () => void;
}

export function AllergyWarningModal({ warning, onClose }: Props) {
  const { addItem, removeItem } = useCart();
  const { showToast } = useToast();

  const handleSwap = () => {
    if (warning.suggestedSwap) {
      addItem(warning.suggestedSwap, 1, 'm1');
      removeItem(warning.productId);
      showToast(`Swapped ${warning.productName} → ${warning.suggestedSwap.name}`, 'success');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 8, color: 'var(--amazon-text)' }}>Allergy Alert</h2>
          <p style={{ fontSize: 14, color: 'var(--amazon-text-secondary)', marginTop: 4 }}>
            {warning.productName} contains allergens
          </p>
        </div>

        {warning.allergens.map((a, i) => (
          <div key={i} className="amazon-card" style={{ marginBottom: 8, borderColor: 'rgba(177,39,4,0.3)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-error)' }}>🚫 {a.allergen}</p>
            <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)' }}>
              Affected: {a.affectedMembers.map(m => m.name).join(', ')}
            </p>
          </div>
        ))}

        {warning.suggestedSwap && (
          <div className="amazon-card" style={{ marginTop: 12, borderColor: 'rgba(6,125,98,0.3)' }}>
            <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>Suggested Swap:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 32 }}>{warning.suggestedSwap.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>{warning.suggestedSwap.name}</p>
                <p style={{ fontSize: 12, color: 'var(--amazon-text-muted)' }}>₹{warning.suggestedSwap.price}/{warning.suggestedSwap.unit}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSwap}>Swap</button>
            </div>
          </div>
        )}

        <button className="btn btn-secondary w-full mt-16" onClick={onClose}>
          Keep Anyway
        </button>
      </div>
    </div>
  );
}
