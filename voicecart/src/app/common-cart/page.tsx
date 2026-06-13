'use client';
import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCommonCart } from '@/context/CommonCartContext';
import { useMembers } from '@/context/MembersContext';
import { MemberAvatar } from '@/components/MemberAvatar';
import { useToast } from '@/components/NotificationToast';
import { useRouter } from 'next/navigation';
import { SplitMode } from '@/types';

export default function CommonCartPage() {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [cartName, setCartName] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('auto');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinName, setJoinName] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [joinResult, setJoinResult] = useState<string | null>(null);

  const { personalCartId, carts, commonCarts, activeCartId, setActiveCart, leaveCommonCart } = useCart();
  const { createCommonCart, joinCommonCartByCode, pendingInvites, addInvite } = useCommonCart();
  const { members, addMember, currentUserId } = useMembers();
  const { showToast } = useToast();
  const router = useRouter();

  const personalCart = personalCartId ? carts[personalCartId] : null;

  const handleCreate = () => {
    const name = cartName.trim() || 'Common Cart';
    const code = createCommonCart(name, currentUserId, 'You', splitMode);
    setCreatedCode(code);
    showToast(`Common cart created! Code: ${code}`, 'success');
  };

  const handleJoin = async () => {
    if (!inviteCodeInput.trim()) return;
    const personName = joinName.trim() || `Member ${members.length}`;
    const exists = members.some(m => m.name.toLowerCase() === personName.toLowerCase());
    const newMember = exists ? members.find(m => m.name.toLowerCase() === personName.toLowerCase())! : addMember(personName);
    const joined = await joinCommonCartByCode(inviteCodeInput.trim(), newMember.id);
    if (joined) {
      setJoinResult(`Joined as ${personName}!`);
      showToast(`Joined as ${personName}!`, 'success');
      setTimeout(() => router.push('/voice-cart'), 1000);
    } else {
      setJoinResult('Invalid code. Cart not found.');
      showToast('Cart not found!', 'error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => showToast('Code copied!', 'success'));
  };

  const splitModeOptions: { id: SplitMode; icon: string; title: string; desc: string }[] = [
    { id: 'family', icon: '👨‍👩‍👧', title: 'Family Mode', desc: 'One pays all' },
    { id: 'auto', icon: '🧾', title: 'Auto Split', desc: 'Items + share of shared' },
    { id: 'equal', icon: '➗', title: 'Equal Split', desc: 'Total ÷ members' },
    { id: 'custom', icon: '✏️', title: 'Custom', desc: 'Set your own' },
  ];

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/voice-cart')}>←</button>
        <h1>Common Cart</h1>
      </div>

      {/* Personal Cart Info */}
      {personalCart && (
        <div className="amazon-card" style={{ padding: 12, marginBottom: 16, background: '#f0fff4', borderColor: '#b7e4c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>
                🛒 Your Personal Cart
              </p>
              <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginTop: 2 }}>
                {personalCart.items.length} items · Split: {personalCart.splitMode}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
                onClick={() => { setActiveCart(personalCart.id); router.push('/voice-cart'); }}>
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Common Carts */}
      {commonCarts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 className="section-title" style={{ fontSize: 14 }}>🏠 My Common Carts</h3>
          {commonCarts.map(cc => (
            <div key={cc.id} className="amazon-card" style={{
              padding: 12, marginBottom: 8,
              borderColor: activeCartId === cc.id ? '#f0c14b' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)' }}>{cc.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>
                    Code: <strong style={{ letterSpacing: 1, color: 'var(--amazon-orange)' }}>{cc.code}</strong>
                    {' · '}{cc.items.length} items · {cc.memberIds.length} members
                  </p>
                </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}
                    onClick={() => handleCopyCode(cc.code)}>
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
          ))}
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="amazon-card" style={{ marginBottom: 16, padding: 12, borderColor: '#f0c14b', background: '#fffbf0' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--amazon-text)' }}>
            📩 Pending Invites
          </p>
          {pendingInvites.map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)' }}>
                {inv.cartName} · <code style={{ fontSize: 11 }}>{inv.code}</code>
              </span>
              <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
                onClick={() => {
                  const personName = `Guest ${members.length}`;
                  const newMember = addMember(personName);
                  joinCommonCartByCode(inv.code, newMember.id);
                  showToast(`Joined as ${personName}!`, 'success');
                }}>
                Join
              </button>
            </div>
          ))}
        </div>
      )}

      {!createdCode && (
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

                {/* Split Mode Selection */}
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--amazon-text)', marginBottom: 8 }}>
                  Select Split Mode
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {splitModeOptions.map(m => (
                    <div key={m.id}
                      className={`split-card ${splitMode === m.id ? 'selected' : ''}`}
                      onClick={() => setSplitMode(m.id)}>
                      <span style={{ fontSize: 20 }}>{m.icon}</span>
                      <p style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: 'var(--amazon-text)' }}>{m.title}</p>
                      <p style={{ fontSize: 10, color: 'var(--amazon-text-muted)' }}>{m.desc}</p>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary w-full" onClick={handleCreate}>
                  ✨ Generate Invite Code
                </button>
              </div>
            </div>
          )}

          {tab === 'join' && (
            <div className="animate-fadeIn">
              <div className="content-section" style={{ padding: 24, marginBottom: 16 }}>
                <h3 className="section-title">Join a Common Cart</h3>
                <input
                  placeholder="Your name (e.g. Amit)"
                  value={joinName}
                  onChange={e => setJoinName(e.target.value)}
                  style={{ marginBottom: 12 }}
                />
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
                <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginBottom: 8 }}>
                  💡 Ask a friend for their cart code to join!
                </p>
                <p style={{ fontSize: 12, color: 'var(--amazon-text-muted)' }}>
                  Each cart has a unique 6-character code shown at the top.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {createdCode && (
        <div className="amazon-card animate-slideUp" style={{ textAlign: 'center', padding: 24, borderColor: '#b7e4c7', background: '#f0fff4' }}>
          <span style={{ fontSize: 40 }}>🎉</span>
          <p style={{ fontSize: 14, color: 'var(--amazon-text-secondary)', margin: '8px 0' }}>Share this code:</p>
          <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: 'var(--amazon-orange)', margin: '8px 0' }}>
            {createdCode}
          </p>
          <p style={{ fontSize: 12, color: 'var(--amazon-text-muted)', marginBottom: 12 }}>
            Split mode: <strong>{splitMode}</strong>
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => handleCopyCode(createdCode)}>📋 Copy</button>
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
  );
}
