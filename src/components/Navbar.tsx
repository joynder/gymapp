import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Library, History, Settings2, LogOut, Activity, Palette, Check } from 'lucide-react';
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const themes: { id: ThemeColor; name: string; hex: string }[] = [
    { id: 'orange', name: 'Arancione', hex: '#f97316' },
    { id: 'green', name: 'Verde', hex: '#22c55e' },
    { id: 'pink', name: 'Rosa', hex: '#ec4899' },
    { id: 'blue', name: 'Blu', hex: '#0ea5e9' },
  ];

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

          {/* Account Profile / Menu dropdown */}
          <div className="relative" ref={menuRef}>
            {userName && (
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-1.5 text-xs transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-accent-subtle text-accent flex items-center justify-center font-bold text-[10px]">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-zinc-200 max-w-[100px] sm:max-w-[140px] truncate">
                  {userName}
                </span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themes.find(t => t.id === currentTheme)?.hex || '#f97316' }} />
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Profile Header */}
                <div className="px-2 py-1.5 border-b border-zinc-800 mb-2">
                  <div className="text-[10px] uppercase font-mono text-zinc-400">Profilo Attivo</div>
                  <div className="text-sm font-bold text-white truncate">{userName}</div>
                </div>

                {/* Theme Color Selector in Profile Menu */}
                <div className="px-2 py-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
                    <Palette size={14} className="text-accent" />
                    <span>Colore del Tema:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          if (onThemeChange) onThemeChange(t.id);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          currentTheme === t.id
                            ? 'bg-zinc-800 border-accent text-white font-bold'
                            : 'bg-zinc-900/80 border-zinc-800/80 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: t.hex }}
                          />
                          <span className="text-[11px]">{t.name}</span>
                        </div>
                        {currentTheme === t.id && <Check size={13} className="text-accent" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout Button */}
                {onLogout && (
                  <div className="pt-2 mt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-bold transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Cambia Profilo / Esci</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
