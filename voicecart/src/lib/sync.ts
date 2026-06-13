import { cartApi, memberApi, orderApi, coinApi, inviteApi } from './api';

type SyncEvent = 'cart-update' | 'member-update' | 'order-created' | 'coins-changed';

const listeners: Record<string, Set<() => void>> = {};

export function onSync(event: SyncEvent, cb: () => void) {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(cb);
  return () => listeners[event].delete(cb);
}

function emit(event: SyncEvent) {
  listeners[event]?.forEach(cb => cb());
}

export async function syncCartToAPI(cart: any) {
  try {
    if (cart.id) {
      await cartApi.update(cart.id, {
        name: cart.name,
        splitMode: cart.splitMode,
        memberIds: cart.memberIds,
      });
    }
    emit('cart-update');
  } catch {}
}

export async function syncCartItemToAPI(cartId: string, item: any) {
  try {
    await cartApi.addItem(cartId, item);
    emit('cart-update');
  } catch {}
}

export async function syncRemoveCartItemToAPI(cartId: string, itemId: string) {
  try {
    await cartApi.removeItem(cartId, itemId);
    emit('cart-update');
  } catch {}
}

export async function syncMemberToAPI(member: any) {
  try {
    await memberApi.create(member);
    emit('member-update');
  } catch {}
}

export async function syncOrderToAPI(order: any) {
  try {
    await orderApi.create(order);
    emit('order-created');
  } catch {}
}

export async function syncCoinsToAPI(userId: string, amount: number, reason: string) {
  try {
    await coinApi.add(userId, amount, reason);
    emit('coins-changed');
  } catch {}
}

export async function fetchCartsFromAPI(userId: string): Promise<any[]> {
  try {
    const result = await cartApi.list(userId);
    return result.carts || [];
  } catch {
    return [];
  }
}

export async function fetchMembersFromAPI(): Promise<any[]> {
  try {
    const result = await memberApi.list();
    return result.members || [];
  } catch {
    return [];
  }
}

export async function fetchInvitesFromAPI(userId: string): Promise<any[]> {
  try {
    const result = await inviteApi.list(userId);
    return result.invites || [];
  } catch {
    return [];
  }
}

export async function syncInviteToAPI(invite: any) {
  try {
    await inviteApi.create(invite);
  } catch {}
}
