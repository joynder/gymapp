import React, { useState, useEffect } from 'react';
import type {
  Exercise,
  ExerciseLog,
  PlannedExercise,
  Routine,
  RoutineDay,
  SetLog,
  UserPreferences,
  WorkoutSession,
} from '../types';
import { EXERCISES_DATABASE } from '../data/exercises';
import { getLastPerformance, saveWorkoutSession } from '../utils/storage';
import { AIAssistantWizard } from './AIAssistantWizard';
import {
  Play,
  Eye,
  Plus,
  Trash2,
  Dumbbell,
  Clock,
  X,
  Check,
  CheckCircle2,
  StopCircle,
} from 'lucide-react';

interface RoutineViewProps {
  routine: Routine | null;
  preferences: UserPreferences;
  onOpenPreferences: () => void;
  onOpenExerciseModal: (ex: Exercise) => void;
  onUpdateRoutine: (routine: Routine) => void;
  onRegenerate: () => void;
  onTriggerRestTimer: (seconds: number) => void;
  onGenerateWithAI: (prefs: UserPreferences) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  routine,
  preferences,
  onOpenPreferences,
  onOpenExerciseModal,
  onUpdateRoutine,
  onRegenerate,
  onTriggerRestTimer,
  onGenerateWithAI,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [showAIWizard, setShowAIWizard] = useState(false);

  // Active workout execution state (integrated directly inside Scheda)
  const [isExecutingWorkout, setIsExecutingWorkout] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [workoutFinishedSummary, setWorkoutFinishedSummary] = useState<WorkoutSession | null>(
    null
  );

  // Duration timer when workout is active
  useEffect(() => {
    if (!isExecutingWorkout || workoutFinishedSummary) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isExecutingWorkout, workoutFinishedSummary]);

  // If no routine exists or AI wizard is explicitly open, show the wizard
  if (!routine || routine.days.length === 0 || showAIWizard) {
    return (
      <div className="py-4">
        <AIAssistantWizard
          currentPreferences={preferences}
          onComplete={(updatedPrefs) => {
            onGenerateWithAI(updatedPrefs);
            setShowAIWizard(false);
          }}
          onCancel={routine && routine.days.length > 0 ? () => setShowAIWizard(false) : undefined}
        />
      </div>
    );
  }

  const activeDay: RoutineDay = routine.days[selectedDayIndex] || routine.days[0];

  const getExerciseDetails = (id: string): Exercise | undefined => {
    return EXERCISES_DATABASE.find((e) => e.id === id);
  };

  // Manual weight regulation for a planned exercise in the routine
  const handleRegulateBaseWeight = (dayIdx: number, exIdx: number, newWeight: number) => {
    const updatedDays = [...routine.days];
    const day = updatedDays[dayIdx];
    const exercises = [...day.exercises];
    exercises[exIdx] = {
      ...exercises[exIdx],
      targetWeightKg: Math.max(0, Math.round(newWeight * 2) / 2),
    };
    updatedDays[dayIdx] = { ...day, exercises };
    onUpdateRoutine({ ...routine, days: updatedDays });
  };

  const removeExerciseFromDay = (index: number) => {
    const updatedDays = [...routine.days];
    const currentExercises = [...activeDay.exercises];
    currentExercises.splice(index, 1);
    updatedDays[selectedDayIndex] = { ...activeDay, exercises: currentExercises };
    onUpdateRoutine({ ...routine, days: updatedDays });
  };

  const addExerciseToDay = (ex: Exercise) => {
    const planned: PlannedExercise = {
      exerciseId: ex.id,
      sets: ex.defaultSets,
      reps: ex.defaultReps,
      targetWeightKg: ex.isBodyweight
        ? 0
        : Math.round(routine.bodyWeightKg * (ex.bodyWeightMultiplier?.intermedio || 0.4) * 2) / 2,
      isBodyweight: ex.isBodyweight || false,
      restSeconds: ex.restSeconds,
    };
    const updatedDays = [...routine.days];
    updatedDays[selectedDayIndex] = {
      ...activeDay,
      exercises: [...activeDay.exercises, planned],
    };
    onUpdateRoutine({ ...routine, days: updatedDays });
    setShowAddModal(false);
  };

  // Launch Workout in-place (loads exactly the weights from Scheda)
  const handleStartWorkout = () => {
    const logs: ExerciseLog[] = activeDay.exercises.map((planned) => {
      const details = getExerciseDetails(planned.exerciseId);
      const isBw = planned.isBodyweight || details?.isBodyweight;
      // Prepopola ESATTAMENTE con il peso impostato nella scheda
      const startingWeight = planned.targetWeightKg !== undefined ? planned.targetWeightKg : 0;
      const targetReps = parseInt(planned.reps.split('-')[0]) || 10;

      const sets: SetLog[] = Array.from({ length: planned.sets }, (_, i) => ({
        setNumber: i + 1,
        weightKg: startingWeight,
        isBodyweight: isBw,
        reps: targetReps,
        completed: false,
      }));

      return {
        exerciseId: planned.exerciseId,
        isBodyweight: isBw,
        sets,
        notes: '',
      };
    });

    setExerciseLogs(logs);
    setElapsedSeconds(0);
    setWorkoutFinishedSummary(null);
    setIsExecutingWorkout(true);
  };

