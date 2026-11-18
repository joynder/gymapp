import React from 'react';
import { Calendar, Library, History, Settings2, Activity, Users } from 'lucide-react';
import type { ThemeColor } from '../types';

export type TabType = 'routine' | 'preferences' | 'library' | 'history';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  userName?: string;
  onLogout?: () => void;
  isWorkoutRunning?: boolean;
  workoutSeconds?: number;
  currentTheme?: ThemeColor;
  onThemeChange?: (theme: ThemeColor) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  userName,
  onLogout,
  isWorkoutRunning,
  workoutSeconds = 0,
  currentTheme = 'orange',
  onThemeChange,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const THEME_ORDER: ThemeColor[] = ['orange', 'green', 'pink', 'blue'];

  const themeHexMap: Record<ThemeColor, string> = {
    orange: '#f97316',
    green: '#22c55e',
    pink: '#ec4899',
    blue: '#0ea5e9',
  };

  const handleCycleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onThemeChange) return;
    const currentIndex = THEME_ORDER.indexOf(currentTheme);
    const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
    onThemeChange(nextTheme);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('routine')}
              className="text-base font-bold tracking-tight text-white hover:text-accent transition-colors"
            >
              Palestra
            </button>

            {isWorkoutRunning && currentTab !== 'routine' && (
              <button
                onClick={() => onTabChange('routine')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-subtle border border-accent text-accent text-xs font-semibold animate-pulse"
              >
                <Activity size={13} />
                <span>In corso ({formatTime(workoutSeconds)})</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('routine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'routine'
                  ? 'bg-accent text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {isWorkoutRunning && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              )}
              <span>Scheda</span>
            </button>

            <button
              onClick={() => onTabChange('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'library'
                  ? 'bg-accent text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Esercizi
            </button>

            <button
              onClick={() => onTabChange('preferences')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'preferences'
                  ? 'bg-accent text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Attrezzatura
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'history'
                  ? 'bg-accent text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Storico
            </button>
          </nav>

          {/* Account Profile Button with Instant Color Switch Avatar */}
          {userName && (
            <div
              onClick={onLogout}
              title="Clicca per cambiare profilo"
              className="flex items-center bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-1 transition-colors cursor-pointer group"
            >
              {/* Profile Icon / Avatar: Click to switch theme color in rotation */}
              <button
                type="button"
                onClick={handleCycleTheme}
                title={`Tema attuale: ${currentTheme}. Clicca sull'icona per cambiare colore`}
                className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center font-extrabold text-xs shadow-md transition-all active:scale-90 hover:scale-105 cursor-pointer relative flex-shrink-0"
              >
                <span>{userName.charAt(0).toUpperCase()}</span>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black"
                  style={{ backgroundColor: themeHexMap[currentTheme] || '#f97316' }}
                />
              </button>

              {/* Profile Name & Switch Indicator */}
              <div className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                <span className="max-w-[95px] sm:max-w-[140px] truncate">{userName}</span>
                <Users size={13} className="text-zinc-500 group-hover:text-accent transition-colors" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Optimized for Phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur border-t border-zinc-800/80 flex items-center justify-around h-16 px-2">
        <button
          onClick={() => onTabChange('routine')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors relative ${
            currentTab === 'routine' ? 'text-accent font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {isWorkoutRunning && (
            <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-accent animate-ping" />
          )}
          <Calendar size={19} className="mb-0.5" />
          <span>{isWorkoutRunning ? 'Allenamento' : 'Scheda'}</span>
        </button>

        <button
          onClick={() => onTabChange('library')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors ${
            currentTab === 'library' ? 'text-accent font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Library size={19} className="mb-0.5" />
          <span>Esercizi</span>
        </button>

        <button
          onClick={() => onTabChange('preferences')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors ${
            currentTab === 'preferences' ? 'text-accent font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings2 size={19} className="mb-0.5" />
          <span>Attrezzatura</span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors ${
            currentTab === 'history' ? 'text-accent font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History size={19} className="mb-0.5" />
          <span>Storico</span>
        </button>
      </nav>
    </>
  );
};
