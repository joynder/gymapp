import { useState, useEffect } from 'react';
import type {
  Exercise,
  Routine,
  UserPreferences,
} from './types';
import {
  loadActiveRoutine,
  loadUserPreferences,
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('routine');
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [routine, setRoutine] = useState<Routine | null>(() => {
    return loadActiveRoutine();
  });

  const [inspectedExercise, setInspectedExercise] = useState<Exercise | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);

  const handleUpdateRoutine = (updated: Routine) => {
    setRoutine(updated);
    saveActiveRoutine(updated);
  };

  const handleSavePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    saveUserPreferences(updated);
  };

  const handleGenerateRoutine = (updatedPrefs: UserPreferences) => {
    handleSavePreferences(updatedPrefs);
    const newRoutine = generateRoutine(updatedPrefs);
    setRoutine(newRoutine);
    saveActiveRoutine(newRoutine);
    setCurrentTab('routine');
  };

  const handleRegenerateCurrent = () => {
    const newRoutine = generateRoutine(preferences);
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

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-orange-600 selection:text-white pb-20 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
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
          />
        )}

        {currentTab === 'preferences' && (
          <PreferencesView
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
            onGenerateRoutine={handleGenerateRoutine}
            onOpenExerciseModal={setInspectedExercise}
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

      {/* Rest Timer */}
      <RestTimer
        initialSeconds={timerSeconds}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />
    </div>
  );
}
