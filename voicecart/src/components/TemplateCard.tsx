'use client';
import React from 'react';
import { Template } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from './NotificationToast';

interface Props {
  template: Template;
  onDelete?: (id: string) => void;
  onLoad?: (id: string) => void;
}

export function TemplateCard({ template, onDelete }: Props) {
  const { loadTemplate } = useCart();
  const { showToast } = useToast();

  const handleLoad = () => {
    loadTemplate(template.id);
    showToast(`Loaded ${template.name}!`, 'success');
  };

  return (
    <div className="amazon-card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 8, background: 'rgba(255,153,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>
        📋
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>{template.name}</p>
        <p style={{ fontSize: 12, color: 'var(--amazon-text-muted)' }}>
          {template.totalItems} items • ~₹{template.totalPrice}
        </p>
      </div>
      <button className="btn btn-primary btn-sm" onClick={handleLoad}>
        Load
      </button>
      {onDelete && (
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--amazon-error)' }} onClick={() => onDelete(template.id)}>
          ✕
        </button>
      )}
    </div>
  );
}
