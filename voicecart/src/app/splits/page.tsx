'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder } from '@/context/OrderContext';
import { useMembers } from '@/context/MembersContext';
import { useToast } from '@/components/NotificationToast';
import { MemberAvatar } from '@/components/MemberAvatar';
import { SplitRequest } from '@/types';

export default function SplitsPage() {
  const router = useRouter();
  const { splitRequests, markSplitPaid, getPendingSplitsForMember, getSentSplitsForMember } = useOrder();
  const { members, currentUserId, getMemberById } = useMembers();
  const { showToast } = useToast();

  const pendingSplits = useMemo(() => getPendingSplitsForMember(currentUserId), [currentUserId, getPendingSplitsForMember]);
  const sentSplits = useMemo(() => getSentSplitsForMember(currentUserId), [currentUserId, getSentSplitsForMember]);
  const history = useMemo(() => splitRequests.filter(s => s.status === 'paid'), [splitRequests]);

  const handleMarkPaid = (splitId: string) => {
    markSplitPaid(splitId);
    showToast('✅ Marked as paid!', 'success');
  };

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/dashboard')}>←</button>
        <h1>My Splits</h1>
      </div>

      {/* Pending — what I owe */}
      <h3 className="section-title" style={{ fontSize: 16 }}>📋 I Owe</h3>
      {pendingSplits.length === 0 ? (
        <div className="amazon-card" style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>✅</span>
          <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)', marginTop: 8 }}>You don&apos;t owe anyone. All cleared!</p>
        </div>
      ) : (
        pendingSplits.map(s => (
          <SplitCard key={s.id} split={s} onMarkPaid={handleMarkPaid} showActions />
        ))
      )}

      {/* Sent — what others owe me */}
      <h3 className="section-title" style={{ fontSize: 16, marginTop: 24 }}>💰 Others Owe Me</h3>
      {sentSplits.filter(s => s.status === 'pending').length === 0 ? (
        <div className="amazon-card" style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>🪙</span>
          <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)', marginTop: 8 }}>No pending payments owed to you.</p>
        </div>
      ) : (
        sentSplits.filter(s => s.status === 'pending').map(s => (
          <SplitCard key={s.id} split={s} onMarkPaid={handleMarkPaid} showActions={false} />
        ))
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <h3 className="section-title" style={{ fontSize: 16, marginTop: 24 }}>📜 History</h3>
          {history.map(s => (
            <SplitCard key={s.id} split={s} onMarkPaid={handleMarkPaid} showActions={false} faded />
          ))}
        </>
      )}
    </div>
  );
}

function SplitCard({ split, onMarkPaid, showActions, faded }: {
  split: SplitRequest;
  onMarkPaid: (id: string) => void;
  showActions: boolean;
  faded?: boolean;
}) {
  const { getMemberById } = useMembers();
  const toMember = getMemberById(split.toMemberId);
  const fromMember = getMemberById(split.fromMemberId);

  return (
    <div className="amazon-card" style={{
      marginBottom: 12,
      opacity: faded ? 0.55 : 1,
      borderColor: split.status === 'paid' ? 'var(--amazon-success)' : 'var(--amazon-border-light)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <MemberAvatar member={toMember || fromMember || { id: '', name: '', avatar: '👤', role: 'member', diet: 'veg', allergies: [], favoriteBrands: [], dislikes: [], isOnline: false, isTyping: false }} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>
              {split.fromMemberId === split.toMemberId
                ? 'You'
                : `${fromMember?.name || split.fromName} → ${toMember?.name || split.toName}`}
            </p>
            <span className={`badge ${split.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
              {split.status === 'paid' ? 'Paid' : 'Pending'}
            </span>
          </div>

          <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginTop: 2 }}>
            Order #{split.orderId.slice(-6).toUpperCase()} · {split.deliverySlot}
            · {split.splitMode === 'family' ? 'Family' : split.splitMode === 'auto' ? 'Auto' : split.splitMode === 'equal' ? 'Equal' : 'Custom'} split
          </p>

          {split.items.length > 0 && split.splitMode === 'auto' && (
            <div style={{ marginTop: 4 }}>
              {split.items.slice(0, 3).map((item, i) => (
                <p key={i} style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                  {item.quantity}x {item.name} — ₹{item.price * item.quantity}
                </p>
              ))}
              {split.items.length > 3 && (
                <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                  +{split.items.length - 3} more items
                </p>
              )}
            </div>
          )}

          <p style={{ fontSize: 10, color: 'var(--amazon-text-muted)', marginTop: 4 }}>
            {new Date(split.createdAt).toLocaleDateString()} · {split.status === 'paid' && split.paidAt ? `Paid ${new Date(split.paidAt).toLocaleDateString()}` : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Amount</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--amazon-price)' }}>₹{split.amount}</p>
          {showActions && split.status === 'pending' && (
            <button
              className="btn btn-success btn-sm"
              style={{ marginTop: 8, fontSize: 11 }}
              onClick={() => onMarkPaid(split.id)}
            >
              ✅ Mark Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