  // Handle set completion in active workout
  const handleToggleSet = (exIdx: number, setIdx: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      const isNowDone = !sets[setIdx].completed;
      sets[setIdx] = { ...sets[setIdx], completed: isNowDone };
      updated[exIdx] = { ...updated[exIdx], sets };

      if (isNowDone) {
        const planned = activeDay.exercises[exIdx];
        onTriggerRestTimer(planned ? planned.restSeconds : 90);
      }
      return updated;
    });
  };

  // Modifica peso durante l'allenamento -> calcola la media e aggiorna la scheda in tempo reale
  const handleUpdateWeightInWorkout = (exIdx: number, setIdx: number, val: string) => {
    const num = parseFloat(val) || 0;
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], weightKg: num };
      updated[exIdx] = { ...updated[exIdx], sets };

      // Calcola la media dei carichi delle serie (es. 10 - 15 - 10 - 10 = 11.25 kg)
      const weights = sets.map((s) => s.weightKg);
      if (weights.length > 0) {
        const avg = Math.round((weights.reduce((sum, w) => sum + w, 0) / weights.length) * 10) / 10;
        const currentExercises = [...activeDay.exercises];
        currentExercises[exIdx] = {
          ...currentExercises[exIdx],
          targetWeightKg: avg,
        };
        const updatedDays = [...routine.days];
        updatedDays[selectedDayIndex] = {
          ...activeDay,
          exercises: currentExercises,
        };
        onUpdateRoutine({ ...routine, days: updatedDays });
      }

      return updated;
    });
  };

  const handleUpdateRepsInWorkout = (exIdx: number, setIdx: number, val: string) => {
    const num = parseInt(val, 10) || 0;
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], reps: num };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const handleFinishAndSaveWorkout = () => {
    const totalVolume = exerciseLogs.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((exTotal, s) => {
          if (!s.completed) return exTotal;
          return exTotal + (s.weightKg > 0 ? s.weightKg * s.reps : 0);
        }, 0)
      );
    }, 0);

    // Assicura l'aggiornamento della media dei carichi in scheda per tutti gli esercizi svolti
    const finalExercises = activeDay.exercises.map((planned, exIdx) => {
      const log = exerciseLogs[exIdx];
      if (!log || !log.sets || log.sets.length === 0) return planned;
      const weights = log.sets.map((s) => s.weightKg);
      const avg = Math.round((weights.reduce((sum, w) => sum + w, 0) / weights.length) * 10) / 10;
      return {
        ...planned,
        targetWeightKg: avg,
      };
    });

    const updatedDays = [...routine.days];
    updatedDays[selectedDayIndex] = {
      ...activeDay,
      exercises: finalExercises,
    };
    onUpdateRoutine({ ...routine, days: updatedDays });

    const session: WorkoutSession = {
      id: 'session_' + Date.now(),
      routineId: routine.id,
      dayId: activeDay.id,
      dayName: activeDay.dayName,
      date: new Date().toISOString(),
      durationMinutes: Math.round(elapsedSeconds / 60) || 1,
      exercises: exerciseLogs,
      totalVolumeKg: totalVolume,
    };

    saveWorkoutSession(session);
    setWorkoutFinishedSummary(session);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Workout Summary Overlay if finished
  if (workoutFinishedSummary) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center space-y-5">
        <div className="bg-zinc-950 border border-orange-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-orange-950/80 text-orange-400 border border-orange-500/60 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Sessione Conclusa!</h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            I dati di {workoutFinishedSummary.dayName} sono stati registrati nello storico.
          </p>

          <div className="grid grid-cols-2 gap-3 my-6">
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">Durata</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {workoutFinishedSummary.durationMinutes} min
              </span>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                Volume Sollevato
              </span>
              <span className="text-xl font-bold text-orange-400 mt-1 block">
                {workoutFinishedSummary.totalVolumeKg.toLocaleString()} kg
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsExecutingWorkout(false);
              setWorkoutFinishedSummary(null);
            }}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-orange-950"
          >
            Torna alla Scheda
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE WORKOUT EXECUTION SCREEN (IN-PLACE IN SCHEDA)
  if (isExecutingWorkout) {
    const totalVolume = exerciseLogs.reduce((total, ex) => {
      return (
        total +
        ex.sets.reduce((exTotal, s) => {
          if (!s.completed) return exTotal;
          return exTotal + (s.weightKg > 0 ? s.weightKg * s.reps : 0);
        }, 0)
      );
    }, 0);

    const completedCount = exerciseLogs.reduce(
      (count, ex) => count + ex.sets.filter((s) => s.completed).length,
      0
    );
    const totalCount = exerciseLogs.reduce((count, ex) => count + ex.sets.length, 0);

    return (
      <div className="max-w-4xl mx-auto space-y-4 pb-28 text-zinc-100">
        {/* Sticky Real-Time Top HUD */}
        <div className="sticky top-15 z-20 bg-zinc-950/95 backdrop-blur border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[10px] uppercase font-mono text-orange-400 font-bold tracking-wider">
                  Allenamento in Corso
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {activeDay.dayName}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-1.5 font-mono text-xs text-white">
                <Clock size={14} className="text-orange-400" />
                <span className="font-bold">{formatTimer(elapsedSeconds)}</span>
              </div>
              <div className="bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-1.5 font-mono text-xs text-orange-400 font-bold">
                <Dumbbell size={14} />
                <span>{totalVolume} kg</span>
              </div>
              <div className="bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-400">
                {completedCount}/{totalCount}
              </div>
            </div>
          </div>
        </div>

        {/* Exercises set logging */}
        <div className="space-y-4">
          {activeDay.exercises.map((planned, exIdx) => {
            const details = getExerciseDetails(planned.exerciseId);
            if (!details) return null;
            const log = exerciseLogs[exIdx];
            const isBw = planned.isBodyweight || details.isBodyweight;
            const lastLog = getLastPerformance(planned.exerciseId);

            return (
              <div
                key={planned.exerciseId}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Header */}
                <div className="p-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-zinc-800 text-orange-400 font-mono text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {exIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white truncate">{details.name}</h3>
                        {isBw && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-orange-400 border border-zinc-700">
                            Corpo Libero
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                        Target: {planned.reps} reps • Rec: {planned.restSeconds}s
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenExerciseModal(details)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-orange-400 rounded-lg text-xs font-mono flex items-center gap-1"
                  >
                    <Eye size={13} />
                    <span className="text-[10px]">Video</span>
                  </button>
                </div>

                {/* Sets Table */}
                <div className="p-3 overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="text-zinc-500 uppercase text-[9px] tracking-wider border-b border-zinc-800 pb-1.5">
                        <th className="py-1 px-1 text-center w-10">Set</th>
                        <th className="py-1 px-1">Prec</th>
                        <th className="py-1 px-1">{isBw ? 'Zavorra (+kg)' : 'Carico (Kg)'}</th>
                        <th className="py-1 px-1">Reps</th>
                        <th className="py-1 px-1 text-center w-12">Fatto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {log?.sets.map((set, setIdx) => (
                        <tr
                          key={set.setNumber}
                          className={set.completed ? 'bg-orange-950/20' : ''}
                        >
                          <td className="py-2 px-1 text-center font-bold text-zinc-400">
                            {set.setNumber}
                          </td>
                          <td className="py-2 px-1 text-zinc-500 text-[11px]">
                            {isBw
                              ? (lastLog && lastLog.weightKg > 0 ? `+${lastLog.weightKg}kg` : 'C.L.')
                              : (lastLog ? `${lastLog.weightKg}kg` : '-')}
                          </td>
                          <td className="py-2 px-1">
                            {isBw ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={set.weightKg === 0 ? '' : set.weightKg}
                                  onChange={(e) =>
                                    handleUpdateWeightInWorkout(exIdx, setIdx, e.target.value)
                                  }
                                  placeholder="0 (Libero)"
                                  className="w-24 px-2 py-1.5 bg-black border border-zinc-800 focus:border-orange-500 rounded text-center text-xs font-bold text-white placeholder-zinc-600"
                                />
                              </div>
                            ) : (
                              <input
                                type="number"
                                step="0.5"
                                value={set.weightKg === 0 ? '' : set.weightKg}
                                onChange={(e) =>
                                  handleUpdateWeightInWorkout(exIdx, setIdx, e.target.value)
                                }
                                placeholder="0"
                                className="w-16 px-2 py-1.5 bg-black border border-zinc-800 focus:border-orange-500 rounded text-center text-xs font-bold text-white"
                              />
                            )}
                          </td>
                          <td className="py-2 px-1">
                            <input
                              type="number"
                              step="1"
                              value={set.reps === 0 ? '' : set.reps}
                              onChange={(e) =>
                                handleUpdateRepsInWorkout(exIdx, setIdx, e.target.value)
                              }
                              placeholder="0"
                              className="w-16 px-2 py-1.5 bg-black border border-zinc-800 focus:border-orange-500 rounded text-center text-xs font-bold text-white"
                            />
                          </td>
                          <td className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSet(exIdx, setIdx)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                set.completed
                                  ? 'bg-orange-600 text-white shadow-md shadow-orange-950'
                                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white'
                              }`}
                            >
                              <Check size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Complete Workout Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleFinishAndSaveWorkout}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-950 flex items-center justify-center gap-2"
          >
            <StopCircle size={18} />
            Termina e Salva Allenamento nello Storico
          </button>
        </div>
      </div>
    );
  }

  // STANDARD VIEW OF SCHEDA
  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-24 text-zinc-100">
      {/* Days Tabs (Scrollable on mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {routine.days.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
              selectedDayIndex === idx
                ? 'bg-orange-600 text-white shadow'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {day.dayName}
          </button>
        ))}
      </div>

      {/* Day Overview Banner & Direct Launch */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">{activeDay.dayName}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeDay.focus} · {activeDay.exercises.length} esercizi
          </p>
        </div>

        <button
          onClick={handleStartWorkout}
          className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-sm rounded-xl transition-all shadow-md text-center"
        >
          Avvia Allenamento
        </button>
      </div>

      {/* Quick Action Info Line */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
        <span>Tocca un esercizio per vedere la guida</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onRegenerate}
            className="hover:text-white transition-colors"
          >
            Rigenera
          </button>
          <span className="text-zinc-700">·</span>
          <button
            onClick={() => setShowAIWizard(true)}
            className="hover:text-white transition-colors"
          >
            Nuova Scheda
          </button>
          <span className="text-zinc-700">·</span>
          <button
            onClick={onOpenPreferences}
            className="hover:text-white transition-colors"
          >
            Attrezzi
          </button>
        </div>
      </div>

      {/* Exercises List for Active Day */}
      <div className="space-y-2.5">
        {activeDay.exercises.map((plannedEx, idx) => {
          const details = getExerciseDetails(plannedEx.exerciseId);
          if (!details) return null;
          const isBw = plannedEx.isBodyweight || details.isBodyweight;
          const lastLog = getLastPerformance(plannedEx.exerciseId);

          return (
            <div
              key={`${plannedEx.exerciseId}-${idx}`}
              className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 transition-all flex items-center justify-between gap-3"
            >
              {/* Exercise information - Tapping opens details */}
              <div
                onClick={() => onOpenExerciseModal(details)}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-500 uppercase tracking-wider">
                  <span>{details.musclePrimary}</span>
                  {isBw && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-400 font-normal normal-case">Corpo Libero</span>
                    </>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                  {details.name}
                </h3>

                <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{plannedEx.sets} serie × {plannedEx.reps} reps</span>
                  <span className="text-zinc-700">·</span>
                  <span>Recupero {plannedEx.restSeconds}s</span>
                  {lastLog && (
                    <>
                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-500">
                        Ultimo: {isBw ? (lastLog.weightKg > 0 ? `+${lastLog.weightKg}kg` : 'C.L.') : `${lastLog.weightKg} kg`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Base weight input + remove */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isBw ? (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Zavorra</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={plannedEx.targetWeightKg || ''}
                      onChange={(e) =>
                        handleRegulateBaseWeight(
                          selectedDayIndex,
                          idx,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="+0"
                      className="w-14 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Carico base</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={plannedEx.targetWeightKg}
                        onChange={(e) =>
                          handleRegulateBaseWeight(
                            selectedDayIndex,
                            idx,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-14 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-center text-xs font-bold text-orange-400 focus:outline-none focus:border-orange-500"
                      />
                      <span className="text-xs text-zinc-500">kg</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => removeExerciseFromDay(idx)}
                  className="p-2 text-zinc-600 hover:text-red-400 transition-colors ml-1"
                  title="Rimuovi esercizio"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add exercise button */}
      <div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 border border-dashed border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50 rounded-2xl text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-all text-center"
        >
          + Aggiungi Esercizio
        </button>
      </div>

      {/* Bottom Floating/Fixed Start Workout Bar */}
      <div className="pt-2">
        <button
          onClick={handleStartWorkout}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-950 flex items-center justify-center gap-2 transition-all"
        >
          <Play size={18} /> Inizia Allenamento di Oggi
        </button>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden text-zinc-100 shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
              <h3 className="font-bold text-sm text-white">Aggiungi Esercizio</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 border-b border-zinc-800 bg-zinc-950">
              <input
                type="text"
                placeholder="Cerca per nome o muscolo..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {EXERCISES_DATABASE.filter(
                (ex) =>
                  ex.name.toLowerCase().includes(addSearch.toLowerCase()) ||
                  ex.musclePrimary.toLowerCase().includes(addSearch.toLowerCase())
              ).map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-2 hover:border-zinc-700"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{ex.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {ex.musclePrimary} • {ex.category} {ex.isBodyweight ? '• Corpo Libero' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => addExerciseToDay(ex)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Aggiungi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
