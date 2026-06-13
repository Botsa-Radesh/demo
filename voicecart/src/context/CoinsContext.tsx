'use client';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { CoinTransaction } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { getNextMilestone, getRedeemOptions } from '@/utils/coinsCalculator';
import { syncCoinsToAPI } from '@/lib/sync';

interface CoinsContextType {
  balance: number;
  transactions: CoinTransaction[];
  addCoins: (amount: number, reason: string) => void;
  redeemCoins: (cost: number, label: string) => boolean;
  nextMilestone: { label: string; remaining: number; progress: number };
  redeemOptions: { label: string; cost: number }[];
  streak: number;
  incrementStreak: () => void;
}

const CoinsContext = createContext<CoinsContextType | null>(null);

export function CoinsProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useLocalStorage<number>('voicecart-coins', 1247);
  const [transactions, setTransactions] = useLocalStorage<CoinTransaction[]>('voicecart-transactions', []);
  const [streak, setStreak] = useLocalStorage<number>('voicecart-streak', 3);
  const { userId } = useAuth();

  const addCoins = useCallback((amount: number, reason: string) => {
    setBalance(prev => prev + amount);
    setTransactions(prev => [{
      id: `tx-${Date.now()}`,
      amount,
      type: 'earned',
      reason,
      date: new Date().toISOString(),
    }, ...prev]);
    if (userId) syncCoinsToAPI(userId, amount, reason).catch(() => {});
  }, [setBalance, setTransactions, userId]);

  const redeemCoins = useCallback((cost: number, label: string): boolean => {
    if (balance < cost) return false;
    setBalance(prev => prev - cost);
    setTransactions(prev => [{
      id: `tx-${Date.now()}`,
      amount: -cost,
      type: 'redeemed',
      reason: label,
      date: new Date().toISOString(),
    }, ...prev]);
    if (userId) syncCoinsToAPI(userId, -cost, `Redeemed: ${label}`).catch(() => {});
    return true;
  }, [balance, setBalance, setTransactions, userId]);

  const incrementStreak = useCallback(() => {
    setStreak(prev => prev + 1);
  }, [setStreak]);

  const nextMilestone = useMemo(() => getNextMilestone(balance), [balance]);
  const redeemOptions = useMemo(() => getRedeemOptions(), []);

  return (
    <CoinsContext.Provider value={{ balance, transactions, addCoins, redeemCoins, nextMilestone, redeemOptions, streak, incrementStreak }}>
      {children}
    </CoinsContext.Provider>
  );
}

export function useCoins() {
  const ctx = useContext(CoinsContext);
  if (!ctx) throw new Error('useCoins must be used within CoinsProvider');
  return ctx;
}
