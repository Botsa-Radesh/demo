'use client';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Order, CartItem, Member, SplitMode, MemberPayment, DeliverySlot } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface OrderContextType {
  currentOrder: Order | null;
  placeOrder: (items: CartItem[], total: number, splitMode: SplitMode, payments: MemberPayment[], slot: string, coinsEarned: number) => void;
  history: Order[];
  deliverySlots: DeliverySlot[];
  voteSlot: (slotId: string, memberId: string) => void;
  clearCurrentOrder: () => void;
}

const defaultSlots: DeliverySlot[] = [
  { id: 's1', time: '7-9 AM', date: 'Tomorrow', votes: ['m1'], isWinner: false },
  { id: 's2', time: '10-12 PM', date: 'Tomorrow', votes: ['m2'], isWinner: false },
  { id: 's3', time: '2-4 PM', date: 'Tomorrow', votes: [], isWinner: false },
  { id: 's4', time: '6-8 PM', date: 'Tomorrow', votes: [], isWinner: false },
];

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [currentOrder, setCurrentOrder] = useLocalStorage<Order | null>('voicecart-current-order', null);
  const [history, setHistory] = useLocalStorage<Order[]>('voicecart-order-history', []);
  const [deliverySlots, setDeliverySlots] = useLocalStorage<DeliverySlot[]>('voicecart-slots', defaultSlots);

  const placeOrder = useCallback((
    items: CartItem[], total: number, splitMode: SplitMode, payments: MemberPayment[], slot: string, coinsEarned: number
  ) => {
    const order: Order = {
      id: `ord-${Date.now()}`,
      date: new Date().toISOString(),
      items,
      totalAmount: total,
      splitMode,
      memberPayments: payments,
      deliverySlot: slot,
      status: 'confirmed',
      coinsEarned,
    };
    setCurrentOrder(order);
    setHistory(prev => [order, ...prev]);
  }, [setCurrentOrder, setHistory]);

  const voteSlot = useCallback((slotId: string, memberId: string) => {
    setDeliverySlots(prev => prev.map(slot => {
      if (slot.id !== slotId) return { ...slot, votes: slot.votes.filter(v => v !== memberId) };
      const hasVoted = slot.votes.includes(memberId);
      return { ...slot, votes: hasVoted ? slot.votes.filter(v => v !== memberId) : [...slot.votes, memberId] };
    }));
  }, [setDeliverySlots]);

  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, [setCurrentOrder]);

  const slotsWithWinner = useMemo(() => {
    const max = Math.max(...deliverySlots.map(s => s.votes.length), 0);
    return deliverySlots.map(s => ({ ...s, isWinner: s.votes.length > 0 && s.votes.length === max }));
  }, [deliverySlots]);

  return (
    <OrderContext.Provider value={{ currentOrder, placeOrder, history, deliverySlots: slotsWithWinner, voteSlot, clearCurrentOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
