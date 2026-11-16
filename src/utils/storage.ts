import type {
  AppDatabase,
  Routine,
  UserAccount,
  UserPreferences,
  WorkoutSession,
} from '../types';

const STORAGE_DB_KEY = 'gymapp_multiuser_database_v2';

const DEFAULT_PREFERENCES: UserPreferences = {
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

function createInitialDatabase(): AppDatabase {
  const initialUserId = 'user_' + Date.now();
  const initialUser: UserAccount = {
    id: initialUserId,
    username: 'alessandro',
    name: 'Alessandro',
    createdAt: new Date().toISOString(),
    preferences: DEFAULT_PREFERENCES,
    routine: null,
    sessions: [],
  };

  return {
    activeUserId: initialUserId,
    users: {
      [initialUserId]: initialUser,
    },
  };
}

export function getAppDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_DB_KEY);
    if (raw) {
      const parsed: AppDatabase = JSON.parse(raw);
      if (parsed.users && parsed.activeUserId && parsed.users[parsed.activeUserId]) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error parsing AppDatabase', e);
  }
  const initial = createInitialDatabase();
  saveAppDatabase(initial);
  return initial;
}

export function saveAppDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving AppDatabase', e);
  }
}

export function getActiveUser(): UserAccount {
  const db = getAppDatabase();
  return db.users[db.activeUserId] || Object.values(db.users)[0];
}

export function switchActiveUser(userId: string): UserAccount {
  const db = getAppDatabase();
  if (db.users[userId]) {
    db.activeUserId = userId;
    saveAppDatabase(db);
    return db.users[userId];
  }
  return getActiveUser();
}

export function createUserAccount(
  username: string,
  name: string,
  bodyWeightKg = 75
): UserAccount {
  const db = getAppDatabase();
  const newId = 'user_' + Date.now();
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');

  const newUser: UserAccount = {
    id: newId,
    username: cleanUsername,
    name: name.trim() || cleanUsername,
    createdAt: new Date().toISOString(),
    preferences: {
      ...DEFAULT_PREFERENCES,
      bodyWeightKg,
    },
    routine: null,
    sessions: [],
  };

  db.users[newId] = newUser;
  db.activeUserId = newId;
  saveAppDatabase(db);
  return newUser;
}

export function deleteUserAccount(userId: string): void {
  const db = getAppDatabase();
  if (Object.keys(db.users).length <= 1) {
    alert('Impossibile eliminare l\'unico account presente.');
    return;
  }
  delete db.users[userId];
  if (db.activeUserId === userId) {
    db.activeUserId = Object.keys(db.users)[0];
  }
  saveAppDatabase(db);
}

export function updateActiveUser(updater: (user: UserAccount) => UserAccount): UserAccount {
  const db = getAppDatabase();
  const current = db.users[db.activeUserId];
  if (current) {
    const updated = updater(current);
    db.users[db.activeUserId] = updated;
    saveAppDatabase(db);
    return updated;
  }
  return current;
}

// Per-User Wrappers
export function loadUserPreferences(): UserPreferences {
  const u = getActiveUser();
  return u.preferences || DEFAULT_PREFERENCES;
}

export function saveUserPreferences(prefs: UserPreferences): void {
  updateActiveUser((user) => ({
    ...user,
    preferences: prefs,
  }));
}

export function loadActiveRoutine(): Routine | null {
  const u = getActiveUser();
  return u.routine;
}

export function saveActiveRoutine(routine: Routine): void {
  updateActiveUser((user) => ({
    ...user,
    routine,
  }));
}

export function loadWorkoutSessions(): WorkoutSession[] {
  const u = getActiveUser();
  return u.sessions || [];
}

export function saveWorkoutSession(session: WorkoutSession): void {
  updateActiveUser((user) => ({
    ...user,
    sessions: [session, ...(user.sessions || [])],
  }));
}

export function deleteWorkoutSession(sessionId: string): void {
  updateActiveUser((user) => ({
    ...user,
    sessions: (user.sessions || []).filter((s) => s.id !== sessionId),
  }));
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

// Git Data Exporter / Importer
export function exportGitDatabaseJSON(): string {
  const db = getAppDatabase();
  return JSON.stringify(db, null, 2);
}

export function importGitDatabaseJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.users && parsed.activeUserId) {
      saveAppDatabase(parsed);
      return true;
    }
  } catch (e) {
    console.error('Failed to import database JSON', e);
  }
  return false;
}
