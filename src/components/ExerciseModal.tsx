import React from 'react';
import type { Exercise } from '../types';
import { getLastPerformance } from '../utils/storage';
import { X, AlertTriangle, CheckCircle2, Clock, Award, ExternalLink } from 'lucide-react';

interface ExerciseModalProps {
  exercise: Exercise | null;
  userBodyWeightKg?: number;
  onClose: () => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  exercise,
  userBodyWeightKg = 75,
  onClose,
}) => {
  if (!exercise) return null;

  const lastPerf = getLastPerformance(exercise.id);
  const bw = userBodyWeightKg || 75;
  const isBw = exercise.isBodyweight;

  // Calculate 1RM from last performance using Epley formula
  const estimated1RM = lastPerf && lastPerf.weightKg > 0
    ? Math.round(lastPerf.weightKg * (1 + lastPerf.reps / 30) * 10) / 10
    : null;

  // Strength Level standard values for this user's weight
  const standards = {
    beginner: isBw
      ? `${exercise.strengthStandards.beginner} reps`
      : `${Math.round(bw * exercise.strengthStandards.beginner)} kg`,
    novice: isBw
      ? `${exercise.strengthStandards.novice} reps`
      : `${Math.round(bw * exercise.strengthStandards.novice)} kg`,
    intermediate: isBw
      ? `${exercise.strengthStandards.intermediate} reps`
      : `${Math.round(bw * exercise.strengthStandards.intermediate)} kg`,
    advanced: isBw
      ? `${exercise.strengthStandards.advanced} reps`
      : `${Math.round(bw * exercise.strengthStandards.advanced)} kg`,
    elite: isBw
      ? `${exercise.strengthStandards.elite} reps`
      : `${Math.round(bw * exercise.strengthStandards.elite)} kg`,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-accent">
                {exercise.musclePrimary}
              </span>
              <span className="text-xs text-zinc-400">
                {exercise.category} {isBw ? '• Corpo Libero' : ''}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">{exercise.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Chiudi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm">
          {/* StrengthLevel Illustration */}
          <div className="space-y-1.5">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-white aspect-[4/3] max-h-72 w-full flex items-center justify-center p-3">
              <img
                src={exercise.imageUrl}
                alt={`Esecuzione ${exercise.name} da StrengthLevel.com`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            <div className="flex items-center justify-end text-xs pt-0.5 px-1">
              <a
                href="https://strengthlevel.it/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-accent flex items-center gap-1"
              >
                Fonte immagini e standard: StrengthLevel.it <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Strength Level Standards Table for User's Bodyweight */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-accent" />
                <span className="text-xs uppercase font-bold text-white">
                  Standard di Forza per il tuo peso ({bw} kg)
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {isBw ? 'Ripetizioni 1RM' : '1RM Massimale stimato'}
              </span>
            </div>

            {/* Standards Level Grid */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
              <div className="p-2 bg-black rounded-xl border border-zinc-800">
                <div className="text-zinc-500 uppercase text-[10px]">Principiante</div>
                <div className="text-white font-bold mt-0.5">{standards.beginner}</div>
              </div>
              <div className="p-2 bg-black rounded-xl border border-zinc-800">
                <div className="text-zinc-400 uppercase text-[10px]">Novizio</div>
                <div className="text-white font-bold mt-0.5">{standards.novice}</div>
              </div>
              <div className="p-2 bg-black rounded-xl border border-accent/60 bg-accent/10">
                <div className="text-accent uppercase text-[10px] font-bold">Intermedio</div>
                <div className="text-white font-bold mt-0.5">{standards.intermediate}</div>
              </div>
              <div className="p-2 bg-black rounded-xl border border-zinc-800">
                <div className="text-zinc-400 uppercase text-[10px]">Avanzato</div>
                <div className="text-white font-bold mt-0.5">{standards.advanced}</div>
              </div>
              <div className="p-2 bg-black rounded-xl border border-zinc-800">
                <div className="text-zinc-500 uppercase text-[10px]">Elite</div>
                <div className="text-white font-bold mt-0.5">{standards.elite}</div>
              </div>
            </div>

            {/* User current record status if recorded */}
            {lastPerf && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Il tuo record registrato:</span>
                <span className="text-accent font-bold">
                  {isBw ? `${lastPerf.reps} reps` : `${lastPerf.weightKg} kg × ${lastPerf.reps} reps`}
                  {estimated1RM && !isBw && (
                    <span className="text-zinc-400 font-normal ml-2">
                      (1RM stimato: {estimated1RM} kg)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs uppercase font-mono font-semibold text-zinc-400 tracking-wider mb-1">
              Descrizione Esercizio
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">{exercise.description}</p>
          </div>

          {/* Target and synergist muscles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-400 block font-mono text-[11px]">Muscolo Primario:</span>
              <span className="font-bold text-orange-400">{exercise.musclePrimary}</span>
            </div>
            <div>
              <span className="text-zinc-400 block font-mono text-[11px]">Muscoli Sinergici:</span>
              <span className="text-zinc-300">
                {exercise.musclesSecondary.length > 0
                  ? exercise.musclesSecondary.join(', ')
                  : 'Nessuno (Isolamento selettivo)'}
              </span>
            </div>
          </div>

          {/* Step by step execution */}
          <div>
            <h3 className="text-xs uppercase font-mono font-semibold text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-orange-400" />
              Guida Tecnica di Esecuzione
            </h3>
            <ol className="space-y-2">
              {exercise.executionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-zinc-300 text-xs leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-orange-400 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Common mistakes */}
          {exercise.commonMistakes.length > 0 && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
              <h3 className="text-xs uppercase font-mono font-semibold text-orange-400 tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Errori Comuni da Evitare
              </h3>
              <ul className="space-y-1 list-disc list-inside text-zinc-300 text-xs">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="leading-snug">
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Parameters */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
            <div>
              Serie base: <span className="text-white font-bold">{exercise.defaultSets}</span>
            </div>
            <div>
              Target: <span className="text-white font-bold">{exercise.defaultReps}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-orange-400" /> Recupero: <span className="text-white font-bold">{exercise.restSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg font-bold text-xs transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
