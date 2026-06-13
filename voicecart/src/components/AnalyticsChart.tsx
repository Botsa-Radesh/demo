'use client';
import React from 'react';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: BarData[];
  title?: string;
  height?: number;
}

export function BarChart({ data, title, height = 160 }: Props) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div>
      {title && <h3 className="section-title" style={{ fontSize: 14 }}>{title}</h3>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, padding: '0 4px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--amazon-text-muted)' }}>₹{d.value}</span>
            <div style={{
              width: '100%', maxWidth: 40, height: `${(d.value / max) * (height - 40)}px`,
              background: d.color, borderRadius: '4px 4px 0 0', transition: 'height 0.8s ease',
              minHeight: 4,
            }} />
            <span style={{ fontSize: 10, color: 'var(--amazon-text-secondary)', textAlign: 'center' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cumPct = (() => {
    let cur = 0;
    return data.map(d => {
      const start = cur;
      cur += (d.value / total) * 100;
      return { color: d.color, start, end: cur };
    });
  })();
  const segments = cumPct.map(s => `${s.color} ${s.start}% ${s.end}%`);
  const conicGradient = segments.join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: `conic-gradient(${conicGradient})`,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
            <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', flex: 1 }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--amazon-text)' }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
