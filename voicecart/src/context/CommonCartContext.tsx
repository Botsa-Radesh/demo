'use client';
import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateInviteCode } from '@/utils/voiceParser';

interface CommonCart {
  code: string;
  name: string;
  creatorName: string;
  memberIds: string[];
  isActive: boolean;
}

interface CommonCartContextType {
  currentCart: CommonCart | null;
  createCart: (name: string, creatorName: string) => string;
  joinCart: (code: string) => CommonCart | null;
  leaveCart: () => void;
  invites: CommonCart[];
}

const CommonCartContext = createContext<CommonCartContextType | null>(null);

export function CommonCartProvider({ children }: { children: React.ReactNode }) {
  const [currentCart, setCurrentCart] = useLocalStorage<CommonCart | null>('voicecart-common-cart', null);
  const [invites, setInvites] = useLocalStorage<CommonCart[]>('voicecart-invites', []);

  const createCart = useCallback((name: string, creatorName: string): string => {
    const code = generateInviteCode();
    const cart: CommonCart = { code, name, creatorName, memberIds: ['m1'], isActive: true };
    setCurrentCart(cart);
    setInvites(prev => [...prev.filter(i => i.code !== code), cart]);
    return code;
  }, [setCurrentCart, setInvites]);

  const joinCart = useCallback((code: string): CommonCart | null => {
    const found = invites.find(i => i.code.toUpperCase() === code.toUpperCase());
    if (found) {
      const updated = { ...found, memberIds: [...new Set([...found.memberIds, 'm1', 'm2'])] };
      setCurrentCart(updated);
      setInvites(prev => prev.map(i => i.code === found.code ? updated : i));
      return updated;
    }
    return null;
  }, [invites, setCurrentCart, setInvites]);

  const leaveCart = useCallback(() => {
    setCurrentCart(null);
  }, [setCurrentCart]);

  return (
    <CommonCartContext.Provider value={{ currentCart, createCart, joinCart, leaveCart, invites }}>
      {children}
    </CommonCartContext.Provider>
  );
}

export function useCommonCart() {
  const ctx = useContext(CommonCartContext);
  if (!ctx) throw new Error('useCommonCart must be used within CommonCartProvider');
  return ctx;
}
