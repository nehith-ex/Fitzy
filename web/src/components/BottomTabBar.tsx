import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomTabBar: React.FC = () => {
  return (
    <nav className="bottom-tab-bar" aria-label="Bottom Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/workout"
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 5v14" />
          <path d="M18 5v14" />
          <path d="M2 9v6" />
          <path d="M22 9v6" />
          <path d="M6 12h12" />
        </svg>
        <span>Workout</span>
      </NavLink>

      <NavLink
        to="/calendar"
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
        <span>Calendar</span>
      </NavLink>

      <NavLink
        to="/progress"
        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <span>Progress</span>
      </NavLink>
    </nav>
  );
};
