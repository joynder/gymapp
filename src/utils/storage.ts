import type {
  AppDatabase,
  OngoingWorkoutState,
  Routine,
  UserAccount,
  UserPreferences,
  WorkoutSession,
} from '../types';

const STORAGE_DB_KEY = 'gymapp_multiuser_database_v3';
const LEGACY_V2_KEY = 'gymapp_multiuser_database_v2';
const LEGACY_PREF_KEY = 'gymapp_preferences_v1';
const LEGACY_ROUTINE_KEY = 'gymapp_routine_v1';
const LEGACY_SESSIONS_KEY = 'gymapp_sessions_v1';
const ONGOING_WORKOUT_PREFIX = 'gymapp_ongoing_workout_';

export const DEFAULT_PREFERENCES: UserPreferences = {
  bodyWeightKg: 75,
  goal: 'ipertrofia',
  lifestyle: 'moderato',
  experienceLevel: 'Intermedio',
  frequencyDays: 3,
  splitType: 'push_pull_legs',
  workoutDurationMinutes: 60,
  availableEquipment: [
    'barbell',
    'dumbbells',
    'bench',
    'rack',
    'pullup_bar',
    'dip_station',
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
  // Check if we have legacy single-user or v2 data to migrate
  let initialPrefs = DEFAULT_PREFERENCES;
  let initialRoutine: Routine | null = null;
  let initialSessions: WorkoutSession[] = [];
  let initialName = 'Atleta 1';

  try {
    const rawV2 = localStorage.getItem(LEGACY_V2_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && parsed.users) {
        const u = parsed.users[parsed.activeUserId] || Object.values(parsed.users)[0];
        if (u) {
          if (u.name) initialName = u.name;
          if (u.preferences) initialPrefs = { ...DEFAULT_PREFERENCES, ...u.preferences };
          if (u.routine) initialRoutine = u.routine;
          if (u.sessions && Array.isArray(u.sessions)) initialSessions = u.sessions;
        }
      }
    } else {
      const rawPref = localStorage.getItem(LEGACY_PREF_KEY);
      if (rawPref) initialPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(rawPref) };
      const rawRoutine = localStorage.getItem(LEGACY_ROUTINE_KEY);
      if (rawRoutine) initialRoutine = JSON.parse(rawRoutine);
      const rawSess = localStorage.getItem(LEGACY_SESSIONS_KEY);
      if (rawSess) initialSessions = JSON.parse(rawSess);
    }
  } catch (e) {
    console.error('Error in migration check', e);
  }

  const defaultId = 'user_' + Date.now();
  const defaultUser: UserAccount = {
    id: defaultId,
    username: initialName.toLowerCase().replace(/\s+/g, '_'),
    name: initialName,
    createdAt: new Date().toISOString(),
    preferences: initialPrefs,
    routine: initialRoutine,
    sessions: initialSessions,
  };

  return {
    activeUserId: defaultId,
    users: {
      [defaultId]: defaultUser,
    },
  };
}

export function getAppDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_DB_KEY);
    if (raw) {
      const db: AppDatabase = JSON.parse(raw);
      if (db && db.users && typeof db.users === 'object') {
        return db;
      }
    }
  } catch (e) {
    console.error('Error reading AppDatabase', e);
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

// ==========================================
// ACCOUNT MANAGEMENT FUNCTIONS
// ==========================================

export function listUserAccounts(): UserAccount[] {
  const db = getAppDatabase();
  return Object.values(db.users || {});
}

export function getActiveAccountId(): string | null {
  const db = getAppDatabase();
  return db.activeUserId;
}

export function getActiveUser(): UserAccount | null {
  const db = getAppDatabase();
  if (!db.activeUserId || !db.users[db.activeUserId]) {
    return null;
  }
  return db.users[db.activeUserId];
}

export function loginUser(userId: string): UserAccount | null {
  const db = getAppDatabase();
  if (db.users[userId]) {
    db.activeUserId = userId;
    saveAppDatabase(db);
    return db.users[userId];
  }
  return null;
}

export function logoutUser(): void {
  const db = getAppDatabase();
  db.activeUserId = null;
  saveAppDatabase(db);
}

export function createUserAccount(name: string, customWeight = 75): UserAccount {
  const db = getAppDatabase();
  const trimmed = name.trim() || 'Nuovo Atleta';
  const newId = 'user_' + Date.now();

  const newUser: UserAccount = {
    id: newId,
    username: trimmed.toLowerCase().replace(/\s+/g, '_'),
    name: trimmed,
    createdAt: new Date().toISOString(),
    preferences: {
      ...DEFAULT_PREFERENCES,
      bodyWeightKg: customWeight,
    },
    routine: null,
    sessions: [],
  };

  db.users[newId] = newUser;
  db.activeUserId = newId; // Auto-login to the newly created account
  saveAppDatabase(db);
  return newUser;
}

export function deleteUserAccount(userId: string): void {
  const db = getAppDatabase();
  delete db.users[userId];
  if (db.activeUserId === userId) {
    const remaining = Object.keys(db.users);
    db.activeUserId = remaining.length > 0 ? remaining[0] : null;
  }
  saveAppDatabase(db);
  // Clear any ongoing workout for this user
  try {
    localStorage.removeItem(ONGOING_WORKOUT_PREFIX + userId);
  } catch {}
}

export function updateActiveUser(updater: (user: UserAccount) => UserAccount): UserAccount | null {
  const db = getAppDatabase();
  if (!db.activeUserId || !db.users[db.activeUserId]) {
    return null;
  }
  const current = db.users[db.activeUserId];
  const updated = updater(current);
  db.users[db.activeUserId] = updated;
  saveAppDatabase(db);
  return updated;
}

// ==========================================
// ACTIVE USER DATA GETTERS & SETTERS
// ==========================================

export function loadUserPreferences(): UserPreferences {
  const user = getActiveUser();
  return user?.preferences || DEFAULT_PREFERENCES;
}

export function saveUserPreferences(prefs: UserPreferences): void {
  updateActiveUser((user) => ({
    ...user,
    preferences: prefs,
  }));
}

export function loadActiveRoutine(): Routine | null {
  const user = getActiveUser();
  return user?.routine || null;
}

export function saveActiveRoutine(routine: Routine | null): void {
  updateActiveUser((user) => ({
    ...user,
    routine,
  }));
}

export function loadWorkoutSessions(): WorkoutSession[] {
  const user = getActiveUser();
  return user?.sessions || [];
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

// Backup and JSON exporter for history
export function exportGitDatabaseJSON(): string {
  const db = getAppDatabase();
  return JSON.stringify(db, null, 2);
}

export function importGitDatabaseJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.users) {
      saveAppDatabase(parsed);
      return true;
    }
  } catch (e) {
    console.error('Failed to import database', e);
  }
  return false;
}
// ==========================================

export function saveOngoingWorkout(state: OngoingWorkoutState | null): void {
  const activeId = getActiveAccountId();
  if (!activeId) return;
  const key = ONGOING_WORKOUT_PREFIX + activeId;
  try {
    if (!state) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(state));
    }
  } catch (e) {
    console.error('Error saving ongoing workout', e);
  }
}

export function loadOngoingWorkout(): OngoingWorkoutState | null {
  const activeId = getActiveAccountId();
  if (!activeId) return null;
  const key = ONGOING_WORKOUT_PREFIX + activeId;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading ongoing workout', e);
  }
  return null;
}
