'use client';
import React from 'react';
import { MicStatus } from '@/types';

interface Props {
  status: MicStatus;
  onClick: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({ status, onClick, disabled }: Props) {
  const getIcon = () => {
    switch (status) {
      case 'listening': return '🎤';
      case 'processing': return '⏳';
      case 'speaking': return '🔊';
      default: return '🎤';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'listening': return 'Listening... Tap to stop';
      case 'processing': return 'Processing your request...';
      case 'speaking': return 'Speaking response...';
      default: return 'Tap to speak';
    }
  };

  const getHint = () => {
    switch (status) {
      case 'listening': return 'Speak naturally — I understand full sentences';
      case 'processing': return 'Analyzing what you said...';
      case 'speaking': return 'Playing back AI response';
      default: return 'Try: "Add 2kg rice, milk, and 3 apples"';
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Ripple rings when listening */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {status === 'listening' && (
          <>
            <span style={{
              position: 'absolute', inset: -8, borderRadius: '50%',
              border: '2px solid rgba(72, 168, 29, 0.3)',
              animation: 'pulse 1.5s infinite',
            }} />
            <span style={{
              position: 'absolute', inset: -16, borderRadius: '50%',
              border: '2px solid rgba(72, 168, 29, 0.15)',
              animation: 'pulse 1.5s infinite 0.3s',
            }} />
          </>
        )}
        <button
          className={`mic-button ${status}`}
          onClick={onClick}
          disabled={disabled}
          aria-label={getLabel()}
          aria-pressed={status === 'listening'}
          role="switch"
          aria-checked={status === 'listening'}
          style={{
            position: 'relative',
            outline: 'none',
          }}
        >
          {getIcon()}
          {/* Processing spinner overlay */}
          {status === 'processing' && (
            <span style={{
              position: 'absolute', inset: -3,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'var(--amazon-orange)',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
        </button>
      </div>
      <p style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: status === 'listening' ? 'var(--amazon-success)' : 'var(--amazon-text-secondary)' }}>
        {getLabel()}
      </p>
      <p style={{ marginTop: 4, fontSize: 11, color: 'var(--amazon-text-muted)' }}>
        {getHint()}
      </p>
    </div>
  );
}
