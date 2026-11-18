import { useState, useEffect } from 'react';
import type {
  Exercise,
  Routine,
  UserPreferences,
  UserAccount,
  ThemeColor,
} from './types';
import {
  getActiveUser,
  listUserAccounts,
  loginUser,
  logoutUser,
  createUserAccount,
  deleteUserAccount,
  loadActiveRoutine,
  loadUserPreferences,
  loadWorkoutSessions,
  saveActiveRoutine,
  saveUserPreferences,
} from './utils/storage';
import { generateRoutine } from './utils/routineGenerator';
import { Navbar } from './components/Navbar';
import type { TabType } from './components/Navbar';
import { PreferencesView } from './components/PreferencesView';
import { RoutineView } from './components/RoutineView';
import { LibraryView } from './components/LibraryView';
import { HistoryView } from './components/HistoryView';
import { ExerciseModal } from './components/ExerciseModal';
import { RestTimer } from './components/RestTimer';
import { AccountSelectionView } from './components/AccountSelectionView';

export default function App() {
  const [activeUser, setActiveUser] = useState<UserAccount | null>(() => getActiveUser());
  const [accounts, setAccounts] = useState<UserAccount[]>(() => listUserAccounts());
  const [currentTab, setCurrentTab] = useState<TabType>('routine');
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [routine, setRoutine] = useState<Routine | null>(() => loadActiveRoutine());

  const [inspectedExercise, setInspectedExercise] = useState<Exercise | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);

  // Ongoing workout tracking for global header banner
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);

  const refreshUserData = () => {
    const current = getActiveUser();
    setActiveUser(current);
    setAccounts(listUserAccounts());
    setPreferences(loadUserPreferences());
    setRoutine(loadActiveRoutine());
  };

  const handleSelectAccount = (accountId: string) => {
    loginUser(accountId);
    refreshUserData();
  };

  const handleCreateAccount = (name: string, weightKg: number) => {
    createUserAccount(name, weightKg);
    refreshUserData();
  };

  const handleDeleteAccount = (accountId: string) => {
    deleteUserAccount(accountId);
    refreshUserData();
  };

  const handleLogout = () => {
    logoutUser();
    setActiveUser(null);
    setAccounts(listUserAccounts());
  };

  const handleUpdateRoutine = (updated: Routine) => {
    setRoutine(updated);
    saveActiveRoutine(updated);
  };

  const handleSavePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    saveUserPreferences(updated);
  };

  const handleThemeChange = (theme: ThemeColor) => {
    const updated = { ...preferences, themeColor: theme };
    setPreferences(updated);
    saveUserPreferences(updated);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Generate routine calibrating upon user's historical performance & progressive overload
  const handleGenerateRoutine = (updatedPrefs: UserPreferences) => {
    handleSavePreferences(updatedPrefs);
    const sessions = loadWorkoutSessions();
    const newRoutine = generateRoutine(updatedPrefs, sessions);
    setRoutine(newRoutine);
    saveActiveRoutine(newRoutine);
    setCurrentTab('routine');
  };

  const handleRegenerateCurrent = () => {
    const sessions = loadWorkoutSessions();
    const newRoutine = generateRoutine(preferences, sessions);
    setRoutine(newRoutine);
    saveActiveRoutine(newRoutine);
  };

  const handleTriggerRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setIsTimerOpen(true);
  };

  useEffect(() => {
    const theme = preferences.themeColor || 'orange';
    document.documentElement.setAttribute('data-theme', theme);
  }, [preferences.themeColor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedExercise(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If no account is logged in, show the simple account selection screen
  if (!activeUser) {
    return (
      <AccountSelectionView
        accounts={accounts}
        onSelectAccount={handleSelectAccount}
        onCreateAccount={handleCreateAccount}
        onDeleteAccount={handleDeleteAccount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-accent selection:text-white pb-20 md:pb-0">
      {/* Top Navbar with Profile Dropdown & Theme Selector */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        userName={activeUser.name}
        onLogout={handleLogout}
        isWorkoutRunning={isWorkoutRunning}
        workoutSeconds={workoutSeconds}
        currentTheme={preferences.themeColor || 'orange'}
        onThemeChange={handleThemeChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-5">
        {currentTab === 'routine' && (
          <RoutineView
            routine={routine}
            preferences={preferences}
            onOpenPreferences={() => setCurrentTab('preferences')}
            onOpenExerciseModal={setInspectedExercise}
            onUpdateRoutine={handleUpdateRoutine}
            onRegenerate={handleRegenerateCurrent}
            onTriggerRestTimer={handleTriggerRestTimer}
            onGenerateWithAI={handleGenerateRoutine}
            onWorkoutStatusChange={(running, seconds) => {
              setIsWorkoutRunning(running);
              setWorkoutSeconds(seconds);
            }}
          />
        )}

        {currentTab === 'preferences' && (
          <PreferencesView
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
            onGenerateRoutine={handleGenerateRoutine}
          />
        )}

        {currentTab === 'library' && (
          <LibraryView
            onOpenExerciseModal={setInspectedExercise}
            userBodyWeightKg={preferences.bodyWeightKg || 75}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView />
        )}
      </main>

      {/* Exercise Stylized Video & Cueing Modal */}
      <ExerciseModal
        exercise={inspectedExercise}
        userBodyWeightKg={preferences.bodyWeightKg || 75}
        onClose={() => setInspectedExercise(null)}
      />

      {/* Draggable Rest Timer */}
      <RestTimer
        initialSeconds={timerSeconds}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />
    </div>
  );
}
