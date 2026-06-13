'use client';
import React from 'react';

interface Props {
  amount: number;
  active: boolean;
}

export function CoinsAnimation({ amount, active }: Props) {
  if (!active) return null;

  const coins = Array.from({ length: Math.min(amount, 12) }, (_, i) => ({
    id: i,
    tx: `${(Math.random() - 0.5) * 200}px`,
    ty: `-${100 + Math.random() * 200}px`,
    delay: `${i * 0.08}s`,
  }));

  return (
    <>
      {coins.map(coin => (
        <div
          key={coin.id}
          className="coin-fly"
          style={{
            left: `${40 + Math.random() * 20}%`,
            top: '50%',
            '--tx': coin.tx,
            '--ty': coin.ty,
            animationDelay: coin.delay,
          } as React.CSSProperties}
        >
          🪙
        </div>
      ))}
    </>
  );
}
