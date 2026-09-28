import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Banner } from './components/Banner';
import { BottomTabBar } from './components/BottomTabBar';
import { FloatingCoach } from './components/FloatingCoach';

import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Workout } from './pages/Workout';
import { Calendar } from './pages/Calendar';
import { Progress } from './pages/Progress';
import { ComingSoon } from './pages/ComingSoon';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="main-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 600 }}>
          Loading Fitzy...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <header className="app-header">
        <a href="/" className="brand-title">Fitzy</a>
      </header>
      {children}
      <FloatingCoach />
      <BottomTabBar />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Banner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              }
            />
            <Route
              path="/workout"
              element={
                <ProtectedLayout>
                  <Workout />
                </ProtectedLayout>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedLayout>
                  <Calendar />
                </ProtectedLayout>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedLayout>
                  <Progress />
                </ProtectedLayout>
              }
            />
            <Route
              path="/coming-soon"
              element={
                <ProtectedLayout>
                  <ComingSoon />
                </ProtectedLayout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
