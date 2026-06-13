'use client';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { CartItem, Product, Template } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { products, getProductById } from '@/data/products';
import { defaultTemplates } from '@/data/templates';

interface CartContextType {
  items: CartItem[];
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
  saveTemplate: (name: string) => void;
  deleteTemplate: (templateId: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>('voicecart-items', []);
  const [savedTemplates, setSavedTemplates] = useLocalStorage<Template[]>('voicecart-templates', defaultTemplates);

  const addItem = useCallback((product: Product, quantity: number, addedBy: string, isShared = false) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.addedBy === addedBy && i.isShared === isShared);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      const id = `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return [...prev, { id, product, quantity, addedBy, isShared, checked: false }];
    });
  }, [setItems]);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, [setItems]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(itemId); return; }
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  }, [setItems, removeItem]);

  const toggleShared = useCallback((itemId: string) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, isShared: !i.isShared } : i));
  }, [setItems]);

  const toggleChecked = useCallback((itemId: string) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i));
  }, [setItems]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.product.price * i.quantity, 0), [items]);

  const getItemsByMember = useCallback((memberId: string) => items.filter(i => i.addedBy === memberId && !i.isShared), [items]);
  const getSharedItems = useCallback(() => items.filter(i => i.isShared), [items]);

  const loadTemplate = useCallback((templateId: string) => {
    const allTemplates = [...defaultTemplates, ...savedTemplates];
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    setItems(prev => {
      const newItems = [...prev];
      for (const tItem of template.items) {
        const product = getProductById(tItem.productId);
        if (!product) continue;
        const existing = newItems.find(i => i.product.id === product.id && i.addedBy === 'm1');
        if (existing) {
          existing.quantity += tItem.quantity;
        } else {
          newItems.push({
            id: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            product,
            quantity: tItem.quantity,
            addedBy: 'm1',
            isShared: true,
            checked: false,
          });
        }
      }
      return newItems;
    });
  }, [savedTemplates, setItems]);

  const saveTemplate = useCallback((name: string) => {
    const template: Template = {
      id: `t-${Date.now()}`,
      name,
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      totalItems: items.length,
      totalPrice,
    };
    setSavedTemplates(prev => [...prev, template]);
  }, [items, totalPrice, setSavedTemplates]);

  const deleteTemplate = useCallback((templateId: string) => {
    setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [setSavedTemplates]);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, toggleShared, toggleChecked, clearCart,
      totalItems, totalPrice, getItemsByMember, getSharedItems,
      loadTemplate, savedTemplates, saveTemplate, deleteTemplate,
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
