import type {
  Routine,
  UserPreferences,
  WorkoutSession,
} from '../types';

const PREFERENCES_KEY = 'gymapp_preferences_v1';
const ROUTINE_KEY = 'gymapp_routine_v1';
const SESSIONS_KEY = 'gymapp_sessions_v1';
const LEGACY_DB_KEY = 'gymapp_multiuser_database_v2';

export const DEFAULT_PREFERENCES: UserPreferences = {
  bodyWeightKg: 75,
  goal: 'ipertrofia',
  lifestyle: 'moderato',
  experienceLevel: 'Intermedio',
  frequencyDays: 3,
  splitType: 'push_pull_legs',
  availableEquipment: [
    'barbell',
    'dumbbells',
    'bench',
    'rack',
    'pullup_bar',
    'cables',
    'lat_machine',
    'low_row',
    'leg_press',
    'leg_extension',
    'leg_curl',
    'bodyweight',
  ],
  preferredExerciseIds: [
    'bench_press_barbell',
    'lat_pulldown',
    'barbell_back_squat',
    'lateral_raises_dumbbells',
    'barbell_curl',
    'triceps_pushdown_cables',
  ],
};

// Automatic one-time migration from legacy multi-account storage
function checkLegacyMigration(): void {
  try {
    if (!localStorage.getItem(PREFERENCES_KEY) && !localStorage.getItem(ROUTINE_KEY)) {
      const raw = localStorage.getItem(LEGACY_DB_KEY);
      if (raw) {
        const legacy = JSON.parse(raw);
        if (legacy && legacy.users) {
          const user = legacy.users[legacy.activeUserId] || Object.values(legacy.users)[0];
          if (user) {
            if (user.preferences) {
              localStorage.setItem(PREFERENCES_KEY, JSON.stringify(user.preferences));
            }
            if (user.routine) {
              localStorage.setItem(ROUTINE_KEY, JSON.stringify(user.routine));
            }
            if (user.sessions && Array.isArray(user.sessions)) {
              localStorage.setItem(SESSIONS_KEY, JSON.stringify(user.sessions));
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Migration error', e);
  }
}

// Run migration check once on load
checkLegacyMigration();

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving preferences', e);
  }
}

export function loadActiveRoutine(): Routine | null {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading routine', e);
  }
  return null;
}

export function saveActiveRoutine(routine: Routine | null): void {
  try {
    if (!routine) {
      localStorage.removeItem(ROUTINE_KEY);
    } else {
      localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
    }
  } catch (e) {
    console.error('Error saving routine', e);
  }
}

export function loadWorkoutSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading sessions', e);
  }
  return [];
}

export function saveWorkoutSession(session: WorkoutSession): void {
  try {
    const sessions = loadWorkoutSessions();
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...sessions]));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function deleteWorkoutSession(sessionId: string): void {
  try {
    const sessions = loadWorkoutSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error deleting session', e);
  }
}

export function getLastPerformance(
  exerciseId: string
): { weightKg: number; reps: number; date: string } | null {
  const sessions = loadWorkoutSessions();
  for (const session of sessions) {
    const exLog = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (exLog && exLog.sets && exLog.sets.length > 0) {
      const completed = exLog.sets.filter((s) => s.completed && s.weightKg > 0);
      if (completed.length > 0) {
        const best = completed.reduce((prev, curr) =>
          curr.weightKg > prev.weightKg ? curr : prev
        );
        return {
          weightKg: best.weightKg,
          reps: best.reps,
          date: session.date,
        };
      }
    }
  }
  return null;
}

export function getExerciseHistory(exerciseId: string): {
  date: string;
  maxWeightKg: number;
  totalVolume: number;
  totalReps: number;
}[] {
  const sessions = loadWorkoutSessions();
  const history: {
    date: string;
    maxWeightKg: number;
    totalVolume: number;
    totalReps: number;
  }[] = [];

  for (const session of sessions) {
    const exLog = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (exLog && exLog.sets && exLog.sets.length > 0) {
      const valid = exLog.sets.filter((s) => s.completed);
      if (valid.length > 0) {
        let maxW = 0;
        let vol = 0;
        let reps = 0;
        for (const s of valid) {
          if (s.weightKg > maxW) maxW = s.weightKg;
          vol += s.weightKg * s.reps;
          reps += s.reps;
        }
        history.push({
          date: session.date,
          maxWeightKg: maxW,
          totalVolume: vol,
          totalReps: reps,
        });
      }
    }
  }
  return history;
}

// Backup JSON exporter / importer
export function exportGitDatabaseJSON(): string {
  const backup = {
    preferences: loadUserPreferences(),
    routine: loadActiveRoutine(),
    sessions: loadWorkoutSessions(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importGitDatabaseJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed) {
      if (parsed.preferences) saveUserPreferences(parsed.preferences);
      if (parsed.routine) saveActiveRoutine(parsed.routine);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(parsed.sessions));
      }
      return true;
    }
  } catch (e) {
    console.error('Failed to import database JSON', e);
  }
  return false;
}
