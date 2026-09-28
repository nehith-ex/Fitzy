import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { signIn, signUp, signInDemo, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    signInDemo();
    navigate('/');
  };

  return (
    <div className="main-content" style={{ justifyContent: 'center', minHeight: '90vh', paddingBottom: '30px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'var(--gold)',
            color: '#0A0A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 30px rgba(212, 175, 55, 0.25)',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 5v14" />
            <path d="M18 5v14" />
            <path d="M2 9v6" />
            <path d="M22 9v6" />
            <path d="M6 12h12" />
          </svg>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)' }}>Fitzy</h1>
        <p style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
          Personal Fitness System
        </p>
      </div>

      <div className="card" style={{ padding: '28px 24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingBottom: '12px', gap: '16px' }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: !isSignUp ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              paddingBottom: '4px',
              borderBottom: !isSignUp ? '2px solid var(--gold)' : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: isSignUp ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              paddingBottom: '4px',
              borderBottom: isSignUp ? '2px solid var(--gold)' : 'none',
            }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#2A1717',
              border: '1px solid #5C2323',
              color: '#F5A3A3',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="input"
                placeholder="Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="athlete@fitzy.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Fitzy Account' : 'Sign In'}
          </button>
        </form>

        {!isConfigured && (
          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Preview Mode (Supabase keys not detected)
            </p>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '14px' }}
            >
              Continue as Demo Athlete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
