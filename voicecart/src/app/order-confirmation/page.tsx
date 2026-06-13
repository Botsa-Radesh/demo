'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { useMembers } from '@/context/MembersContext';
import { useCoins } from '@/context/CoinsContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/NotificationToast';
import { Confetti } from '@/components/Confetti';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { currentOrder } = useOrder();
  const { members, getMemberById } = useMembers();
  const { balance } = useCoins();
  const { saveTemplate } = useCart();
  const { showToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!currentOrder) {
    return (
      <div className="page-content" style={{ paddingTop: 40, textAlign: 'center' }}>
        <span style={{ fontSize: 64 }}>📦</span>
        <p style={{ fontSize: 16, color: 'var(--amazon-text-secondary)', margin: '16px 0' }}>
          No order found. Place an order first!
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/voice-cart')}>
          Start Shopping
        </button>
      </div>
    );
  }

  const memberCoins = currentOrder.memberPayments.map(p => {
    const m = getMemberById(p.memberId);
    return { name: m?.name || 'Unknown', coins: p.coinsEarned, method: p.method };
  });

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplate(templateName.trim(), currentOrder.items.map(i => ({ productId: i.product.id, quantity: i.quantity })));
    showToast(`Template "${templateName}" saved!`, 'success');
    setShowSaveTemplate(false);
    setTemplateName('');
  };

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <Confetti active={showConfetti} />

      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div className="checkmark">
          <svg viewBox="0 0 40 40">
            <path d="M10 20 L18 28 L30 12" style={{ strokeDasharray: 100, strokeDashoffset: 0, animation: 'checkmark 0.6s ease forwards' }} />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '16px 0 4px', color: 'var(--amazon-text)' }}>Order Placed! 🎉</h1>
        <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>
          Order #{currentOrder.id.slice(-6).toUpperCase()}
        </p>
      </div>

      {/* Delivery ETA */}
      <div className="content-section" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>🚚 Delivery</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-success)' }}>{currentOrder.deliverySlot} Tomorrow</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '35%' }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 4 }}>Preparing your order...</p>
      </div>

      {/* Delivery Route Map */}
      <div className="map-placeholder" style={{ marginBottom: 16 }}>
        <div className="route-dot" />
        <div className="route-line" />
        <div className="route-end" />
        <span style={{ position: 'absolute', left: '5%', top: '30%', fontSize: 11, color: 'var(--amazon-text-secondary)' }}>📍 Store</span>
        <span style={{ position: 'absolute', right: '5%', top: '30%', fontSize: 11, color: 'var(--amazon-text-secondary)' }}>🏠 Home</span>
        <span style={{ position: 'absolute', bottom: 12, fontSize: 10, color: 'var(--amazon-text-muted)' }}>
          {currentOrder.deliverySlot} • Driver assigned
        </span>
      </div>

      {/* Order Summary */}
      <div className="content-section" style={{ marginBottom: 16 }}>
        <h3 className="section-title">📋 Order Summary</h3>
        <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)', marginBottom: 8 }}>
          {currentOrder.items.length} items • {currentOrder.splitMode} split
        </p>
        {members.map(m => {
          const memberItems = currentOrder.items.filter(i => i.addedBy === m.id);
          if (memberItems.length === 0) return null;
          const subtotal = memberItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
          return (
            <div key={m.id} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--amazon-text)' }}>
                {m.avatar} {m.name} — ₹{subtotal}
              </p>
              {memberItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--amazon-text-secondary)', padding: '2px 0' }}>
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ borderTop: '1px solid var(--amazon-border-light)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span className="font-bold" style={{ color: 'var(--amazon-text)' }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{currentOrder.totalAmount}</span>
        </div>
      </div>

      {/* Coins Earned */}
      <div className="content-section" style={{ marginBottom: 16, border: '1px solid #f0c14b' }}>
        <h3 className="section-title">🪙 Coins Earned</h3>
        {memberCoins.map((mc, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--amazon-text)' }}>{mc.name}</span>
            <span style={{ color: mc.method === 'amazon_pay' ? 'var(--amazon-orange)' : 'var(--amazon-text-muted)' }}>
              {mc.method === 'amazon_pay' ? `🪙 +${mc.coins} coins` : `😢 ${mc.coins} missed!`}
            </span>
          </div>
        ))}
        <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 4 }}>
          Balance: 🪙 {balance.toLocaleString()} coins
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }}
          onClick={() => setShowSaveTemplate(!showSaveTemplate)}>
          📋 Save as Template
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }}
          onClick={() => {
            const text = `Just ordered from VoiceCart! 🛒 ₹${currentOrder.totalAmount} • ${currentOrder.items.length} items`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}>
          📱 Share Order
        </button>
        <button className="btn btn-secondary" style={{ flex: 1 }}
          onClick={() => showToast('Thanks for rating! ⭐', 'success')}>
          ⭐ Rate
        </button>
      </div>

      {showSaveTemplate && (
        <div className="amazon-card animate-slideUp mt-12" style={{ display: 'flex', gap: 8 }}>
          <input
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="Template name (e.g. Weekly Groceries)"
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSaveTemplate}>Save</button>
        </div>
      )}

      <button className="btn btn-primary btn-lg w-full mt-20"
        onClick={() => router.push('/dashboard')}>
        📊 View Dashboard
      </button>
    </div>
  );
}
