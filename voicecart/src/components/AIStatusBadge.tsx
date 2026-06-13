'use client';
import React, { useEffect, useState } from 'react';
import { getAIAvailability } from '@/utils/llmService';

export function AIStatusBadge() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const check = () => {
      const available = getAIAvailability();
      if (available === null) setStatus('checking');
      else if (available) setStatus('online');
      else setStatus('offline');
    };

    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  const configs: Record<string, { bg: string; color: string; text: string; dot: string }> = {
    checking: { bg: '#f0f0f0', color: 'var(--amazon-text-muted)', text: 'AI Checking...', dot: '#999' },
    online: { bg: '#f0fff4', color: 'var(--amazon-success)', text: 'AI Online', dot: 'var(--amazon-success)' },
    offline: { bg: '#fff8e1', color: '#9c7e31', text: 'Smart Mode (AI unavailable)', dot: '#FF9900' },
  };

  const config = configs[status];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`AI status: ${config.text}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 500,
        background: config.bg,
        color: config.color,
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: config.dot,
        animation: status === 'online' ? 'pulse 2s infinite' : undefined,
      }} />
      {config.text}
    </div>
  );
}
