import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Exercise, WorkoutSession, WorkoutSet } from '../types/database';

interface DraftSet {
  id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex_bench', name: 'Barbell Bench Press', muscle_group: 'Chest', equipment: 'Barbell' },
  { id: 'ex_squat', name: 'Barbell Back Squat', muscle_group: 'Legs', equipment: 'Barbell' },
  { id: 'ex_deadlift', name: 'Conventional Deadlift', muscle_group: 'Back', equipment: 'Barbell' },
  { id: 'ex_ohp', name: 'Overhead Shoulder Press', muscle_group: 'Shoulders', equipment: 'Barbell' },
  { id: 'ex_lat_pull', name: 'Wide Lat Pulldown', muscle_group: 'Back', equipment: 'Cable' },
  { id: 'ex_bicep_curl', name: 'Dumbbell Bicep Curl', muscle_group: 'Arms', equipment: 'Dumbbell' },
];

export const Workout: React.FC = () => {
  const { user } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [workoutTitle, setWorkoutTitle] = useState<string>('Upper Body Strength');
  const [sets, setSets] = useState<DraftSet[]>([
    { id: 's_1', set_number: 1, weight_kg: 60, reps: 10 },
    { id: 's_2', set_number: 2, weight_kg: 60, reps: 10 },
    { id: 's_3', set_number: 3, weight_kg: 65, reps: 8 },
  ]);

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // History sessions with sets
  const [history, setHistory] = useState<(WorkoutSession & { sets: (WorkoutSet & { exercise_name?: string })[] })[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  // In-memory fallback history for preview if Supabase is not configured
  const [localHistory, setLocalHistory] = useState<(WorkoutSession & { sets: (WorkoutSet & { exercise_name?: string })[] })[]>([
    {
      id: 'prev_1',
      user_id: user?.id || 'demo-user-id',
      title: 'Chest & Triceps Hypertrophy',
      started_at: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Clean execution on working sets',
      sets: [
        { id: 'ps_1', session_id: 'prev_1', user_id: 'demo-user-id', exercise_id: 'ex_bench', set_number: 1, weight_kg: 60, reps: 10, exercise: DEFAULT_EXERCISES[0] },
        { id: 'ps_2', session_id: 'prev_1', user_id: 'demo-user-id', exercise_id: 'ex_bench', set_number: 2, weight_kg: 60, reps: 9, exercise: DEFAULT_EXERCISES[0] },
        { id: 'ps_3', session_id: 'prev_1', user_id: 'demo-user-id', exercise_id: 'ex_bench', set_number: 3, weight_kg: 65, reps: 7, exercise: DEFAULT_EXERCISES[0] },
      ],
    },
  ]);

  // Load exercises on mount
  useEffect(() => {
    async function loadExercises() {
      if (!isSupabaseConfigured) {
        setExercises(DEFAULT_EXERCISES);
        setSelectedExerciseId(DEFAULT_EXERCISES[0].id);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name');

        if (data && data.length > 0 && !error) {
          setExercises(data as Exercise[]);
          setSelectedExerciseId(data[0].id);
        } else {
          // If table is empty, fallback to standard exercises
          setExercises(DEFAULT_EXERCISES);
          setSelectedExerciseId(DEFAULT_EXERCISES[0].id);
        }
      } catch {
        setExercises(DEFAULT_EXERCISES);
        setSelectedExerciseId(DEFAULT_EXERCISES[0].id);
      }
    }

    loadExercises();
  }, []);

  // Load history on mount
  useEffect(() => {
    async function loadWorkoutHistory() {
      if (!isSupabaseConfigured || !user) {
        setHistory(localHistory);
        setLoadingHistory(false);
        return;
      }

      try {
        setLoadingHistory(true);
        // Fetch sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        if (!sessionsData || sessionsData.length === 0) {
          setHistory([]);
          setLoadingHistory(false);
          return;
        }

        // Fetch sets for these sessions
        const sessionIds = sessionsData.map((s) => s.id);
        const { data: setsData, error: setsError } = await supabase
          .from('sets')
          .select('*, exercises(name)')
          .in('session_id', sessionIds)
          .order('set_number', { ascending: true });

        if (setsError) throw setsError;

        const combined = sessionsData.map((session) => {
          const sessionSets = (setsData || [])
            .filter((s: any) => s.session_id === session.id)
            .map((s: any) => ({
              ...s,
              exercise_name: s.exercises?.name || 'Exercise',
            }));
          return {
            ...session,
            sets: sessionSets,
          };
        });

        setHistory(combined);
      } catch (err: any) {
        console.warn('Could not load history from Supabase:', err);
        setHistory(localHistory);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadWorkoutHistory();
  }, [user, localHistory]);

  const handleAddSet = () => {
    const last = sets[sets.length - 1];
    const newSet: DraftSet = {
      id: `s_${Date.now()}`,
      set_number: sets.length + 1,
      weight_kg: last ? last.weight_kg : 50,
      reps: last ? last.reps : 10,
    };
    setSets([...sets, newSet]);
  };

  const handleRemoveSet = (id: string) => {
    if (sets.length <= 1) return;
    const filtered = sets.filter((s) => s.id !== id).map((s, idx) => ({ ...s, set_number: idx + 1 }));
    setSets(filtered);
  };

  const handleUpdateSet = (id: string, field: 'weight_kg' | 'reps', val: number) => {
    setSets(sets.map((s) => (s.id === id ? { ...s, [field]: Math.max(0, val) } : s)));
  };

  const handleSaveWorkout = async () => {
    if (!user) {
      setErrorMsg('You must be logged in to save a workout.');
      return;
    }

    if (sets.length === 0) {
      setErrorMsg('Please add at least one set.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const startedAt = new Date().toISOString();
    const currentEx = exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

    if (!isSupabaseConfigured) {
      // Local preview fallback
      const newSessionId = `sess_${Date.now()}`;
      const newSession: WorkoutSession & { sets: (WorkoutSet & { exercise_name?: string })[] } = {
        id: newSessionId,
        user_id: user.id,
        title: workoutTitle || `${currentEx?.name || 'Workout'} Session`,
        started_at: startedAt,
        notes: null,
        sets: sets.map((s) => ({
          id: `set_${Date.now()}_${s.set_number}`,
          session_id: newSessionId,
          user_id: user.id,
          exercise_id: currentEx?.id || 'ex_bench',
          set_number: s.set_number,
          weight_kg: s.weight_kg,
          reps: s.reps,
          exercise_name: currentEx?.name || 'Exercise',
        })),
      };

      const updated = [newSession, ...localHistory];
      setLocalHistory(updated);
      setHistory(updated);
      setSuccessMsg('Workout session saved successfully!');
      setSaving(false);
      return;
    }

    try {
      // 1. Insert workout_sessions row
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          title: workoutTitle || `${currentEx?.name || 'Workout'} Session`,
          started_at: startedAt,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      if (!sessionData) throw new Error('Failed to create workout session');

      // 2. Insert sets rows
      const setsToInsert = sets.map((s) => ({
        session_id: sessionData.id,
        user_id: user.id,
        exercise_id: currentEx.id,
        set_number: s.set_number,
        weight_kg: s.weight_kg,
        reps: s.reps,
      }));

      const { error: setsInsertError } = await supabase
        .from('sets')
        .insert(setsToInsert);

      if (setsInsertError) throw setsInsertError;

      setSuccessMsg('Workout session recorded in Supabase!');

      // Prepend to history view
      const newHistoryItem: WorkoutSession & { sets: (WorkoutSet & { exercise_name?: string })[] } = {
        ...sessionData,
        sets: setsToInsert.map((s, idx) => ({
          id: `new_${idx}`,
          ...s,
          exercise_name: currentEx.name,
        })),
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error('Save workout error:', err);
      setErrorMsg(err.message || 'Error saving workout to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div>
        <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 600 }}>
          Live Logger
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Record Workout</h1>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#2A1717', border: '1px solid #5C2323', color: '#F5A3A3', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#1A1812', border: '1px solid var(--gold)', color: 'var(--gold-light)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Active Workout Card */}
      <div className="card">
        <div className="form-group">
          <label className="form-label">Session Name</label>
          <input
            type="text"
            className="input"
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            placeholder="e.g. Chest & Triceps"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Exercise</label>
          <select
            className="input"
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.muscle_group})
              </option>
            ))}
          </select>
        </div>

        {/* Sets Input List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 36px', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, padding: '0 4px' }}>
            <span>Set</span>
            <span>Weight (kg)</span>
            <span>Reps</span>
            <span></span>
          </div>

          {sets.map((set) => (
            <div
              key={set.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 1fr 36px',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 700, textAlign: 'center', color: 'var(--gold)' }} className="font-mono">
                {set.set_number}
              </span>

              <input
                type="number"
                step="2.5"
                className="input font-mono"
                style={{ padding: '10px 12px', textAlign: 'center' }}
                value={set.weight_kg}
                onChange={(e) => handleUpdateSet(set.id, 'weight_kg', parseFloat(e.target.value) || 0)}
              />

              <input
                type="number"
                step="1"
                className="input font-mono"
                style={{ padding: '10px 12px', textAlign: 'center' }}
                value={set.reps}
                onChange={(e) => handleUpdateSet(set.id, 'reps', parseInt(e.target.value) || 0)}
              />

              <button
                type="button"
                onClick={() => handleRemoveSet(set.id)}
                disabled={sets.length <= 1}
                title="Remove set"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={handleAddSet}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            + Add Set
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveWorkout}
            className="btn btn-primary btn-sm"
            style={{ flex: 2 }}
          >
            {saving ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </div>

      {/* History Section */}
      <div style={{ marginTop: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Past Sessions</h2>

        {loadingHistory ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading workout history...
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px' }}>
            No logged workouts yet. Complete your first session above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((session) => {
              const formattedDate = new Date(session.started_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const totalVol = (session.sets || []).reduce(
                (sum, s) => sum + (s.weight_kg || 0) * (s.reps || 0),
                0
              );

              return (
                <div key={session.id} className="card card-raised" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{session.title}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formattedDate}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)' }} className="font-mono">
                        {totalVol > 0 ? `${totalVol.toLocaleString()} kg` : '0 kg'}
                      </span>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Volume</span>
                    </div>
                  </div>

                  {session.sets && session.sets.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {session.sets.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '13px',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)' }}>
                            Set {s.set_number} {s.exercise_name ? `· ${s.exercise_name}` : ''}
                          </span>
                          <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text)' }}>
                            {s.weight_kg} kg × {s.reps} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
