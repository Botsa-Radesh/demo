'use client';
import React, { createContext, useContext, useCallback } from 'react';
import { Member, Allergen, DietType } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { defaultMembers } from '@/data/members';

interface MembersContextType {
  members: Member[];
  currentUserId: string;
  updateMember: (memberId: string, updates: Partial<Member>) => void;
  getMemberById: (memberId: string) => Member | undefined;
  toggleMemberOnline: (memberId: string) => void;
  toggleMemberTyping: (memberId: string) => void;
}

const MembersContext = createContext<MembersContextType | null>(null);

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useLocalStorage<Member[]>('voicecart-members', defaultMembers);
  const currentUserId = 'm1';

  const updateMember = useCallback((memberId: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m));
  }, [setMembers]);

  const getMemberById = useCallback((memberId: string) => members.find(m => m.id === memberId), [members]);

  const toggleMemberOnline = useCallback((memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, isOnline: !m.isOnline } : m));
  }, [setMembers]);

  const toggleMemberTyping = useCallback((memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, isTyping: !m.isTyping } : m));
  }, [setMembers]);

  return (
    <MembersContext.Provider value={{ members, currentUserId, updateMember, getMemberById, toggleMemberOnline, toggleMemberTyping }}>
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error('useMembers must be used within MembersProvider');
  return ctx;
}
