'use client';
import React, { useEffect, useState } from 'react';

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
  const [animated, setAnimated] = useState(false);
  const max = Math.max(...data.map(d => d.value), 1);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {title && <h3 className="section-title" style={{ fontSize: 14 }}>{title}</h3>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height, padding: '0 8px' }}>
        {data.map((d, i) => {
          const barHeight = animated ? (d.value / max) * (height - 50) : 0;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--amazon-text-secondary)' }}>
                ₹{d.value.toLocaleString()}
              </span>
              <div style={{
                width: '100%',
                maxWidth: 48,
                height: `${Math.max(barHeight, 4)}px`,
                background: `linear-gradient(180deg, ${d.color} 0%, ${d.color}CC 100%)`,
                borderRadius: '6px 6px 2px 2px',
                transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: `${i * 0.15}s`,
                boxShadow: `0 2px 8px ${d.color}40`,
                position: 'relative',
              }}>
                {/* Shimmer effect */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '30%', borderRadius: '6px 6px 0 0',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--amazon-text-secondary)', textAlign: 'center', fontWeight: 500 }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const [animated, setAnimated] = useState(false);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: animated ? `conic-gradient(${conicGradient})` : '#f0f0f0',
          transition: 'all 0.8s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          position: 'relative',
        }}>
          {/* Inner circle for donut effect */}
          <div style={{
            position: 'absolute',
            top: '25%', left: '25%',
            width: '50%', height: '50%',
            borderRadius: '50%',
            background: 'var(--amazon-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--amazon-text-muted)' }}>Total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amazon-text)' }}>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {data.slice(0, 6).map((d, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6,
            padding: '4px 0',
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3, background: d.color,
              boxShadow: `0 1px 3px ${d.color}40`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, color: 'var(--amazon-text-secondary)', flex: 1 }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--amazon-text)' }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
