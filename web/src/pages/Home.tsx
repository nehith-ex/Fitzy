import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Athlete';

  return (
    <div className="main-content">
      {/* Top Greeting & Streak */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Good morning
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>
            {displayName}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Streak Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)' }}>
              12 Day Streak
            </span>
          </div>

          <button
            onClick={() => signOut()}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 3 Large Tappable Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {/* Track Workout */}
        <button
          onClick={() => navigate('/workout')}
          className="card"
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '24px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border)',
            transition: 'border-color 0.15s, transform 0.1s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 5v14" />
                <path d="M18 5v14" />
                <path d="M2 9v6" />
                <path d="M22 9v6" />
                <path d="M6 12h12" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Track Workout</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sets, weight & reps</p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Track Food */}
        <button
          onClick={() => navigate('/coming-soon', { state: { feature: 'Food & Nutrition Tracker' } })}
          className="card"
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '24px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border)',
            transition: 'border-color 0.15s, transform 0.1s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Track Food</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Macros & calories</p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Track Habits */}
        <button
          onClick={() => navigate('/coming-soon', { state: { feature: 'Habits & Routine Tracker' } })}
          className="card"
          style={{
            cursor: 'pointer',
            textAlign: 'left',
            padding: '24px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border)',
            transition: 'border-color 0.15s, transform 0.1s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.99)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Track Habits</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Water, sleep & steps</p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Today Summary Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Today's Summary</h2>
          <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Workout</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>
              Upper Body
            </div>
            <span style={{ fontSize: '12px', color: 'var(--gold)' }}>Completed</span>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Calories</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }} className="font-mono">
              1,840
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 2,400 kcal</span>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Protein</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }} className="font-mono">
              142g
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 160g goal</span>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Steps</span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }} className="font-mono">
              8,420
            </div>
            <span style={{ fontSize: '12px', color: 'var(--gold)' }}>Target Hit</span>
          </div>
        </div>

        {/* Water Strip */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Hydration</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }} className="font-mono">
              2.5L / 3.0L Water
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '3px solid var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--gold)',
            }}
          >
            83%
          </div>
        </div>
      </div>
    </div>
  );
};
