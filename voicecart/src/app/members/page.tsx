'use client';
import React, { useState } from 'react';
import { useMembers } from '@/context/MembersContext';
import { useCart } from '@/context/CartContext';
import { MemberAvatar } from '@/components/MemberAvatar';
import { useRouter } from 'next/navigation';
import { Allergen, DietType } from '@/types';

export default function MembersPage() {
  const { members, currentUserId, updateMember } = useMembers();
  const { getItemsByMember } = useCart();
  const router = useRouter();
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ diet: '' as string, allergies: [] as string[], favoriteBrands: '', dislikes: '' });

  const startEdit = (memberId: string) => {
    const m = members.find(x => x.id === memberId);
    if (!m) return;
    setEditForm({ diet: m.diet, allergies: [...m.allergies], favoriteBrands: m.favoriteBrands.join(', '), dislikes: m.dislikes.join(', ') });
    setEditingMember(memberId);
  };

  const saveEdit = () => {
    if (!editingMember) return;
    updateMember(editingMember, {
      diet: editForm.diet as DietType,
      allergies: editForm.allergies as Allergen[],
      favoriteBrands: editForm.favoriteBrands.split(',').map(s => s.trim()).filter(Boolean),
      dislikes: editForm.dislikes.split(',').map(s => s.trim()).filter(Boolean),
    });
    setEditingMember(null);
  };

  const allAllergens: Allergen[] = ['Peanuts', 'Dairy', 'Gluten', 'Soy', 'Egg', 'Tree Nuts', 'Seafood'];

  const toggleAllergen = (allergen: string) => {
    setEditForm(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergen)
        ? prev.allergies.filter(a => a !== allergen)
        : [...prev.allergies, allergen],
    }));
  };

  return (
    <div className="page-content" style={{ paddingTop: 16, paddingBottom: 80 }}>
      <div className="page-header" style={{ margin: '-16px -16px 16px', borderRadius: 0 }}>
        <button className="back-btn" onClick={() => router.push('/')}>←</button>
        <h1>Members</h1>
      </div>

      {members.map(m => {
        const memberItems = getItemsByMember(m.id);
        const subtotal = memberItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const isEditing = editingMember === m.id;

        return (
          <div key={m.id} className="amazon-card animate-fadeIn" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: isEditing ? 16 : 0 }}>
              <MemberAvatar member={m} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--amazon-text)' }}>{m.name}</span>
                  <span className={`diet-badge diet-${m.diet}`}>
                    {m.diet === 'veg' ? '🟢 Veg' : m.diet === 'non-veg' ? '🔴 Non-Veg' : '🌱 Vegan'}
                  </span>
                  {m.role === 'creator' && <span className="badge badge-info">Creator</span>}
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {m.allergies.map(a => (
                    <span key={a} className="allergy-tag">{a} 🚫</span>
                  ))}
                  {m.allergies.length === 0 && <span style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>No allergies</span>}
                </div>

                {m.favoriteBrands.length > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 4 }}>
                    ❤️ {m.favoriteBrands.join(', ')}
                  </p>
                )}

                {m.dislikes.length > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)', marginTop: 2 }}>
                    👎 {m.dislikes.join(', ')}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Items</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>{memberItems.length}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Subtotal</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-price)' }}>₹{subtotal}</p>
                  </div>
                </div>
              </div>

              {m.id === currentUserId && !isEditing && (
                <button className="btn btn-secondary btn-sm" onClick={() => startEdit(m.id)}>Edit</button>
              )}
            </div>

            {isEditing && (
              <div className="animate-fadeIn" style={{ borderTop: '1px solid var(--amazon-border-light)', paddingTop: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--amazon-text)' }}>Edit Profile</p>

                <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginBottom: 4 }}>Diet Type</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {(['veg', 'non-veg', 'vegan'] as DietType[]).map(d => (
                    <button key={d} className={`chip ${editForm.diet === d ? 'active' : ''}`}
                      onClick={() => setEditForm(prev => ({ ...prev, diet: d }))}>
                      {d === 'veg' ? '🟢' : d === 'non-veg' ? '🔴' : '🌱'} {d}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginBottom: 4 }}>Allergies</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {allAllergens.map(a => (
                    <button key={a} className={`chip ${editForm.allergies.includes(a) ? 'active' : ''}`}
                      style={editForm.allergies.includes(a) ? { borderColor: 'var(--amazon-error)', color: 'var(--amazon-error)' } : {}}
                      onClick={() => toggleAllergen(a)}>
                      {a}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginBottom: 4 }}>Favorite Brands (comma separated)</p>
                  <input value={editForm.favoriteBrands}
                    onChange={e => setEditForm(prev => ({ ...prev, favoriteBrands: e.target.value }))}
                    placeholder="e.g. Amul, Tata" />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', marginBottom: 4 }}>Dislikes (comma separated)</p>
                  <input value={editForm.dislikes}
                    onChange={e => setEditForm(prev => ({ ...prev, dislikes: e.target.value }))}
                    placeholder="e.g. Coriander, Mushroom" />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingMember(null)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Save</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
