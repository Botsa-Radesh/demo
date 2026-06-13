'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCommonCart } from '@/context/CommonCartContext';
import { useMembers } from '@/context/MembersContext';
import { useToast } from '@/components/NotificationToast';

export default function CartsPage() {
  const router = useRouter();
  const { personalCartId, carts, commonCarts, activeCartId, setActiveCart, leaveCommonCart } = useCart();
  const { pendingInvites, joinCommonCartByCode } = useCommonCart();
  const { members, addMember, currentUserId, getMemberById } = useMembers();
  const { showToast } = useToast();

  const personalCart = personalCartId ? carts[personalCartId] : null;

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/dashboard')}>←</button>
        <h1>My Carts</h1>
      </div>

      {/* Personal Cart */}
      {personalCart && (
        <div className="amazon-card" style={{
          padding: 12, marginBottom: 16,
          background: '#f0fff4', borderColor: '#b7e4c7',
          border: activeCartId === personalCart.id ? '2px solid #f0c14b' : '1px solid #b7e4c7',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>🛒</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>
                  {personalCart.name}
                  {activeCartId === personalCart.id && (
                    <span style={{ fontSize: 10, color: 'var(--amazon-orange)', marginLeft: 6 }}>● Active</span>
                  )}
                </p>
                <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginTop: 2 }}>
                  {personalCart.items.length} items · {personalCart.splitMode} split · Personal
                </p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
              onClick={() => { setActiveCart(personalCart.id); router.push('/voice-cart'); }}>
              Open
            </button>
          </div>
        </div>
      )}

      {/* Common Carts */}
      <h3 className="section-title" style={{ fontSize: 14, marginBottom: 8 }}>👥 Common Carts</h3>
      {commonCarts.length === 0 ? (
        <div className="amazon-card" style={{ textAlign: 'center', padding: 32, marginBottom: 16 }}>
          <span style={{ fontSize: 48 }}>🏠</span>
          <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)', margin: '8px 0' }}>
            No common carts yet
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/common-cart')}>
            ✨ Create or Join
          </button>
        </div>
      ) : (
        commonCarts.map(cc => {
          const memberAvatars = cc.memberIds.map(id => getMemberById(id)).filter(Boolean);
          return (
            <div key={cc.id} className="amazon-card" style={{
              padding: 12, marginBottom: 8,
              border: activeCartId === cc.id ? '2px solid #f0c14b' : '1px solid var(--amazon-border-light)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>{cc.name}</span>
                    {activeCartId === cc.id && (
                      <span style={{ fontSize: 10, color: 'var(--amazon-orange)' }}>● Active</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 2 }}>
                    Code: <strong style={{ letterSpacing: 1, color: 'var(--amazon-orange)' }}>{cc.code}</strong>
                    {' · '}{cc.items.length} items · {cc.memberIds.length} members · {cc.splitMode} split
                  </p>
                  {memberAvatars.length > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                      {memberAvatars.slice(0, 5).map(m => m && (
                        <span key={m.id} style={{ fontSize: 16 }} title={m.name}>{m.avatar}</span>
                      ))}
                      {cc.memberIds.length > 5 && (
                        <span style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginLeft: 2 }}>
                          +{cc.memberIds.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
                    onClick={() => {
                      navigator.clipboard.writeText(cc.code);
                      showToast('Code copied!', 'success');
                    }}
                    title="Copy code">
                    📋
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
                    onClick={() => { setActiveCart(cc.id); router.push('/voice-cart'); }}>
                    Open
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--amazon-error)' }}
                    onClick={() => { leaveCommonCart(cc.id, currentUserId); showToast(`Left "${cc.name}"`, 'info'); }}>
                    Leave
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="amazon-card" style={{ marginBottom: 16, padding: 12, borderColor: '#f0c14b', background: '#fffbf0' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--amazon-text)' }}>
            📩 Pending Invites ({pendingInvites.length})
          </p>
          {pendingInvites.map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < pendingInvites.length - 1 ? '1px solid var(--amazon-border-light)' : 'none' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--amazon-text)' }}>{inv.cartName}</p>
                <p style={{ fontSize: 10, color: 'var(--amazon-text-muted)' }}>Code: {inv.code} · by {inv.creatorName}</p>
              </div>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
                onClick={() => {
                  const name = `Guest ${members.length + 1}`;
                  const newMember = addMember(name);
                  joinCommonCartByCode(inv.code, newMember.id);
                  showToast(`Joined as ${name}!`, 'success');
                }}>
                Join
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create / Join Button */}
      <button className="btn btn-primary w-full" style={{ marginTop: 8 }}
        onClick={() => router.push('/common-cart')}>
        ✨ Create or Join a Cart
      </button>
    </div>
  );
}
