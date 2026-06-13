'use client';
import React, { useState } from 'react';
import { useCommonCart } from '@/context/CommonCartContext';
import { useMembers } from '@/context/MembersContext';
import { MemberAvatar } from '@/components/MemberAvatar';
import { useToast } from '@/components/NotificationToast';
import { useRouter } from 'next/navigation';

export default function CommonCartPage() {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [cartName, setCartName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [joinResult, setJoinResult] = useState<string | null>(null);
  const { currentCart, createCart, joinCart } = useCommonCart();
  const { members } = useMembers();
  const { showToast } = useToast();
  const router = useRouter();

  const handleCreate = () => {
    const name = cartName.trim() || 'My Common Cart';
    const code = createCart(name, 'Rahul');
    setCreatedCode(code);
    showToast(`Cart created! Code: ${code}`, 'success');
  };

  const handleJoin = () => {
    if (!inviteCodeInput.trim()) return;
    const result = joinCart(inviteCodeInput.trim());
    if (result) {
      setJoinResult(`Joined "${result.name}"`);
      showToast(`Joined ${result.name}!`, 'success');
      setTimeout(() => router.push('/voice-cart'), 1000);
    } else {
      setJoinResult('Invalid code. Try FLAT-7X or HOME-8K2M');
      showToast('Cart not found!', 'error');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode).then(() => showToast('Code copied!', 'success'));
  };

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/')}>←</button>
        <h1>Common Cart</h1>
      </div>

      {currentCart ? (
        <div className="amazon-card animate-fadeIn" style={{ textAlign: 'center', padding: 32 }}>
          <span style={{ fontSize: 48 }}>🏠</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '12px 0 4px', color: 'var(--amazon-text)' }}>{currentCart.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)', marginBottom: 16 }}>
            Code: <strong style={{ color: 'var(--amazon-orange)', letterSpacing: 2 }}>{currentCart.code}</strong>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {members.map(m => <MemberAvatar key={m.id} member={m} showName />)}
          </div>
          <button className="btn btn-primary" onClick={() => router.push('/voice-cart')}>
            🛒 Go to Cart
          </button>
        </div>
      ) : (
        <>
          <div className="tabs" style={{ marginBottom: 24 }}>
            <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
              Create New Cart
            </button>
            <button className={`tab ${tab === 'join' ? 'active' : ''}`} onClick={() => setTab('join')}>
              Join Existing Cart
            </button>
          </div>

          {tab === 'create' && (
            <div className="animate-fadeIn">
              <div className="content-section" style={{ padding: 24, marginBottom: 16 }}>
                <h3 className="section-title">Create a Common Cart</h3>
                <input
                  placeholder="Cart name (e.g. Flat 302 Weekly)"
                  value={cartName}
                  onChange={e => setCartName(e.target.value)}
                  style={{ marginBottom: 12 }}
                />
                <button className="btn btn-primary w-full" onClick={handleCreate}>
                  ✨ Generate Invite Code
                </button>
              </div>

              {createdCode && (
                <div className="amazon-card animate-slideUp" style={{ textAlign: 'center', padding: 24, borderColor: '#b7e4c7', background: '#f0fff4' }}>
                  <span style={{ fontSize: 40 }}>🎉</span>
                  <p style={{ fontSize: 14, color: 'var(--amazon-text-secondary)', margin: '8px 0' }}>Share this code:</p>
                  <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: 'var(--amazon-orange)', margin: '8px 0' }}>
                    {createdCode}
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={handleCopyCode}>📋 Copy</button>
                    <button className="btn btn-secondary"
                      onClick={() => {
                        const msg = `Join my VoiceCart! Use code: ${createdCode}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                      }}>
                      📱 WhatsApp
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    {members.slice(0, 2).map(m => <MemberAvatar key={m.id} member={m} showName />)}
                    <div className="member-avatar" style={{ background: 'rgba(255,153,0,0.15)' }}>
                      <span style={{ fontSize: 14 }}>+{members.length - 1}</span>
                    </div>
                  </div>
                  <button className="btn btn-primary w-full mt-16" onClick={() => router.push('/voice-cart')}>
                    🛒 Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'join' && (
            <div className="animate-fadeIn">
              <div className="content-section" style={{ padding: 24, marginBottom: 16 }}>
                <h3 className="section-title">Join a Common Cart</h3>
                <input
                  placeholder="Enter invite code (e.g. FLAT-7X)"
                  value={inviteCodeInput}
                  onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                  style={{ marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}
                />
                <button className="btn btn-primary w-full" onClick={handleJoin}>
                  🔗 Join Cart
                </button>
              </div>

              <div className="amazon-card" style={{ padding: 24, textAlign: 'center' }}>
                <span style={{ fontSize: 32 }}>📱</span>
                <p style={{ fontSize: 13, color: 'var(--amazon-text-secondary)', margin: '8px 0' }}>Or scan QR code</p>
                <div style={{
                  width: 160, height: 160, margin: '0 auto',
                  background: '#f3f3f3',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed var(--amazon-border)',
                }}>
                  <span style={{ fontSize: 48, opacity: 0.5 }}>📲</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 8 }}>
                  Ask your friend to share their QR
                </p>
              </div>

              {joinResult && (
                <p className={`animate-fadeIn mt-12 text-sm ${joinResult.includes('joined') ? 'text-success' : 'text-error'}`}>
                  {joinResult}
                </p>
              )}

              <div className="amazon-card mt-16" style={{ padding: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginBottom: 8 }}>💡 Demo Codes:</p>
                <p style={{ fontSize: 12, color: 'var(--amazon-text-muted)' }}>Try: <strong>FLAT-7X</strong>, <strong>HOME-8K2M</strong></p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
