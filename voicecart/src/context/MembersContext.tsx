'use client';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Member, Allergen, DietType } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { defaultMembers } from '@/data/members';
import { syncMemberToAPI } from '@/lib/sync';

const avatars = ['👨‍💻', '👩‍🍳', '👨‍🎓', '👩‍💼', '👨‍🏫', '👩‍🔧', '👨‍🎨', '👩‍🚀', '👨‍⚕️', '👩‍🌾'];
let avatarIndex = 0;
function nextAvatar(): string {
  const a = avatars[avatarIndex % avatars.length];
  avatarIndex++;
  return a;
}

interface MembersContextType {
  members: Member[];
  currentUserId: string;
  updateMember: (memberId: string, updates: Partial<Member>) => void;
  getMemberById: (memberId: string) => Member | undefined;
  addMember: (name: string, avatar?: string) => Member;
  toggleMemberOnline: (memberId: string) => void;
  toggleMemberTyping: (memberId: string) => void;
}

const MembersContext = createContext<MembersContextType | null>(null);

export function MembersProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useLocalStorage<Member[]>('voicecart-members', defaultMembers);
  const { userId } = useAuth();
  const currentUserId = useMemo(() => userId || 'guest', [userId]);

  const updateMember = useCallback((memberId: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m));
  }, [setMembers]);

  const getMemberById = useCallback((memberId: string) => members.find(m => m.id === memberId), [members]);

  const addMember = useCallback((name: string, avatar?: string): Member => {
    const existing = members.find(m => m.name === name);
    if (existing) return existing;
    const member: Member = {
      id: `m${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name,
      avatar: avatar || nextAvatar(),
      role: 'member',
      diet: 'veg',
      allergies: [],
      favoriteBrands: [],
      dislikes: [],
      isOnline: false,
      isTyping: false,
    };
    setMembers(prev => [...prev, member]);
    syncMemberToAPI(member).catch(() => {});
    return member;
  }, [members, setMembers]);

  const toggleMemberOnline = useCallback((memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, isOnline: !m.isOnline } : m));
  }, [setMembers]);

  const toggleMemberTyping = useCallback((memberId: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, isTyping: !m.isTyping } : m));
  }, [setMembers]);

  return (
    <MembersContext.Provider value={{ members, currentUserId, updateMember, getMemberById, addMember, toggleMemberOnline, toggleMemberTyping }}>
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error('useMembers must be used within MembersProvider');
  return ctx;
}
