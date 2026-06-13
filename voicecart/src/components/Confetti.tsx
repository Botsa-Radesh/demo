'use client';
import React, { useEffect, useState } from 'react';

const COLORS = ['#FF9900', '#FFC400', '#FFD600', '#00C853', '#448AFF', '#FF1744', '#E040FB'];

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<{ id: number; color: string; left: string; delay: string; size: number }[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      size: 6 + Math.random() * 6,
    }));
    setPieces(newPieces);
    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  );
}
