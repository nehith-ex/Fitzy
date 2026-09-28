import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const ComingSoon: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const feature = location.state?.feature || 'Feature';

  return (
    <div className="main-content" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '75vh' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold)',
          marginBottom: '16px',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {feature}
      </span>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px', marginBottom: '8px' }}>
        Coming soon
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '280px', marginBottom: '24px' }}>
        This module is currently being finalized.
      </p>

      <button
        onClick={() => navigate('/')}
        className="btn btn-secondary"
        style={{ gap: '8px' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Back to Home</span>
      </button>
    </div>
  );
};
