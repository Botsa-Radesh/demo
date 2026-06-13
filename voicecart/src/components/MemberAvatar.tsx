'use client';
import React from 'react';
import { Member } from '@/types';

interface Props {
  member: Member;
  size?: number;
  showName?: boolean;
}

export function MemberAvatar({ member, size = 40, showName = false }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div className={`member-avatar ${member.isOnline ? 'online' : ''} ${member.isTyping ? 'typing' : ''}`}
        style={{ width: size, height: size, fontSize: size * 0.45 }}>
        {member.avatar}
        {member.isOnline && <span className="online-dot" />}
        {member.isTyping && <span className="typing-indicator">💬</span>}
      </div>
      {showName && <span style={{ fontSize: 11, color: 'var(--amazon-text-secondary)' }}>{member.name}</span>}
    </div>
  );
}
