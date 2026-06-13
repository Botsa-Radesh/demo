'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/NotificationToast';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    setIsLoading(true);
    const success = await signup(name, email, password);
    setIsLoading(false);
    if (success) {
      showToast('Account created! Welcome to VoiceCart!', 'success');
      router.push('/');
    } else {
      showToast('An account with this email already exists', 'error');
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
          <h1 className="auth-title">Create Account</h1>
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Your name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="First and last name" autoFocus />
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
              <p className="auth-hint">Passwords must be at least 6 characters.</p>
            </div>
            <div className="auth-field">
              <label>Re-enter password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ padding: 10, fontSize: 14 }} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create your VoiceCart account'}
            </button>
          </form>
          <p className="auth-legal">
            By creating an account, you agree to VoiceCart&apos;s Conditions of Use and Privacy Notice.
          </p>
          <p className="auth-switch">
            Already have an account? <Link href="/auth/login">Sign In</Link>
          </p>
        </div>
        <div className="auth-footer">
          <a href="#" onClick={(e) => { e.preventDefault(); showToast('View Conditions of Use at amazon.com', 'info'); }}>Conditions of Use</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast('Privacy Notice available on request', 'info'); }}>Privacy Notice</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast('Visit help.voicecart.app for support', 'info'); }}>Help</a>
        </div>
      </div>
    </div>
  );
}
