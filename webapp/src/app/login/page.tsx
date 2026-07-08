"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', background: 'var(--bg-color)', color: 'var(--text-main)'
    }}>
      <div style={{
        background: 'var(--panel-bg)', padding: '2rem', borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ color: 'var(--text-highlight)', marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h1>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder="Enter admin password (default: admin123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none'
            }}
          />
          {error && <div style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div>}
          <button type="submit" style={{
            background: 'var(--accent)', color: '#0b0c10', padding: '0.75rem',
            border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
