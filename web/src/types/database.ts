export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  title: string;
  started_at: string;
  notes?: string | null;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  user_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  exercise?: Exercise;
}

export type CalendarMetricKey = 'workout' | 'protein' | 'calories' | 'water' | 'steps' | 'sleep' | 'notes';

export interface CalendarMetricConfig {
  enabled: boolean;
  label: string;
  color: string;
}

export interface CalendarSettings {
  viewMode: 'month' | 'week';
  weekStart: 'monday' | 'sunday';
  markerStyle: 'dots' | 'bars' | 'cells';
  metrics: Record<CalendarMetricKey, CalendarMetricConfig>;
}

export interface UserSettings {
  user_id: string;
  calendar_settings: CalendarSettings;
  updated_at?: string;
}

export interface Profile {
  id: string;
  display_name: string;
  created_at?: string;
}

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  viewMode: 'month',
  weekStart: 'monday',
  markerStyle: 'dots',
  metrics: {
    workout: { enabled: true, label: 'Workout Done', color: '#D4AF37' },
    protein: { enabled: true, label: 'Protein Target', color: '#F0D27A' },
    calories: { enabled: true, label: 'Calories Target', color: '#C59B27' },
    water: { enabled: true, label: 'Water Hydration', color: '#E5C158' },
    steps: { enabled: true, label: 'Daily Steps', color: '#DFBA50' },
    sleep: { enabled: false, label: 'Sleep Target', color: '#B38F22' },
    notes: { enabled: false, label: 'Daily Notes', color: '#997A1E' },
  },
};
