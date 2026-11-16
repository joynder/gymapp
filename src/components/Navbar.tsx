import React from 'react';
import { Calendar, Library, History, Settings2 } from 'lucide-react';

export type TabType = 'routine' | 'preferences' | 'library' | 'history';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand Title */}
          <button
            onClick={() => onTabChange('routine')}
            className="text-base font-bold tracking-tight text-white hover:text-orange-400 transition-colors"
          >
            Palestra
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onTabChange('routine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'routine'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Scheda
            </button>

            <button
              onClick={() => onTabChange('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'library'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Esercizi
            </button>

            <button
              onClick={() => onTabChange('preferences')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'preferences'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Attrezzatura
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'history'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Storico
            </button>
          </nav>

          <div className="hidden md:block text-xs text-zinc-500 font-mono">
            Locale
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Optimized for Phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur border-t border-zinc-800/80 flex items-center justify-around h-16 px-2">
        <button
          onClick={() => onTabChange('routine')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors ${
            currentTab === 'routine' ? 'text-orange-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar size={19} className="mb-0.5" />
          <span>Scheda</span>
        </button>

        <button
          onClick={() => onTabChange('library')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors ${
            currentTab === 'library' ? 'text-orange-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Library size={19} className="mb-0.5" />
          <span>Esercizi</span>
        </button>

        <button
          onClick={() => onTabChange('preferences')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors ${
            currentTab === 'preferences' ? 'text-orange-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings2 size={19} className="mb-0.5" />
          <span>Attrezzi</span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium transition-colors ${
            currentTab === 'history' ? 'text-orange-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History size={19} className="mb-0.5" />
          <span>Storico</span>
        </button>
      </nav>
    </>
  );
};
