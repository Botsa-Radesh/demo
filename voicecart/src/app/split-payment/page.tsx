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
import { calculateCoinsEarned } from '@/utils/coinsCalculator';
import { calculateMemberSubtotal } from '@/utils/priceCalc';
import { CartItem } from '@/types';

export default function SplitPaymentPage() {
  const router = useRouter();
  const { activeCart } = useCart();
  const items = activeCart?.items || [];
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const { members, currentUserId, getMemberById } = useMembers();
  const { addCoins, streak, incrementStreak } = useCoins();
  const { placeOrder, deliverySlots, addSplitRequest } = useOrder();
  const { showToast } = useToast();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotConfirmed, setSlotConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const cartMembers = useMemo(
    () => members.filter(m => activeCart?.memberIds.includes(m.id)),
    [members, activeCart?.memberIds]
  );

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setSlotConfirmed(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedSlot) { showToast('Please select a delivery slot!', 'warning'); return; }
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));

    const coinInfo = calculateCoinsEarned(totalPrice, 'amazon_pay', true, streak);
    const totalCoins = coinInfo.earned;

    const payerPayments = cartMembers.map(m => ({
      memberId: m.id,
      amount: m.id === currentUserId ? totalPrice : 0,
      method: 'amazon_pay' as const,
      status: (m.id === currentUserId ? 'paid' : 'pending') as 'paid' | 'pending',
      coinsEarned: m.id === currentUserId ? totalCoins : 0,
    }));
    addCoins(totalCoins, 'Order payment');
    incrementStreak();

    const slot = deliverySlots.find(s => s.id === selectedSlot);
    const slotTime = slot?.time || '7-9 AM';
    placeOrder(items, totalPrice, 'auto', payerPayments, slotTime, totalCoins);

    const orderId = `ord-${Date.now()}`;
    const nonPayerMembers = cartMembers.filter(m => m.id !== currentUserId);
    for (const m of nonPayerMembers) {
      const amount = calculateMemberSubtotal(items, m.id);
      if (amount <= 0) continue;
      const memberItems = items
        .filter(i => i.addedBy === m.id)
        .map(i => ({ productId: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price }));
      addSplitRequest({
        orderId,
        fromMemberId: m.id,
        toMemberId: currentUserId,
        fromName: m.name,
        toName: getMemberById(currentUserId)?.name || 'Payer',
        amount,
        splitMode: 'auto',
        items: memberItems,
        status: 'pending',
        orderTotal: totalPrice,
        deliverySlot: slotTime,
      });
    }

    setIsProcessing(false);
    setIsComplete(true);
    setShowCoins(true);
    setShowConfetti(true);

    setTimeout(() => {
      setShowCoins(false);
      setShowConfetti(false);
      router.push('/order-confirmation');
    }, 1500);
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

  const payerMember = getMemberById(currentUserId);
  const selectedSlotData = deliverySlots.find(s => s.id === selectedSlot);

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <CoinsAnimation amount={50} active={showCoins} />
      <Confetti active={showConfetti} />

      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/voice-cart')}>←</button>
        <h1>Checkout</h1>
      </div>

      {isComplete ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="checkmark">
            <svg viewBox="0 0 40 40">
              <path d="M10 20 L18 28 L30 12" style={{ strokeDasharray: 100, strokeDashoffset: 0, animation: 'checkmark 0.6s ease forwards' }} />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 8px', color: 'var(--amazon-text)' }}>Order Placed! 🎉</h2>
          <p style={{ fontSize: 14, color: 'var(--amazon-text-secondary)' }}>
            You paid ₹{totalPrice}. You can split the bill later from the order confirmation page.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '12px 16px', background: '#fef4e8', borderRadius: 8, border: '1px solid #f0c14b', fontSize: 12, color: 'var(--amazon-text)', alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>🗳️</span>
            <span>Vote for a delivery slot and pay the full bill. You can split the bill with your group later.</span>
          </div>

          {/* Cart Summary */}
          <div className="content-section" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>{totalItems} items</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>Total</span>
            </div>
            {(() => {
              const seen = new Set<string>();
              return items.map(item => {
                if (seen.has(item.addedBy) || item.isShared) return null;
                seen.add(item.addedBy);
                const member = getMemberById(item.addedBy);
                const memberItems = items.filter(i => i.addedBy === item.addedBy && !i.isShared);
                const total = memberItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
                return (
                  <div key={item.addedBy} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--amazon-text-secondary)' }}>{member?.avatar || '👤'} {member?.name || (item.addedBy === currentUserId ? 'You' : 'Guest')}</span>
                    <span>₹{total}</span>
                  </div>
                );
              });
            })()}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--amazon-border-light)', paddingTop: 8, marginTop: 4 }}>
              <span className="font-bold" style={{ color: 'var(--amazon-text)' }}>Grand Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{totalPrice}</span>
            </div>
          </div>

          {/* Expected Split */}
          {(() => {
            const splitEntries: { id: string; name: string; avatar: string; total: number; count: number; isPayer: boolean }[] = [];
            const seen = new Set<string>();
            for (const item of items) {
              if (seen.has(item.addedBy)) continue;
              seen.add(item.addedBy);
              const member = getMemberById(item.addedBy);
              const memberItems = items.filter(i => i.addedBy === item.addedBy && !i.isShared);
              const total = memberItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
              splitEntries.push({
                id: item.addedBy,
                name: member?.name || 'Guest',
                avatar: member?.avatar || '👤',
                total,
                count: memberItems.length,
                isPayer: item.addedBy === currentUserId,
              });
            }
            const nonPayerTotal = splitEntries.filter(e => !e.isPayer).reduce((s, e) => s + e.total, 0);
            return (
              <div className="content-section" style={{ marginBottom: 16, borderColor: '#be95ff' }}>
                <h3 className="section-title">📊 Expected Split (Auto)</h3>
                <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginBottom: 8 }}>
                  Each person pays for the items they added. Payer pays full bill upfront, others reimburse later.
                </p>
                {splitEntries.map(entry => {
                  const share = entry.isPayer ? totalPrice - nonPayerTotal : entry.total;
                  return (
                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--amazon-border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{entry.avatar}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>
                            {entry.name}
                            {entry.isPayer && (
                              <span style={{ fontSize: 10, color: 'var(--amazon-orange)', marginLeft: 6, fontWeight: 700 }}>Payer</span>
                            )}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                            {entry.count} item{entry.count !== 1 ? 's' : ''} added
                            {entry.isPayer && ' · pays full bill'}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{share}</p>
                        {!entry.isPayer && (
                          <p style={{ fontSize: 10, color: 'var(--amazon-text-muted)' }}>owes {payerMember?.name}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Delivery Slot Voting */}
          <DeliverySlotVoting selectedSlot={selectedSlot} onSelectSlot={handleSlotSelect} />

          {/* Confirmation + Pay */}
          {slotConfirmed && selectedSlotData && (
            <div className="amazon-card animate-slideUp" style={{
              marginTop: 12, borderColor: '#f0c14b', background: '#fffbf0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>🗳️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>
                    {payerMember?.avatar} {payerMember?.name} — <strong>{selectedSlotData.time}</strong>
                    <span style={{ fontSize: 10, color: 'var(--amazon-orange)', marginLeft: 6, fontWeight: 700 }}>Payer</span>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginTop: 2 }}>
                    You&apos;ll pay the full bill (₹{totalPrice}) upfront.
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isProcessing ? '⏳ Paying...' : `Pay ₹${totalPrice}`}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
