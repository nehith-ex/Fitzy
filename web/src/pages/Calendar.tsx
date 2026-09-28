import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
  CalendarSettings,
  CalendarMetricKey,
  DEFAULT_CALENDAR_SETTINGS,
  WorkoutSession,
  WorkoutSet,
} from '../types/database';

const GOLD_PALETTE = [
  '#D4AF37', // Primary Gold
  '#F0D27A', // Light Gold
  '#C59B27', // Bronze Gold
  '#E5C158', // Soft Gold
  '#DFBA50', // Champagne Gold
  '#B38F22', // Deep Gold
  '#997A1E', // Dark Amber Gold
  '#F5F1E6', // Warm Sand
];

export const Calendar: React.FC = () => {
  const { user } = useAuth();

  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_CALENDAR_SETTINGS);
  const [currentView, setCurrentView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentDatePivot, setCurrentDatePivot] = useState<Date>(new Date());

  const [showCustomize, setShowCustomize] = useState<boolean>(false);
  const [showDayDetail, setShowDayDetail] = useState<boolean>(false);

  // Day detail state
  const [dayWorkouts, setDayWorkouts] = useState<(WorkoutSession & { sets: WorkoutSet[] })[]>([]);
  const [dayNotes, setDayNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [notesMessage, setNotesMessage] = useState<string | null>(null);

  // Month session activity map
  const [sessionDates, setSessionDates] = useState<Record<string, WorkoutSession & { sets: WorkoutSet[] }>>({});

  // Load user settings on mount
  useEffect(() => {
    async function loadSettings() {
      if (!isSupabaseConfigured || !user) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('calendar_settings')
          .eq('user_id', user.id)
          .single();

        if (data?.calendar_settings && !error) {
          const loaded = data.calendar_settings as CalendarSettings;
          setSettings(loaded);
          setCurrentView(loaded.viewMode || 'month');
        }
      } catch (err) {
        console.warn('Could not load user_settings from Supabase:', err);
      }
    }

    loadSettings();
  }, [user]);

  // Load sessions for calendar markers
  useEffect(() => {
    async function loadSessions() {
      if (!user) return;

      if (!isSupabaseConfigured) {
        // Sample preview sessions for today and yesterday
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        setSessionDates({
          [todayStr]: {
            id: 'mock_today',
            user_id: user.id,
            title: 'Upper Body Strength',
            started_at: new Date().toISOString(),
            notes: 'Felt strong on bench press.',
            sets: [],
          },
          [yesterdayStr]: {
            id: 'mock_yesterday',
            user_id: user.id,
            title: 'Leg Day & Calves',
            started_at: new Date(Date.now() - 86400000).toISOString(),
            notes: 'Heavy squats completed cleanly.',
            sets: [],
          },
        });
        return;
      }

      try {
        const { data: sessions, error } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id);

        if (!error && sessions) {
          const sessionMap: Record<string, WorkoutSession & { sets: WorkoutSet[] }> = {};
          sessions.forEach((s: WorkoutSession) => {
            const dateStr = s.started_at.split('T')[0];
            sessionMap[dateStr] = { ...s, sets: [] };
          });
          setSessionDates(sessionMap);
        }
      } catch (err) {
        console.warn('Could not load calendar sessions:', err);
      }
    }

    loadSessions();
  }, [user]);

  // Save Settings to Supabase (upsert)
  const handleSaveSettings = async (newSettings: CalendarSettings) => {
    setSettings(newSettings);
    setCurrentView(newSettings.viewMode);

    if (!isSupabaseConfigured || !user) {
      return;
    }

    try {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        calendar_settings: newSettings,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving user_settings:', err);
    }
  };

  // Open day detail and load day workouts and notes
  const handleOpenDay = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setNotesMessage(null);

    const existingSession = sessionDates[dateStr];
    setDayNotes(existingSession?.notes || '');

    if (!isSupabaseConfigured || !user) {
      if (existingSession) {
        setDayWorkouts([existingSession]);
      } else {
        setDayWorkouts([]);
      }
      setShowDayDetail(true);
      return;
    }

    try {
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', `${dateStr}T00:00:00`)
        .lte('started_at', `${dateStr}T23:59:59`);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map((s) => s.id);
        const { data: sets } = await supabase
          .from('sets')
          .select('*, exercises(name)')
          .in('session_id', sessionIds);

        const withSets = sessions.map((s) => ({
          ...s,
          sets: (sets || [])
            .filter((st: any) => st.session_id === s.id)
            .map((st: any) => ({
              ...st,
              exercise_name: st.exercises?.name,
            })),
        }));

        setDayWorkouts(withSets);
        if (withSets[0]?.notes) {
          setDayNotes(withSets[0].notes);
        }
      } else {
        setDayWorkouts([]);
      }
    } catch {
      setDayWorkouts([]);
    }

    setShowDayDetail(true);
  };

  // Save Day Notes
  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesMessage(null);

    if (!isSupabaseConfigured || !user) {
      if (sessionDates[selectedDate]) {
        sessionDates[selectedDate].notes = dayNotes;
      }
      setSavingNotes(false);
      setNotesMessage('Note saved locally.');
      return;
    }

    try {
      if (dayWorkouts.length > 0) {
        await supabase
          .from('workout_sessions')
          .update({ notes: dayNotes })
          .eq('id', dayWorkouts[0].id);
      } else {
        // Insert a day log note session
        await supabase.from('workout_sessions').insert({
          user_id: user.id,
          title: 'Daily Journal',
          started_at: `${selectedDate}T12:00:00.000Z`,
          notes: dayNotes,
        });
      }
      setNotesMessage('Note saved to Supabase!');
    } catch (err: any) {
      setNotesMessage('Could not save note.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Month Navigation
  const prevPeriod = () => {
    const next = new Date(currentDatePivot);
    if (currentView === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDatePivot(next);
  };

  const nextPeriod = () => {
    const next = new Date(currentDatePivot);
    if (currentView === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDatePivot(next);
  };

  // Generate Calendar Days
  const year = currentDatePivot.getFullYear();
  const month = currentDatePivot.getMonth();

  const monthName = currentDatePivot.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const getDaysForMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay(); // 0 is Sun, 1 is Mon
    if (settings.weekStart === 'monday') {
      startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    }

    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(d);
    }
    return days;
  };

  const getDaysForWeek = () => {
    const curr = new Date(currentDatePivot);
    let dayIndex = curr.getDay();
    if (settings.weekStart === 'monday') {
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    }

    const firstOfWeek = new Date(curr);
    firstOfWeek.setDate(curr.getDate() - dayIndex);

    const weekDays: { date: Date; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstOfWeek);
      d.setDate(firstOfWeek.getDate() + i);
      const str = d.toISOString().split('T')[0];
      weekDays.push({ date: d, dateStr: str });
    }
    return weekDays;
  };

  const weekHeaders = settings.weekStart === 'monday'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Metric presence check for a date
  const getActiveMetricsForDate = (dateStr: string) => {
    const active: { key: CalendarMetricKey; color: string }[] = [];
    const hasWorkout = Boolean(sessionDates[dateStr]);
    const hasNotes = Boolean(sessionDates[dateStr]?.notes);

    // Dynamic presence:
    // Workout metric
    if (settings.metrics.workout.enabled && hasWorkout) {
      active.push({ key: 'workout', color: settings.metrics.workout.color });
    }

    // Deterministic markers based on date string so user sees customization live
    const dNum = parseInt(dateStr.slice(-2), 10) || 1;
    if (settings.metrics.protein.enabled && dNum % 2 === 0) {
      active.push({ key: 'protein', color: settings.metrics.protein.color });
    }
    if (settings.metrics.calories.enabled && dNum % 3 !== 0) {
      active.push({ key: 'calories', color: settings.metrics.calories.color });
    }
    if (settings.metrics.water.enabled && dNum % 2 !== 0) {
      active.push({ key: 'water', color: settings.metrics.water.color });
    }
    if (settings.metrics.steps.enabled && dNum % 4 !== 0) {
      active.push({ key: 'steps', color: settings.metrics.steps.color });
    }
    if (settings.metrics.sleep.enabled && dNum % 5 === 0) {
      active.push({ key: 'sleep', color: settings.metrics.sleep.color });
    }
    if (settings.metrics.notes.enabled && hasNotes) {
      active.push({ key: 'notes', color: settings.metrics.notes.color });
    }

    return active;
  };

  return (
    <div className="main-content">
      {/* Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }}>
            Fitness Journal
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Calendar</h1>
        </div>

        <button
          onClick={() => setShowCustomize(true)}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="21" y2="21" />
            <line x1="4" x2="20" y1="14" y2="14" />
            <line x1="4" x2="20" y1="7" y2="7" />
            <circle cx="9" cy="7" r="2" />
            <circle cx="15" cy="14" r="2" />
            <circle cx="7" cy="21" r="2" />
          </svg>
          <span>Customize</span>
        </button>
      </div>

      {/* Month/Week Toggle & Navigation */}
      <div className="card" style={{ padding: '16px 20px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={prevPeriod}
              className="btn btn-secondary btn-icon"
              style={{ width: '34px', height: '34px' }}
              aria-label="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 style={{ fontSize: '16px', fontWeight: 700, minWidth: '140px', textAlign: 'center' }}>
              {monthName}
            </h2>
            <button
              onClick={nextPeriod}
              className="btn btn-secondary btn-icon"
              style={{ width: '34px', height: '34px' }}
              aria-label="Next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--surface-raised)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => setCurrentView('month')}
              style={{
                background: currentView === 'month' ? 'var(--gold)' : 'none',
                color: currentView === 'month' ? '#0A0A0A' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Month
            </button>
            <button
              onClick={() => setCurrentView('week')}
              style={{
                background: currentView === 'week' ? 'var(--gold)' : 'none',
                color: currentView === 'week' ? '#0A0A0A' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Week
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, paddingBottom: '6px' }}>
            {weekHeaders.map((h, i) => (
              <span key={i}>{h}</span>
            ))}
          </div>

          {/* Month View Grid */}
          {currentView === 'month' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {getDaysForMonth().map((dayNum, idx) => {
                if (dayNum === null) {
                  return <div key={`empty_${idx}`} style={{ height: '54px' }} />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const metrics = getActiveMetricsForDate(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                const isCellFilled = settings.markerStyle === 'cells' && metrics.length > 0;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleOpenDay(dateStr)}
                    style={{
                      height: '54px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isCellFilled
                        ? metrics[0].color + '26'
                        : isSelected
                        ? 'var(--surface-raised)'
                        : '#101010',
                      border: isSelected
                        ? '1px solid var(--gold)'
                        : isToday
                        ? '1px solid var(--text-muted)'
                        : '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 2px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '13px',
                        fontWeight: isToday || isSelected ? 800 : 500,
                        color: isSelected ? 'var(--gold)' : isToday ? 'var(--text)' : 'var(--text-muted)',
                      }}
                    >
                      {dayNum}
                    </span>

                    {/* Markers according to markerStyle */}
                    {settings.markerStyle === 'dots' && (
                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '6px' }}>
                        {metrics.slice(0, 4).map((m, mIdx) => (
                          <span
                            key={mIdx}
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: m.color,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {settings.markerStyle === 'bars' && (
                      <div style={{ display: 'flex', gap: '2px', width: '80%', minHeight: '4px' }}>
                        {metrics.slice(0, 3).map((m, mIdx) => (
                          <span
                            key={mIdx}
                            style={{
                              flex: 1,
                              height: '3px',
                              borderRadius: '2px',
                              backgroundColor: m.color,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {settings.markerStyle === 'cells' && (
                      <div style={{ height: '4px' }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Week View Grid */}
          {currentView === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {getDaysForWeek().map(({ date, dateStr }) => {
                const dayNum = date.getDate();
                const metrics = getActiveMetricsForDate(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleOpenDay(dateStr)}
                    style={{
                      height: '80px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--surface-raised)' : '#101010',
                      border: isSelected ? '1px solid var(--gold)' : '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 2px',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: isSelected ? 'var(--gold)' : isToday ? 'var(--text)' : 'var(--text-muted)',
                      }}
                    >
                      {dayNum}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                      {metrics.slice(0, 3).map((m, mIdx) => (
                        <span
                          key={mIdx}
                          style={{
                            width: settings.markerStyle === 'bars' ? '18px' : '6px',
                            height: settings.markerStyle === 'bars' ? '3px' : '6px',
                            borderRadius: settings.markerStyle === 'bars' ? '2px' : '50%',
                            backgroundColor: m.color,
                          }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Metric Legend */}
      <div className="card card-raised" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Metric Markers
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
          {Object.entries(settings.metrics)
            .filter(([_, conf]) => conf.enabled)
            .map(([key, conf]) => (
              <div
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: conf.color }} />
                <span>{conf.label}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Customize Settings Sheet */}
      {showCustomize && (
        <div className="sheet-overlay" onClick={() => setShowCustomize(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Calendar Customization</h3>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setShowCustomize(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="sheet-body">
              {/* Default View & Week Start */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Default View</label>
                  <select
                    className="input"
                    value={settings.viewMode}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...settings,
                        viewMode: e.target.value as 'month' | 'week',
                      })
                    }
                  >
                    <option value="month">Month View</option>
                    <option value="week">Week View</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Week Starts On</label>
                  <select
                    className="input"
                    value={settings.weekStart}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...settings,
                        weekStart: e.target.value as 'monday' | 'sunday',
                      })
                    }
                  >
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              </div>

              {/* Marker Style */}
              <div className="form-group">
                <label className="form-label">Marker Style</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {(['dots', 'bars', 'cells'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleSaveSettings({ ...settings, markerStyle: style })}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: settings.markerStyle === style ? 'var(--gold)' : 'var(--surface-raised)',
                        color: settings.markerStyle === style ? '#0A0A0A' : 'var(--text)',
                        border: '1px solid var(--border)',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metrics Toggle & Color Picker */}
              <div className="form-group">
                <label className="form-label">Visible Metrics & Palette</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(Object.keys(settings.metrics) as CalendarMetricKey[]).map((key) => {
                    const metric = settings.metrics[key];
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--surface-raised)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={metric.enabled}
                            onChange={(e) => {
                              const updated = {
                                ...settings,
                                metrics: {
                                  ...settings.metrics,
                                  [key]: { ...metric, enabled: e.target.checked },
                                },
                              };
                              handleSaveSettings(updated);
                            }}
                            style={{ accentColor: 'var(--gold)', width: '16px', height: '16px' }}
                          />
                          <span>{metric.label}</span>
                        </label>

                        {/* Gold-toned color swatches */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {GOLD_PALETTE.slice(0, 4).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...settings,
                                  metrics: {
                                    ...settings.metrics,
                                    [key]: { ...metric, color },
                                  },
                                };
                                handleSaveSettings(updated);
                              }}
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: color,
                                border: metric.color === color ? '2px solid #FFFFFF' : 'none',
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setShowCustomize(false)}
                style={{ marginTop: '10px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Sheet */}
      {showDayDetail && (
        <div className="sheet-overlay" onClick={() => setShowDayDetail(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <div>
                <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Day Detail
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>

              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setShowDayDetail(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="sheet-body">
              {/* Day Workouts */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Workouts Recorded</h4>
                {dayWorkouts.length === 0 ? (
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                    No workouts logged on this date.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayWorkouts.map((w) => (
                      <div
                        key={w.id}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--surface-raised)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700 }}>{w.title}</span>
                          <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>Completed</span>
                        </div>
                        {w.sets && w.sets.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            {w.sets.length} sets completed
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Notes Field */}
              <div className="form-group">
                <label className="form-label">Day Notes / Journal</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Record your mindset, recovery, or soreness..."
                  value={dayNotes}
                  onChange={(e) => setDayNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              {notesMessage && (
                <div style={{ fontSize: '13px', color: 'var(--gold-light)', fontWeight: 600 }}>
                  {notesMessage}
                </div>
              )}

              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="btn btn-primary"
              >
                {savingNotes ? 'Saving note...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
