const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Auth
export const authApi = {
  signup: (email: string, password: string, name: string) =>
    request<{ user: any }>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    request<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

// Carts
export const cartApi = {
  list: (userId: string) => request<{ carts: any[] }>(`/carts?userId=${userId}`),
  get: (cartId: string) => request<{ cart: any }>(`/carts/${cartId}`),
  create: (cart: any) => request<{ cart: any }>('/carts', { method: 'POST', body: JSON.stringify(cart) }),
  update: (cartId: string, updates: any) =>
    request<{ cart: any }>(`/carts/${cartId}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  join: (code: string, userId: string, memberId: string) =>
    request<{ cart: any }>(`/carts/join`, { method: 'POST', body: JSON.stringify({ code, userId, memberId }) }),
  addItem: (cartId: string, item: any) =>
    request<{ item: any }>(`/carts/${cartId}`, { method: 'POST', body: JSON.stringify({ action: 'addItem', item }) }),
  removeItem: (cartId: string, itemId: string) =>
    request<{ success: boolean }>(`/carts/${cartId}`, { method: 'DELETE', body: JSON.stringify({ itemId }) }),
  updateItem: (cartId: string, itemId: string, updates: any) =>
    request<{ item: any }>(`/carts/${cartId}`, { method: 'PATCH', body: JSON.stringify({ action: 'updateItem', itemId, updates }) }),
};

// Members
export const memberApi = {
  list: () => request<{ members: any[] }>('/members'),
  create: (member: any) => request<{ member: any }>('/members', { method: 'POST', body: JSON.stringify(member) }),
  update: (memberId: string, updates: any) =>
    request<{ member: any }>('/members', { method: 'PATCH', body: JSON.stringify({ memberId, updates }) }),
};

// Orders
export const orderApi = {
  list: (userId: string) => request<{ orders: any[] }>(`/orders?userId=${userId}`),
  create: (order: any) => request<{ order: any }>('/orders', { method: 'POST', body: JSON.stringify(order) }),
};

// Coins
export const coinApi = {
  get: (userId: string) => request<{ balance: number; transactions: any[] }>(`/coins?userId=${userId}`),
  add: (userId: string, amount: number, reason: string) =>
    request<{ balance: number }>('/coins', { method: 'POST', body: JSON.stringify({ userId, amount, reason }) }),
};

// Invites
export const inviteApi = {
  list: (userId: string) => request<{ invites: any[] }>(`/invites?userId=${userId}`),
  create: (invite: any) => request<{ invite: any }>('/invites', { method: 'POST', body: JSON.stringify(invite) }),
  accept: (code: string, userId: string, memberId: string) =>
    request<{ cart: any }>('/invites', { method: 'PATCH', body: JSON.stringify({ action: 'accept', code, userId, memberId }) }),
};
