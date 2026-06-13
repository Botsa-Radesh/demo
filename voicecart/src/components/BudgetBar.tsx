'use client';
import React from 'react';

interface Props {
  current: number;
  budget: number;
}

export function BudgetBar({ current, budget }: Props) {
  const ratio = Math.min(current / budget, 1);
  const remaining = budget - current;
  const isOver = current > budget;

  return (
    <div className="amazon-card" style={{ borderColor: isOver ? 'rgba(177,39,4,0.3)' : 'rgba(6,125,98,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--amazon-text-secondary)' }}>
          {isOver ? 'Over budget!' : `${remaining > 0 ? '₹' + remaining + ' remaining' : 'Exactly on budget'}`}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: isOver ? 'var(--amazon-error)' : 'var(--amazon-success)' }}>
          ₹{current} / ₹{budget}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{
          width: `${ratio * 100}%`,
          background: isOver ? 'var(--amazon-error)' : ratio > 0.8 ? 'var(--amazon-orange)' : 'var(--amazon-success)',
        }} />
      </div>
    </div>
  );
}
