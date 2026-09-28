import React from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export const Banner: React.FC = () => {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="status-banner" role="status">
      <div className="status-badge">
        <span className="status-dot" />
        <span>Supabase not connected</span>
      </div>
      <span style={{ fontSize: '11px', opacity: 0.8 }}>Preview Mode</span>
    </div>
  );
};
