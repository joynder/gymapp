import React, { useState, useMemo } from 'react';
import type { WorkoutSession } from '../types';
import { EXERCISES_DATABASE } from '../data/exercises';
import {
  loadWorkoutSessions,
  deleteWorkoutSession,
  getExerciseHistory,
  exportGitDatabaseJSON,
} from '../utils/storage';
import {
  Calendar,
  Clock,
  Dumbbell,
  Download,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

interface HistoryViewProps {}

export const HistoryView: React.FC<HistoryViewProps> = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadWorkoutSessions());
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('bench_press_barbell');
  const [activeTab, setActiveTab] = useState<'sessions' | 'progression'>('sessions');

  const exerciseHistory = useMemo(() => {
    return getExerciseHistory(selectedExerciseId);
  }, [selectedExerciseId, sessions]);

  const selectedExercise = useMemo(() => {
    return EXERCISES_DATABASE.find((e) => e.id === selectedExerciseId);
  }, [selectedExerciseId]);

  const toggleSession = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Vuoi eliminare questa sessione dallo storico?')) {
      deleteWorkoutSession(id);
      setSessions(loadWorkoutSessions());
    }
  };

  const getExerciseName = (id: string) => {
    const ex = EXERCISES_DATABASE.find((e) => e.id === id);
    return ex ? ex.name : id;
  };

  const maxWeightEver = useMemo(() => {
    if (exerciseHistory.length === 0) return 100;
    return Math.max(...exerciseHistory.map((h) => h.maxWeightKg), 10);
  }, [exerciseHistory]);

  const handleExportData = () => {
    const jsonStr = exportGitDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymapp_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 text-zinc-100">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Storico Pesi & Progressi
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Monitora l'aumento dei carichi e consulta i dettagli delle sessioni svolte.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Download size={13} className="text-orange-400" /> Esporta JSON per Git
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
            activeTab === 'sessions'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
              : 'bg-zinc-950 text-zinc-400 hover:text-white'
          }`}
        >
          Sessioni Svolte ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('progression')}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
            activeTab === 'progression'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
              : 'bg-zinc-950 text-zinc-400 hover:text-white'
          }`}
        >
          Progressione Carichi per Esercizio
        </button>
      </div>

      {/* TAB 1: SESSIONS LIST */}
      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
              <Calendar size={32} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-sm font-bold text-white">Nessuna sessione registrata</p>
              <p className="text-xs text-zinc-500 mt-1">
                Avvia e completa un allenamento nella scheda per registrare i tuoi carichi.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const dateFormatted = new Date(session.date).toLocaleDateString('it-IT', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={session.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div
                    onClick={() => toggleSession(session.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900 select-none transition-colors"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-orange-400 uppercase font-semibold">
                        {dateFormatted}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {session.dayName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs">
                      <div className="text-right">
                        <div className="text-zinc-400 flex items-center gap-1 justify-end">
                          <Clock size={11} className="text-zinc-500" /> {session.durationMinutes} min
                        </div>
                        <div className="text-accent font-bold flex items-center gap-1 mt-0.5 justify-end">
                          <Dumbbell size={11} /> {session.totalVolumeKg.toLocaleString()} kg
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors"
                        title="Elimina allenamento dallo storico"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="text-zinc-500">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3.5 sm:p-4 bg-zinc-900/60 border-t border-zinc-800 space-y-2.5">
                      <div className="text-[10px] font-mono uppercase text-zinc-400 font-bold">
                        Pesi e Ripetizioni Utilizzati:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {session.exercises.map((ex, i) => {
                          const completed = ex.sets.filter((s) => s.completed);
                          return (
                            <div
                              key={i}
                              className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs"
                            >
                              <div className="font-bold text-white text-[11px]">
                                {getExerciseName(ex.exerciseId)}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1.5 font-mono">
                                {completed.length > 0 ? (
                                  completed.map((s, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]"
                                    >
                                      {s.weightKg}kg × {s.reps}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-zinc-600 text-[10px]">
                                    Nessuna serie segnata
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PROGRESSION TRACKER */}
      {activeTab === 'progression' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-5 shadow-sm">
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-300 font-bold mb-2">
              Seleziona Esercizio
            </label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full sm:w-80 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-orange-500 font-bold"
            >
              {EXERCISES_DATABASE.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.musclePrimary})
                </option>
              ))}
            </select>
          </div>

          {exerciseHistory.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-500 text-xs">
              Nessun dato registrato per <span className="font-bold text-white">{selectedExercise?.name}</span>.
              Completa le serie in questo esercizio per visualizzare i grafici di progressione.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-1.5 border-b border-zinc-800">
                <span>Data</span>
                <span>Carico Massimo Registrato</span>
              </div>

              <div className="space-y-2.5">
                {exerciseHistory.map((item, idx) => {
                  const percent = Math.min(100, Math.round((item.maxWeightKg / maxWeightEver) * 100));
                  const d = new Date(item.date).toLocaleDateString('it-IT');

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 text-[11px]">{d}</span>
                        <span className="text-white font-bold">
                          {item.maxWeightKg} kg{' '}
                          <span className="text-zinc-500 font-normal text-[10px]">
                            ({item.totalReps} reps • Vol: {item.totalVolume} kg)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-black rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
