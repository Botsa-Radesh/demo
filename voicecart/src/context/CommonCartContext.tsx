'use client';
import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCart } from './CartContext';
import { SplitMode } from '@/types';
import { cartApi } from '@/lib/api';

interface PendingInvite {
  code: string;
  cartName: string;
  creatorName: string;
}

interface CommonCartContextType {
  pendingInvites: PendingInvite[];
  createCommonCart: (name: string, creatorId: string, creatorName: string, splitMode: SplitMode) => string;
  joinCommonCartByCode: (code: string, userId: string) => Promise<boolean>;
  addInvite: (code: string, cartName: string, creatorName: string) => void;
}

const CommonCartContext = createContext<CommonCartContextType | null>(null);

export function CommonCartProvider({ children }: { children: React.ReactNode }) {
  const { createCommonCart: createCart, joinCommonCart, joinCommonCartViaApi, commonCarts } = useCart();
  const [pendingInvites, setPendingInvites] = useLocalStorage<PendingInvite[]>('voicecart-pending-invites', []);

  const createCommonCartHandler = useCallback((name: string, creatorId: string, creatorName: string, splitMode: SplitMode): string => {
    const cart = createCart(name, creatorId, creatorName, splitMode);
    return cart.code;
  }, [createCart]);

  const joinCommonCartByCode = useCallback(async (code: string, userId: string): Promise<boolean> => {
    // Try local first
    const existing = commonCarts.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (existing && existing.memberIds.includes(userId)) return true;
    const localResult = joinCommonCart(code, userId);
    if (localResult) {
      setPendingInvites(prev => prev.filter(i => i.code.toUpperCase() !== code.toUpperCase()));
      return true;
    }
    // Fall back to API (cross-user join via DynamoDB)
    const apiResult = await joinCommonCartViaApi(code, userId);
    if (apiResult) {
      setPendingInvites(prev => prev.filter(i => i.code.toUpperCase() !== code.toUpperCase()));
      return true;
    }
    return false;
  }, [joinCommonCart, joinCommonCartViaApi, commonCarts, setPendingInvites]);

  const addInvite = useCallback((code: string, cartName: string, creatorName: string) => {
    setPendingInvites(prev => {
      if (prev.some(i => i.code === code)) return prev;
      return [...prev, { code, cartName, creatorName }];
    });
  }, [setPendingInvites]);

  return (
    <CommonCartContext.Provider value={{
      pendingInvites,
      createCommonCart: createCommonCartHandler,
      joinCommonCartByCode,
      addInvite,
    }}>
      {children}
    </CommonCartContext.Provider>
  );
}

export function useCommonCart() {
  const ctx = useContext(CommonCartContext);
  if (!ctx) throw new Error('useCommonCart must be used within CommonCartProvider');
  return ctx;
}
