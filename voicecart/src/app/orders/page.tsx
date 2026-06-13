'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { useCart } from '@/context/CartContext';
import { useMembers } from '@/context/MembersContext';
import { useToast } from '@/components/NotificationToast';

export default function OrdersPage() {
  const router = useRouter();
  const { history } = useOrder();
  const { addItem, activeCart } = useCart();
  const { getMemberById, currentUserId } = useMembers();
  const { showToast } = useToast();

  const handleReorder = (orderId: string) => {
    const order = history.find(o => o.id === orderId);
    if (!order) return;
    if (!activeCart) {
      showToast('Select a cart first!', 'warning');
      return;
    }

    let addedCount = 0;
    for (const item of order.items) {
      addItem(item.product, item.quantity, currentUserId, item.isShared);
      addedCount++;
    }
    showToast(`Reordered ${addedCount} items to cart!`, 'success');
    router.push('/voice-cart');
  };

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/dashboard')} aria-label="Go back">←</button>
        <h1>Order History</h1>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-title">No orders yet</p>
          <p className="empty-state-desc">
            Once you complete your first order, it will appear here for easy reordering.
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/voice-cart')}>
            🎙️ Start Shopping
          </button>
        </div>
      ) : (
        <div>
          {history.map(order => {
            const date = new Date(order.date);
            return (
              <div key={order.id} className="amazon-card animate-fadeIn" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                      {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {order.deliverySlot}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{order.totalAmount}</p>
                    <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'confirmed' ? 'badge-info' : 'badge-warning'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {order.items.slice(0, 5).map(item => (
                    <span key={item.id} style={{
                      fontSize: 11, padding: '3px 8px', background: 'var(--amazon-light)',
                      borderRadius: 12, color: 'var(--amazon-text-secondary)',
                    }}>
                      {item.product.emoji} {item.quantity}x {item.product.name}
                    </span>
                  ))}
                  {order.items.length > 5 && (
                    <span style={{ fontSize: 11, padding: '3px 8px', color: 'var(--amazon-text-muted)' }}>
                      +{order.items.length - 5} more
                    </span>
                  )}
                </div>

                {/* Split & Coins Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--amazon-border-light)', paddingTop: 8 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                    <span>{order.items.length} items</span>
                    <span>{order.splitMode} split</span>
                    {order.coinsEarned > 0 && (
                      <span style={{ color: 'var(--amazon-success)' }}>🪙 +{order.coinsEarned}</span>
                    )}
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
                    onClick={() => handleReorder(order.id)}>
                    🔄 Reorder
                  </button>
                </div>

                {/* Member Payments */}
                {order.memberPayments.length > 1 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--amazon-border-light)' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {order.memberPayments.filter(p => p.amount > 0).map(p => {
                        const member = getMemberById(p.memberId);
                        return (
                          <span key={p.memberId} style={{ fontSize: 11, color: 'var(--amazon-text-secondary)' }}>
                            {member?.avatar} {member?.name}: ₹{p.amount}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
