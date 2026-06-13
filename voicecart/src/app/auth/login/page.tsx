'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/NotificationToast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { showToast('Please fill in all fields', 'warning'); return; }
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      showToast('Signed in successfully!', 'success');
      router.push('/');
    } else {
      showToast('Invalid email or password', 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link href="/" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>Welcome to</div>
          <div className="header-logo-text" style={{ justifyContent: 'center' }}>
            <span className="amazon" style={{ color: '#111' }}>Voice</span>
            <span className="prime">Cart</span>
          </div>
        </Link>
        <div className="auth-card">
          <h1 className="auth-title">Sign In</h1>
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email or mobile phone number</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" autoFocus />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ padding: 10, fontSize: 14 }} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-legal">
            By continuing, you agree to VoiceCart&apos;s Conditions of Use and Privacy Notice.
          </p>
          <details className="auth-help">
            <summary>Need help?</summary>
            <a href="#">Forgot Password</a>
            <a href="#">Other issues with sign-in</a>
          </details>
        </div>
        <div className="auth-divider">
          <span>New to VoiceCart?</span>
        </div>
        <Link href="/auth/signup" className="btn btn-secondary w-full" style={{ textDecoration: 'none', textAlign: 'center', padding: 10, fontSize: 14, display: 'block' }}>
          Create your VoiceCart account
        </Link>
        <div className="auth-footer">
          <a href="#">Conditions of Use</a>
          <a href="#">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
      </div>
    </div>
  );
}
