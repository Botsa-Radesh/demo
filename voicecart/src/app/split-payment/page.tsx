'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useMembers } from '@/context/MembersContext';
import { useCoins } from '@/context/CoinsContext';
import { useOrder } from '@/context/OrderContext';
import { useToast } from '@/components/NotificationToast';
import { CoinsAnimation } from '@/components/CoinsAnimation';
import { Confetti } from '@/components/Confetti';
import { DeliverySlotVoting } from '@/components/DeliverySlotVoting';
import { MemberAvatar } from '@/components/MemberAvatar';
import { calculateSplitPayments } from '@/utils/priceCalc';
import { calculateCoinsEarned, calculateMissedCoins } from '@/utils/coinsCalculator';
import { SplitMode, PaymentMethod, MemberPayment, CartItem } from '@/types';

export default function SplitPaymentPage() {
  const router = useRouter();
  const { activeCart, clearCart } = useCart();
  const items = activeCart?.items || [];
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const { members, currentUserId, getMemberById } = useMembers();
  const { balance, addCoins, streak, incrementStreak } = useCoins();
  const { placeOrder, deliverySlots } = useOrder();
  const { showToast } = useToast();

  const [splitMode, setSplitMode] = useState<SplitMode>(activeCart?.splitMode || 'auto');
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});

  const activeMembers = useMemo(() => members.filter(m => m.isOnline), [members]);

  const recalculate = (mode: SplitMode) => {
    setSplitMode(mode);
    const newPayments = calculateSplitPayments(items, members, mode, customAmounts);
    setPayments(newPayments);
    const totalCalc = newPayments.reduce((s, p) => s + p.amount, 0);
    if (mode === 'custom' && Math.abs(totalCalc - totalPrice) > 1) {
      showToast('Amounts must equal total!', 'warning');
    }
  };

  const handleMethodChange = (memberId: string, method: PaymentMethod) => {
    setPayments(prev => prev.map(p =>
      p.memberId === memberId ? { ...p, method } : p
    ));
  };

  const handleCustomAmount = (memberId: string, amount: string) => {
    const num = parseInt(amount) || 0;
    setCustomAmounts(prev => ({ ...prev, [memberId]: num }));
    const newPayments = calculateSplitPayments(items, members, 'custom', { ...customAmounts, [memberId]: num });
    setPayments(newPayments);
  };

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const isValidSplit = Math.abs(totalPaid - totalPrice) <= 1;

  const handleConfirmPayment = async () => {
    if (!selectedSlot) { showToast('Please select a delivery slot!', 'warning'); return; }
    if (!isValidSplit) { showToast('Split amounts must equal total!', 'error'); return; }

    setIsProcessing(true);

    await new Promise(r => setTimeout(r, 2000));

    const updatedPayments = payments.map(p => {
      const coinInfo = calculateCoinsEarned(p.amount, p.method, splitMode !== 'family', streak);
      return {
        ...p,
        status: p.memberId === currentUserId ? 'paid' as const : 'pending' as const,
        coinsEarned: coinInfo.earned,
      };
    });

    const totalCoins = updatedPayments
      .filter(p => p.memberId === currentUserId)
      .reduce((s, p) => s + p.coinsEarned, 0);

    setPayments(updatedPayments);
    addCoins(totalCoins, `Order payment (${splitMode} split)`);
    incrementStreak();

    const slot = deliverySlots.find(s => s.id === selectedSlot);
    placeOrder(items, totalPrice, splitMode, updatedPayments, slot?.time || '7-9 AM', totalCoins);

    setIsProcessing(false);
    setIsComplete(true);
    setShowCoins(true);
    setShowConfetti(true);

    setTimeout(() => {
      setShowCoins(false);
      setShowConfetti(false);
      clearCart();
      router.push('/order-confirmation');
    }, 2500);
  };

  const getMissedCoins = (memberId: string) => {
    const payment = payments.find(p => p.memberId === memberId);
    if (!payment || payment.method === 'amazon_pay') return 0;
    return calculateMissedCoins(payment.amount, splitMode !== 'family', streak);
  };

  if (items.length === 0 && !isComplete) {
    return (
      <div className="page-content" style={{ paddingTop: 40, textAlign: 'center' }}>
        <span style={{ fontSize: 64 }}>🛒</span>
        <p style={{ fontSize: 16, color: 'var(--amazon-text-secondary)', margin: '16px 0' }}>
          Your cart is empty. Add items first!
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/voice-cart')}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <CoinsAnimation amount={50} active={showCoins} />
      <Confetti active={showConfetti} />

      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/voice-cart')}>←</button>
        <h1>Split & Pay</h1>
      </div>

      {isComplete ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="checkmark">
            <svg viewBox="0 0 40 40">
              <path d="M10 20 L18 28 L30 12" style={{ strokeDasharray: 100, strokeDashoffset: 0, animation: 'checkmark 0.6s ease forwards' }} />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 8px', color: 'var(--amazon-text)' }}>Payment Successful! 🎉</h2>
          <p style={{ fontSize: 14, color: 'var(--amazon-text-secondary)' }}>Redirecting to order confirmation...</p>
        </div>
      ) : (
        <>
          {/* Cart Summary */}
          <div className="content-section" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>{totalItems} items</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>Total</span>
            </div>
            {activeMembers.map(m => {
              const memberItems = items.filter(i => i.addedBy === m.id);
              const subtotal = memberItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
              if (subtotal === 0) return null;
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--amazon-text-secondary)' }}>{m.avatar} {m.name}</span>
                  <span>₹{subtotal}</span>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--amazon-border-light)', paddingTop: 8, marginTop: 4 }}>
              <span className="font-bold" style={{ color: 'var(--amazon-text)' }}>Grand Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{totalPrice}</span>
            </div>
          </div>

          {/* Split Mode Selector */}
          <h3 className="section-title">Split Mode</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {([
              { id: 'family', icon: '👨‍👩‍👧', title: 'Family Mode', desc: 'One pays all' },
              { id: 'auto', icon: '🧾', title: 'Auto Split', desc: 'Items + share of shared' },
              { id: 'equal', icon: '➗', title: 'Equal Split', desc: 'Total ÷ members' },
              { id: 'custom', icon: '✏️', title: 'Custom', desc: 'Set your own' },
            ] as { id: SplitMode; icon: string; title: string; desc: string }[]).map(m => (
              <div key={m.id}
                className={`split-card ${splitMode === m.id ? 'selected' : ''}`}
                onClick={() => recalculate(m.id)}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: 'var(--amazon-text)' }}>{m.title}</p>
                <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Payment Breakdown */}
          {payments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 className="section-title">Payment Breakdown</h3>
              {payments.map(p => {
                const member = getMemberById(p.memberId);
                if (!member) return null;
                const addedValue = items
                  .filter(i => i.addedBy === p.memberId && !i.isShared)
                  .reduce((s, i) => s + i.product.price * i.quantity, 0);
                const coinInfo = calculateCoinsEarned(p.amount, p.method, splitMode !== 'family', streak);
                const missed = getMissedCoins(p.memberId);
                return (
                  <div key={p.memberId} className="amazon-card" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <MemberAvatar member={member} size={36} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>{member.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 2 }}>
                          Added ₹{addedValue} worth of items
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <select value={p.method}
                            onChange={e => handleMethodChange(p.memberId, e.target.value as PaymentMethod)}
                            style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, width: 'auto' }}>
                            <option value="amazon_pay">⭐ Amazon Pay</option>
                            <option value="phonepay">PhonePe</option>
                            <option value="paytm">Paytm</option>
                            <option value="gpay">GPay</option>
                            <option value="card">Card/Net Banking</option>
                          </select>
                          {splitMode === 'custom' && (
                            <input
                              type="number"
                              value={customAmounts[p.memberId] || 0}
                              onChange={e => handleCustomAmount(p.memberId, e.target.value)}
                              style={{ width: 80, fontSize: 12, padding: '4px 8px', borderRadius: 4 }}
                            />
                          )}
                        </div>
                        {p.method === 'amazon_pay' ? (
                          <p style={{ fontSize: 11, color: 'var(--amazon-success)', marginTop: 2 }}>
                            🪙 Earn {coinInfo.earned} coins!
                          </p>
                        ) : (
                          <p style={{ fontSize: 11, color: 'var(--amazon-orange)', marginTop: 2 }}>
                            ⚠️ Miss {missed} coins by not using Amazon Pay
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Pays</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{p.amount}</p>
                        <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                          {p.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!isValidSplit && (
                <p style={{ fontSize: 12, color: 'var(--amazon-error)', marginTop: 4 }}>
                  Split amounts (₹{totalPaid}) must equal total (₹{totalPrice})
                </p>
              )}
            </div>
          )}

          {/* Delivery Slot Voting */}
          <DeliverySlotVoting selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />

          {/* Confirm Button */}
          <button
            className="btn btn-primary btn-lg w-full mt-20"
            onClick={handleConfirmPayment}
            disabled={isProcessing || !isValidSplit}
            style={{ opacity: isProcessing || !isValidSplit ? 0.6 : 1 }}
          >
            {isProcessing ? (
              <span>⏳ Processing Payment...</span>
            ) : (
              <span>✅ Confirm & Pay ₹{totalPrice}</span>
            )}
          </button>

          {/* Nudge Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {payments.filter(p => p.memberId !== currentUserId && p.status === 'pending').map(p => {
              const m = getMemberById(p.memberId);
              return (
                <button key={p.memberId} className="btn btn-secondary btn-sm"
                  onClick={() => showToast(`🔔 Payment reminder sent to ${m?.name || 'member'}!`, 'success')}>
                  🔔 Nudge {m?.name || 'Member'}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
