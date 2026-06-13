'use client';
import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { CommonCartProvider } from '@/context/CommonCartContext';
import { CoinsProvider } from '@/context/CoinsContext';
import { MembersProvider } from '@/context/MembersContext';
import { OrderProvider } from '@/context/OrderContext';
import { ToastProvider } from './NotificationToast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CoinsProvider>
        <CartProvider>
          <MembersProvider>
            <CommonCartProvider>
              <OrderProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </OrderProvider>
            </CommonCartProvider>
          </MembersProvider>
        </CartProvider>
      </CoinsProvider>
    </AuthProvider>
  );
}
