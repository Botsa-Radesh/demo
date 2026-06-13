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
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Tap to Speak';
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        className={`mic-button ${status}`}
        onClick={onClick}
        disabled={disabled}
        aria-label={getLabel()}
      >
        {getIcon()}
      </button>
      <p style={{ marginTop: 12, fontSize: 13, color: 'var(--amazon-text-secondary)' }}>
        {getLabel()}
      </p>
    </div>
  );
}
