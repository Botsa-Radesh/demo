'use client';
import React, { createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { CartItem, Product, Template, Cart, SplitMode } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { products, getProductById } from '@/data/products';
import { defaultTemplates } from '@/data/templates';
import { useAuth } from './AuthContext';
import { syncCartToAPI, syncCartItemToAPI, syncRemoveCartItemToAPI } from '@/lib/sync';
import { cartApi } from '@/lib/api';

function generateCartCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generateCartId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface CartContextType {
  carts: Record<string, Cart>;
  activeCartId: string | null;
  personalCartId: string | null;
  activeCart: Cart | null;
  commonCarts: Cart[];
  setActiveCart: (cartId: string) => void;
  createPersonalCart: (userId: string, userName: string) => Cart;
  createCommonCart: (name: string, creatorId: string, creatorName: string, splitMode: SplitMode, memberIds?: string[]) => Cart;
  joinCommonCart: (code: string, userId: string) => Cart | null;
  joinCommonCartViaApi: (code: string, userId: string) => Promise<Cart | null>;
  leaveCommonCart: (cartId: string, userId: string) => void;
  updateCartSplitMode: (cartId: string, mode: SplitMode) => void;
  updateCartName: (cartId: string, name: string) => void;
  addItem: (product: Product, quantity: number, addedBy: string, isShared?: boolean) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleShared: (itemId: string) => void;
  toggleChecked: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getItemsByMember: (memberId: string) => CartItem[];
  getSharedItems: () => CartItem[];
  loadTemplate: (templateId: string) => void;
  savedTemplates: Template[];
  saveTemplate: (name: string, items?: Template['items']) => void;
  setSavedTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  deleteTemplate: (templateId: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

function getCurrentUserId(): string {
  try {
    const stored = localStorage.getItem('voicecart-auth-user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u?.id) return u.id;
    }
  } catch { /* ignore */ }
  const GUEST_KEY = 'voicecart-guest-id';
  let gid = localStorage.getItem(GUEST_KEY);
  if (!gid) {
    gid = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem(GUEST_KEY, gid);
  }
  return gid!;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carts, setCarts] = useLocalStorage<Record<string, Cart>>('voicecart-all-carts', {});
  const [activeCartId, setActiveCartId] = useLocalStorage<string | null>('voicecart-active-cart', null);
  const [personalCartId, setPersonalCartId] = useLocalStorage<string | null>('voicecart-personal-cart', null);
  const [savedTemplates, setSavedTemplates] = useLocalStorage<Template[]>('voicecart-templates', defaultTemplates);
  const { userId } = useAuth();

  // Synchronous init: create personal cart on first render if needed
  const initRan = useRef(false);
  if (!initRan.current) {
    initRan.current = true;
    const uid = getCurrentUserId();
    if (!personalCartId || !carts[personalCartId]) {
      const cart: Cart = {
        id: generateCartId(),
        code: '',
        name: 'My Cart',
        type: 'personal',
        splitMode: 'auto',
        createdBy: uid,
        memberIds: [uid],
        items: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setCarts(prev => ({ ...prev, [cart.id]: cart }));
      setPersonalCartId(cart.id);
      setActiveCartId(prev => prev || cart.id);
    } else if (!activeCartId) {
      setActiveCartId(personalCartId);
    }
  }

  const activeCart = useMemo(() => {
    if (!activeCartId || !carts[activeCartId]) return null;
    return carts[activeCartId];
  }, [carts, activeCartId]);

  const commonCarts = useMemo(() => {
    const uid = userId || getCurrentUserId();
    return Object.values(carts).filter(c => c.type === 'common' && c.memberIds.includes(uid));
  }, [carts, userId]);

  const setActiveCart = useCallback((cartId: string) => {
    setActiveCartId(cartId);
  }, [setActiveCartId]);

  const createPersonalCart = useCallback((userId: string, userName: string): Cart => {
    const existing = personalCartId && carts[personalCartId];
    if (existing) return existing;

    const cart: Cart = {
      id: generateCartId(),
      code: '',
      name: `${userName}'s Cart`,
      type: 'personal',
      splitMode: 'auto',
      createdBy: userId,
      memberIds: [userId],
      items: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setCarts(prev => ({ ...prev, [cart.id]: cart }));
    setPersonalCartId(cart.id);
    setActiveCartId(cart.id);
    syncCartToAPI(cart).catch(() => {});
    return cart;
  }, [carts, personalCartId, setCarts, setPersonalCartId, setActiveCartId]);

  const createCommonCart = useCallback((
    name: string,
    creatorId: string,
    creatorName: string,
    splitMode: SplitMode,
    memberIds?: string[]
  ): Cart => {
    const cart: Cart = {
      id: generateCartId(),
      code: generateCartCode(),
      name,
      type: 'common',
      splitMode,
      createdBy: creatorId,
      memberIds: memberIds || [creatorId],
      items: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setCarts(prev => ({ ...prev, [cart.id]: cart }));
    setActiveCartId(cart.id);
    syncCartToAPI(cart).catch(() => {});
    return cart;
  }, [setCarts, setActiveCartId]);

  const joinCommonCart = useCallback((code: string, userId: string): Cart | null => {
    const upperCode = code.toUpperCase();
    const found = Object.values(carts).find(c => c.type === 'common' && c.code.toUpperCase() === upperCode);
    if (!found) return null;
    if (found.memberIds.includes(userId)) {
      setActiveCartId(found.id);
      return found;
    }
    const updated: Cart = {
      ...found,
      memberIds: [...found.memberIds, userId],
    };
    setCarts(prev => ({ ...prev, [found.id]: updated }));
    setActiveCartId(found.id);
    syncCartToAPI(updated).catch(() => {});
    return updated;
  }, [carts, setCarts, setActiveCartId]);

  const joinCommonCartViaApi = useCallback(async (code: string, userId: string): Promise<Cart | null> => {
    try {
      const result = await cartApi.join(code, userId, '');
      if (result.cart) {
        const apiCart: Cart = {
          id: result.cart.id,
          code: result.cart.code,
          name: result.cart.name || 'Common Cart',
          type: 'common',
          splitMode: result.cart.splitMode || 'auto',
          createdBy: result.cart.createdBy || userId,
          memberIds: result.cart.memberIds || [userId],
          items: result.cart.items || [],
          isActive: true,
          createdAt: result.cart.createdAt || new Date().toISOString(),
        };
        setCarts(prev => {
          if (prev[apiCart.id]) return prev;
          return { ...prev, [apiCart.id]: apiCart };
        });
        setActiveCartId(apiCart.id);
        return apiCart;
      }
    } catch {}
    return null;
  }, [setCarts, setActiveCartId]);

  const leaveCommonCart = useCallback((cartId: string, userId: string) => {
    let updatedCart: Cart | null = null;
    setCarts(prev => {
      const cart = prev[cartId];
      if (!cart) return prev;
      updatedCart = {
        ...cart,
        memberIds: cart.memberIds.filter(id => id !== userId),
      };
      return { ...prev, [cartId]: updatedCart! };
    });
    if (activeCartId === cartId) {
      setActiveCartId(personalCartId);
    }
    if (updatedCart) syncCartToAPI(updatedCart).catch(() => {});
  }, [activeCartId, personalCartId, setCarts, setActiveCartId]);

  const updateCartSplitMode = useCallback((cartId: string, mode: SplitMode) => {
    setCarts(prev => {
      const cart = prev[cartId];
      if (!cart) return prev;
      return { ...prev, [cartId]: { ...cart, splitMode: mode } };
    });
    syncCartToAPI({ id: cartId, splitMode: mode } as Cart).catch(() => {});
  }, [setCarts]);

  const updateCartName = useCallback((cartId: string, name: string) => {
    setCarts(prev => {
      const cart = prev[cartId];
      if (!cart) return prev;
      return { ...prev, [cartId]: { ...cart, name } };
    });
    syncCartToAPI({ id: cartId, name } as Cart).catch(() => {});
  }, [setCarts]);

  const updateActiveCartItems = useCallback((updater: (items: CartItem[]) => CartItem[]) => {
    if (!activeCartId) return;
    setCarts(prev => {
      const cart = prev[activeCartId];
      if (!cart) return prev;
      return { ...prev, [activeCartId]: { ...cart, items: updater(cart.items) } };
    });
  }, [activeCartId, setCarts]);

  const addItem = useCallback((product: Product, quantity: number, addedBy: string, isShared = false) => {
    let addedItem: CartItem | null = null;
    updateActiveCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.addedBy === addedBy && i.isShared === isShared);
      if (existing) {
        addedItem = { ...existing, quantity: existing.quantity + quantity };
        return prev.map(i => i.id === existing.id ? addedItem! : i);
      }
      const id = `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      addedItem = { id, product, quantity, addedBy, isShared, checked: false };
      return [...prev, addedItem!];
    });
    if (addedItem && activeCartId) {
      syncCartItemToAPI(activeCartId, addedItem).catch(() => {});
    }
  }, [updateActiveCartItems, activeCartId]);

  const removeItem = useCallback((itemId: string) => {
    updateActiveCartItems(prev => prev.filter(i => i.id !== itemId));
    if (activeCartId) {
      syncRemoveCartItemToAPI(activeCartId, itemId).catch(() => {});
    }
  }, [updateActiveCartItems, activeCartId]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(itemId); return; }
    updateActiveCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  }, [updateActiveCartItems, removeItem]);

  const toggleShared = useCallback((itemId: string) => {
    updateActiveCartItems(prev => prev.map(i => i.id === itemId ? { ...i, isShared: !i.isShared } : i));
  }, [updateActiveCartItems]);

  const toggleChecked = useCallback((itemId: string) => {
    updateActiveCartItems(prev => prev.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i));
  }, [updateActiveCartItems]);

  const clearCart = useCallback(() => {
    updateActiveCartItems(() => []);
  }, [updateActiveCartItems]);

  const totalItems = useMemo(() => activeCart?.items.reduce((s, i) => s + i.quantity, 0) || 0, [activeCart]);
  const totalPrice = useMemo(() => activeCart?.items.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0, [activeCart]);

  const getItemsByMember = useCallback((memberId: string) => {
    return activeCart?.items.filter(i => i.addedBy === memberId && !i.isShared) || [];
  }, [activeCart]);

  const getSharedItems = useCallback(() => {
    return activeCart?.items.filter(i => i.isShared) || [];
  }, [activeCart]);

  const loadTemplate = useCallback((templateId: string) => {
    const allTemplates = [...defaultTemplates, ...savedTemplates];
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    const uid = userId || getCurrentUserId();
    updateActiveCartItems(prev => {
      const newItems = [...prev];
      for (const tItem of template.items) {
        const product = getProductById(tItem.productId);
        if (!product) continue;
        const existing = newItems.find(i => i.product.id === product.id);
        if (existing) {
          existing.quantity += tItem.quantity;
        } else {
          newItems.push({
            id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            product,
            quantity: tItem.quantity,
            addedBy: uid,
            isShared: true,
            checked: false,
          });
        }
      }
      return newItems;
    });
  }, [savedTemplates, updateActiveCartItems, userId]);

  const saveTemplateFn = useCallback((name: string, items?: Template['items']) => {
    const templateItems = items || (activeCart ? activeCart.items.map(i => ({ productId: i.product.id, quantity: i.quantity })) : []);
    if (templateItems.length === 0) return;
    const total = templateItems.reduce((s, i) => {
      const p = getProductById(i.productId);
      return s + (p ? p.price * i.quantity : 0);
    }, 0);
    const template: Template = {
      id: `t-${Date.now()}`,
      name,
      items: templateItems,
      totalItems: templateItems.length,
      totalPrice: total,
    };
    setSavedTemplates(prev => [...prev, template]);
  }, [activeCart, totalPrice, setSavedTemplates]);

  const deleteTemplate = useCallback((templateId: string) => {
    setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [setSavedTemplates]);

  return (
    <CartContext.Provider value={{
      carts, activeCartId, personalCartId, activeCart, commonCarts,
      setActiveCart, createPersonalCart, createCommonCart,
      joinCommonCart, joinCommonCartViaApi, leaveCommonCart,
      updateCartSplitMode, updateCartName,
      addItem, removeItem, updateQuantity, toggleShared, toggleChecked, clearCart,
      totalItems, totalPrice, getItemsByMember, getSharedItems,
      loadTemplate, savedTemplates, saveTemplate: saveTemplateFn, setSavedTemplates, deleteTemplate,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export { generateCartCode, generateCartId };
