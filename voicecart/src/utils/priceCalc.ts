import { CartItem, Member, MemberPayment, SplitMode } from '@/types';

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function calculateMemberSubtotal(items: CartItem[], memberId: string): number {
  return items
    .filter(item => item.addedBy === memberId && !item.isShared)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function calculateSharedTotal(items: CartItem[]): number {
  return items
    .filter(item => item.isShared)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function calculateSplitPayments(
  items: CartItem[],
  members: Member[],
  mode: SplitMode,
  customAmounts?: Record<string, number>
): MemberPayment[] {
  const total = calculateSubtotal(items);
  const sharedTotal = calculateSharedTotal(items);
  const activeMembers = members.filter(m => m.isOnline);

  switch (mode) {
    case 'family': {
      const payerId = members[0]?.id || 'm1';
      return members.map(m => ({
        memberId: m.id,
        amount: m.id === payerId ? total : 0,
        method: 'amazon_pay' as const,
        status: 'pending' as const,
        coinsEarned: 0,
      }));
    }
    case 'auto': {
      const sharePerMember = activeMembers.length > 0 ? sharedTotal / activeMembers.length : 0;
      return members.map(m => {
        const personalTotal = calculateMemberSubtotal(items, m.id);
        const share = m.isOnline ? sharePerMember : 0;
        const amount = Math.round(personalTotal + share);
        return {
          memberId: m.id,
          amount,
          method: 'amazon_pay' as const,
          status: 'pending' as const,
          coinsEarned: 0,
        };
      });
    }
    case 'equal': {
      const perPerson = Math.round(total / members.length);
      return members.map(m => ({
        memberId: m.id,
        amount: perPerson,
        method: 'amazon_pay' as const,
        status: 'pending' as const,
        coinsEarned: 0,
      }));
    }
    case 'custom': {
      return members.map(m => ({
        memberId: m.id,
        amount: customAmounts?.[m.id] ?? 0,
        method: 'amazon_pay' as const,
        status: 'pending' as const,
        coinsEarned: 0,
      }));
    }
    default:
      return members.map(m => ({
        memberId: m.id,
        amount: 0,
        method: 'amazon_pay' as const,
        status: 'pending' as const,
        coinsEarned: 0,
      }));
  }
}
