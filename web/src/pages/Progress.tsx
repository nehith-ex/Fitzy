import React from 'react';

export const Progress: React.FC = () => {
  return (
    <div className="main-content">
      {/* Header */}
      <div>
        <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }}>
          Analytics
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Progress</h1>
      </div>

      {/* Main Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <div className="card card-raised" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Workouts
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)', marginTop: '4px' }} className="font-mono">
            24
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+4 this month</span>
        </div>

        <div className="card card-raised" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Tonnage
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--gold)', marginTop: '4px' }} className="font-mono">
            48.2k
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>kg lifted</span>
        </div>

        <div className="card card-raised" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Active Streak
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }} className="font-mono">
            12d
          </div>
          <span style={{ fontSize: '12px', color: 'var(--gold)' }}>Best: 18d</span>
        </div>

        <div className="card card-raised" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Weight Trend
          </span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }} className="font-mono">
            78.0
          </div>
          <span style={{ fontSize: '12px', color: 'var(--gold)' }}>-1.2 kg net</span>
        </div>
      </div>

      {/* PR Highlights */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Personal Records</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Bench Press</span>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Sep 15, 2026</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold)' }} className="font-mono">
              80 kg
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Back Squat</span>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Sep 12, 2026</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold)' }} className="font-mono">
              110 kg
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Deadlift</span>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Sep 10, 2026</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold)' }} className="font-mono">
              140 kg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
