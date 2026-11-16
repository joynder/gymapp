import React, { useState, useEffect } from 'react';
import type {
  Exercise,
  ExerciseLog,
  Routine,
  RoutineDay,
  SetLog,
  WorkoutSession,
} from '../types';
import { EXERCISES_DATABASE } from '../data/exercises';
import { getLastPerformance, saveWorkoutSession } from '../utils/storage';
import {
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Eye,
  Plus,
  Trash2,
  StopCircle,
} from 'lucide-react';

interface ActiveWorkoutViewProps {
  routine: Routine | null;
  activeDay: RoutineDay | null;
  onOpenExerciseModal: (ex: Exercise) => void;
  onFinishWorkout: () => void;
  onTriggerRestTimer: (seconds: number) => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  routine,
  activeDay,
  onOpenExerciseModal,
  onFinishWorkout,
  onTriggerRestTimer,
}) => {
  // If activeDay is null, let user pick a day from the routine
  const [selectedDay, setSelectedDay] = useState<RoutineDay | null>(activeDay);

  // Training session duration in seconds
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Exercise logs structure: exerciseId -> array of SetLog
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [workoutCompleteSummary, setWorkoutCompleteSummary] = useState<WorkoutSession | null>(
    null
  );

  // Initialize logs when selectedDay is set
  useEffect(() => {
    if (selectedDay) {
      const initialLogs: ExerciseLog[] = selectedDay.exercises.map((planned) => {
        const last = getLastPerformance(planned.exerciseId);
        const defaultWeight = last ? last.weightKg : 0;
        const defaultReps = parseInt(planned.reps.split('-')[0]) || 10;

        const sets: SetLog[] = Array.from({ length: planned.sets }, (_, i) => ({
          setNumber: i + 1,
          weightKg: defaultWeight,
          reps: defaultReps,
          completed: false,
        }));

        return {
          exerciseId: planned.exerciseId,
          sets,
          notes: '',
        };
      });

      setExerciseLogs(initialLogs);
      setElapsedSeconds(0);
      setWorkoutCompleteSummary(null);
    }
  }, [selectedDay]);

  // Duration timer
  useEffect(() => {
    if (!selectedDay || workoutCompleteSummary) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedDay, workoutCompleteSummary]);

  const getExerciseDetails = (id: string): Exercise | undefined => {
    return EXERCISES_DATABASE.find((e) => e.id === id);
  };

  const handleWeightChange = (exIdx: number, setIdx: number, value: string) => {
    const num = parseFloat(value) || 0;
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], weightKg: num };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const handleRepsChange = (exIdx: number, setIdx: number, value: string) => {
    const num = parseInt(value, 10) || 0;
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], reps: num };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const toggleSetCompleted = (exIdx: number, setIdx: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      const isNowCompleted = !sets[setIdx].completed;
      sets[setIdx] = { ...sets[setIdx], completed: isNowCompleted };
      updated[exIdx] = { ...updated[exIdx], sets };

      // If marked completed, trigger rest timer
      if (isNowCompleted) {
        const planned = selectedDay?.exercises[exIdx];
        const restSec = planned ? planned.restSeconds : 90;
        onTriggerRestTimer(restSec);
      }

      return updated;
    });
  };

  const addSetToExercise = (exIdx: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      const prevSet = sets[sets.length - 1];
      const newSet: SetLog = {
        setNumber: sets.length + 1,
        weightKg: prevSet ? prevSet.weightKg : 0,
        reps: prevSet ? prevSet.reps : 10,
        completed: false,
      };
      updated[exIdx] = { ...updated[exIdx], sets: [...sets, newSet] };
      return updated;
    });
  };

  const removeSetFromExercise = (exIdx: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      if (sets.length <= 1) return prev;
      sets.pop();
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  // Real-time calculations
  const totalVolumeKg = exerciseLogs.reduce((total, ex) => {
    return (
      total +
      ex.sets.reduce((exTotal, s) => {
        return s.completed ? exTotal + s.weightKg * s.reps : exTotal;
      }, 0)
    );
  }, 0);

  const completedSetsCount = exerciseLogs.reduce((count, ex) => {
    return count + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = exerciseLogs.reduce((count, ex) => {
    return count + ex.sets.length;
  }, 0);

  const handleFinishAndSave = () => {
    if (!selectedDay) return;

    const newSession: WorkoutSession = {
      id: 'session_' + Date.now(),
      routineId: routine?.id,
      dayId: selectedDay.id,
      dayName: selectedDay.dayName,
      date: new Date().toISOString(),
      durationMinutes: Math.round(elapsedSeconds / 60) || 1,
      exercises: exerciseLogs,
      totalVolumeKg,
      sessionNotes,
    };

    saveWorkoutSession(newSession);
    setWorkoutCompleteSummary(newSession);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // If no day is selected yet, prompt user to pick one
  if (!selectedDay) {
    if (!routine || routine.days.length === 0) {
      return (
        <div className="max-w-xl mx-auto text-center py-12 px-4 bg-slate-900 border border-slate-800 rounded-xl my-8">
          <Dumbbell size={36} className="text-slate-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Nessuna Scheda Selezionata</h2>
          <p className="text-slate-400 text-xs mb-4">
            Crea o visualizza la scheda prima di iniziare una sessione.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Quale allenamento vuoi eseguire oggi?</h2>
          <p className="text-slate-400 text-xs mb-6">
            Seleziona la sessione per registrare i carichi e le ripetizioni serie dopo serie.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {routine.days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day)}
                className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl transition-all group"
              >
                <div className="text-xs uppercase font-mono text-emerald-400 group-hover:text-emerald-300">
                  {day.exercises.length} esercizi
                </div>
                <div className="text-sm font-bold text-white mt-1">{day.dayName}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{day.focus}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Summary screen after completing workout
  if (workoutCompleteSummary) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-slate-900 border border-emerald-800/80 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white">Allenamento Concluso!</h2>
          <p className="text-slate-400 text-sm mt-1">
            {workoutCompleteSummary.dayName} registrato con successo nello storico.
          </p>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-3 my-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Durata</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {workoutCompleteSummary.durationMinutes} min
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                Volume Totale
              </span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {workoutCompleteSummary.totalVolumeKg.toLocaleString()} kg
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                Serie Valide
              </span>
              <span className="text-xl font-bold text-blue-400 mt-1 block">
                {completedSetsCount}
              </span>
            </div>
          </div>

          <button
            onClick={onFinishWorkout}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-900/30"
          >
            Torna alla Scheda
          </button>
        </div>
      </div>
    );
  }

  // Active workout execution view
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Sticky Real-Time Dashboard */}
      <div className="sticky top-16 z-20 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase font-mono text-emerald-400 font-semibold tracking-wider">
                Sessione in Corso
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {selectedDay.dayName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              <span className="font-mono font-bold text-sm text-white">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>

            {/* Total Volume */}
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Dumbbell size={16} className="text-emerald-400" />
              <span className="font-mono font-bold text-sm text-emerald-400">
                {totalVolumeKg} kg
              </span>
            </div>

            {/* Sets progress */}
            <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              {completedSetsCount}/{totalSetsCount} serie
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Set-By-Set Cards */}
      <div className="space-y-5">
        {selectedDay.exercises.map((plannedEx, exIdx) => {
          const details = getExerciseDetails(plannedEx.exerciseId);
          if (!details) return null;
          const exLog = exerciseLogs[exIdx];
          const lastLog = getLastPerformance(plannedEx.exerciseId);

          return (
            <div
              key={plannedEx.exerciseId}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md"
            >
              {/* Exercise Header */}
              <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded bg-slate-800 text-blue-400 font-mono text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {exIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {details.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                      <span>{details.musclePrimary}</span>
                      <span>•</span>
                      <span>Target: {plannedEx.reps} reps</span>
                      <span>•</span>
                      <span>Rec: {plannedEx.restSeconds}s</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {lastLog && (
                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">Ultima volta:</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {lastLog.weightKg} kg × {lastLog.reps} reps
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenExerciseModal(details)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Guarda video ed esecuzione"
                  >
                    <Eye size={15} />
                    <span className="hidden sm:inline">Video</span>
                  </button>
                </div>
              </div>

              {/* Sets Table */}
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800/80 pb-2">
                      <th className="py-2 px-2 w-12 text-center">Serie</th>
                      <th className="py-2 px-2">Precedente</th>
                      <th className="py-2 px-2">Carico (Kg)</th>
                      <th className="py-2 px-2">Ripetizioni</th>
                      <th className="py-2 px-2 w-16 text-center">Fatto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {exLog &&
                      exLog.sets.map((set, setIdx) => {
                        return (
                          <tr
                            key={set.setNumber}
                            className={`transition-colors ${
                              set.completed
                                ? 'bg-emerald-950/20 text-slate-200'
                                : 'hover:bg-slate-800/20 text-slate-300'
                            }`}
                          >
                            <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                              {set.setNumber}
                            </td>

                            <td className="py-2.5 px-2 text-slate-400">
                              {lastLog ? `${lastLog.weightKg} kg` : '-'}
                            </td>

                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={set.weightKg === 0 ? '' : set.weightKg}
                                onChange={(e) =>
                                  handleWeightChange(exIdx, setIdx, e.target.value)
                                }
                                placeholder="0"
                                className="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded text-center text-xs font-bold text-white focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-2">
                              <input
                                type="number"
                                step="1"
                                min="0"
                                value={set.reps === 0 ? '' : set.reps}
                                onChange={(e) =>
                                  handleRepsChange(exIdx, setIdx, e.target.value)
                                }
                                placeholder="0"
                                className="w-20 px-2.5 py-1.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded text-center text-xs font-bold text-white focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => toggleSetCompleted(exIdx, setIdx)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto ${
                                  set.completed
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                                    : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-white hover:border-slate-500'
                                }`}
                                title={
                                  set.completed
                                    ? 'Serie completata'
                                    : 'Segna come completata e avvia timer recupero'
                                }
                              >
                                <Check size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {/* Add/remove set buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/60 mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => addSetToExercise(exIdx)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-sans"
                  >
                    <Plus size={13} /> Aggiungi Serie
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSetFromExercise(exIdx)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 flex items-center gap-1 font-sans"
                  >
                    <Trash2 size={13} /> Rimuovi Ultima Serie
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Notes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Note Sessione (Sensazioni, RPE, Pesi aumentati)
        </label>
        <textarea
          rows={2}
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Es: Ottima spinta su panca, aumentati 2.5 kg sull'ultima serie..."
          className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Finish Workout CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleFinishAndSave}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all"
        >
          <StopCircle size={20} />
          Termina e Salva Allenamento
        </button>
      </div>
    </div>
  );
};
