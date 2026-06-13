'use client';
import { useCallback, useRef } from 'react';

export function useSpeechSynthesis() {
  const speakingRef = useRef(false);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.onstart = () => { speakingRef.current = true; };
    utterance.onend = () => { speakingRef.current = false; onEnd?.(); };
    utterance.onerror = () => { speakingRef.current = false; onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speakingRef.current = false;
  }, []);

  const isSpeaking = () => speakingRef.current;

  return { speak, stopSpeaking, isSpeaking };
}
