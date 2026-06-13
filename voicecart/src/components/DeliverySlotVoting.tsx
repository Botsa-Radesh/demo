'use client';
import React from 'react';
import { useOrder } from '@/context/OrderContext';
import { useMembers } from '@/context/MembersContext';

interface Props {
  onSelectSlot: (slotId: string) => void;
  selectedSlot: string | null;
}

export function DeliverySlotVoting({ onSelectSlot, selectedSlot }: Props) {
  const { deliverySlots, voteSlot } = useOrder();
  const { members, currentUserId } = useMembers();

  const handleVote = (slotId: string) => {
    voteSlot(slotId, currentUserId);
    onSelectSlot(slotId);
  };

  return (
    <div>
      <h3 className="section-title">📅 Vote for Delivery Slot</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {deliverySlots.map(slot => {
          const isSelected = selectedSlot === slot.id;
          const voters = slot.votes.map(v => members.find(m => m.id === v)?.name).filter(Boolean);
          return (
            <div key={slot.id}
              className={`slot-card ${slot.isWinner ? 'winner' : ''} ${isSelected ? 'voted' : ''}`}
              onClick={() => handleVote(slot.id)}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--amazon-text)' }}>{slot.time}</p>
                <p style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>{slot.date}</p>
                {voters.length > 0 && (
                  <p style={{ fontSize: 10, color: 'var(--amazon-text-secondary)', marginTop: 2 }}>
                    {voters.join(', ')}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: slot.isWinner ? 'var(--amazon-orange)' : 'var(--amazon-text-secondary)' }}>
                  {slot.votes.length}
                </span>
                <p style={{ fontSize: 10, color: 'var(--amazon-text-muted)' }}>votes</p>
                {slot.isWinner && <span style={{ fontSize: 16 }}>👑</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
