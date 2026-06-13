'use client';
import React from 'react';

interface Props {
  transcript: string;
  interimTranscript: string;
  aiResponse: string;
  isTyping: boolean;
}

export function VoiceTranscript({ transcript, interimTranscript, aiResponse, isTyping }: Props) {
  return (
    <div style={{ minHeight: 80, padding: '12px 0' }}>
      {transcript && (
        <p style={{ fontSize: 15, color: 'var(--amazon-text)', marginBottom: 8, fontStyle: 'italic' }}>
          &ldquo;{transcript}&rdquo;
        </p>
      )}
      {interimTranscript && (
        <p style={{ fontSize: 14, color: 'var(--amazon-text-muted)', marginBottom: 8 }}>
          {interimTranscript}
        </p>
      )}
      {isTyping && (
        <div className="typing-dots" style={{ marginBottom: 8 }}>
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      )}
      {aiResponse && !isTyping && (
        <p className="animate-fadeIn" style={{ fontSize: 14, color: 'var(--amazon-orange)', fontWeight: 500 }}>
          {aiResponse}
        </p>
      )}
    </div>
  );
}
