'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { SubHeader } from './SubHeader';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth/');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <SubHeader />
      <main>{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
