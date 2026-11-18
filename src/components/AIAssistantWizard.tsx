import React, { useState } from 'react';
import { EQUIPMENT_LIST } from '../data/equipment';
import type {
  EquipmentId,
  GoalType,
  LifestyleType,
  UserPreferences,
} from '../types';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';

interface AIAssistantWizardProps {
  currentPreferences: UserPreferences;
  onComplete: (prefs: UserPreferences) => void;
  onCancel?: () => void;
}

export const AIAssistantWizard: React.FC<AIAssistantWizardProps> = ({
  currentPreferences,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(() => {
    const raw = currentPreferences.bodyWeightKg || 75;
    return Math.round(raw / 5) * 5;
  });
  const [lifestyle, setLifestyle] = useState<LifestyleType>(currentPreferences.lifestyle || 'moderato');
  const [goal, setGoal] = useState<GoalType>(currentPreferences.goal || 'ipertrofia');
  const [frequencyDays, setFrequencyDays] = useState<number>(currentPreferences.frequencyDays || 3);
  const [workoutDurationMinutes, setWorkoutDurationMinutes] = useState<number>(
    currentPreferences.workoutDurationMinutes || 60
  );
  const splitType = currentPreferences.splitType || 'push_pull_legs';
  const [experienceLevel, setExperienceLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzato'>(
    currentPreferences.experienceLevel || 'Intermedio'
  );
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentId[]>(
    currentPreferences.availableEquipment || ['barbell', 'dumbbells', 'bench', 'rack', 'bodyweight']
  );

  const toggleEquipment = (id: EquipmentId) => {
    setAvailableEquipment((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyPreset = (type: 'all' | 'home' | 'none') => {
    if (type === 'all') setAvailableEquipment(EQUIPMENT_LIST.map((e) => e.id));
    if (type === 'home')
      setAvailableEquipment(['barbell', 'dumbbells', 'bench', 'rack', 'pullup_bar', 'bodyweight']);
    if (type === 'none') setAvailableEquipment(['bodyweight']);
  };

  const handleFinish = () => {
    const updated: UserPreferences = {
      ...currentPreferences,
      bodyWeightKg,
      lifestyle,
      goal,
      frequencyDays,
      workoutDurationMinutes,
      splitType,
      experienceLevel,
      availableEquipment,
    };
    onComplete(updated);
  };

  const getDurationDesc = (mins: number) => {
    if (mins <= 35) return 'Sessione rapida ed efficiente (~3-4 esercizi principali)';
    if (mins <= 50) return 'Sessione compatta (~4-5 esercizi composti & complementari)';
    if (mins <= 65) return 'Sessione standard equilibrata (~6 esercizi completi)';
    if (mins <= 80) return 'Sessione ad alto volume (~7 esercizi con richiami)';
    return 'Sessione estesa avanzata (~8-9 esercizi completi + braccia/addome)';
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-w-2xl mx-auto text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Configura la tua Scheda</h2>
          <p className="text-xs text-zinc-400">
            Passo {step} di 5: Imposta il tuo programma su misura
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg transition-colors"
          >
            Annulla
          </button>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* STEP 1: PESO CORPOREO & LIVELLO */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Benvenuto! Per iniziare a preparare la tua scheda e stimare i carichi di partenza corretti, indica il tuo peso corporeo attuale:
            </p>
          </div>

          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
            <label className="block text-xs uppercase text-accent font-bold flex items-center justify-between">
              <span>Peso Corporeo:</span>
              <span className="text-xl font-bold text-white">{bodyWeightKg} kg</span>
            </label>
            <input
              type="range"
              min="40"
              max="160"
              step="5"
              value={bodyWeightKg}
              onChange={(e) => setBodyWeightKg(parseInt(e.target.value, 10) || 75)}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-mono">
              <span>40 kg</span>
              <span>80 kg</span>
              <span>120 kg</span>
              <span>160 kg</span>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-300 font-bold mb-2">
              Qual è il tuo livello di allenamento?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Principiante', 'Intermedio', 'Avanzato'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperienceLevel(lvl)}
                  className={`py-3 rounded-xl border text-center transition-all ${
                    experienceLevel === lvl
                      ? 'bg-accent border-accent text-white font-bold shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: STILE DI VITA (LIFESTYLE) */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Il recupero tra le sessioni dipende dal livello di attività quotidiana fuori dalla palestra. Che stile di vita hai?
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'sedentario',
                label: 'Sedentario (Lavoro d\'ufficio / Poco movimento)',
                desc: 'Recuperi più ampi sui movimenti pesanti e volume sostenibile.',
              },
              {
                id: 'moderato',
                label: 'Moderatamente Attivo (Camminate, lavoro dinamico)',
                desc: 'Equilibrio ideale tra carico allenante e recupero.',
              },
              {
                id: 'attivo',
                label: 'Molto Attivo (Lavoro fisico pesante o altri sport)',
                desc: 'Volume calibrato per evitare sovraccarico articolare.',
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setLifestyle(item.id as LifestyleType)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  lifestyle === item.id
                    ? 'bg-accent-subtle border-accent text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-white">
                  <span>{item.label}</span>
                  {lifestyle === item.id && <Check size={16} className="text-accent" />}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: OBIETTIVO PRIMARIO */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Quale obiettivo primario vuoi raggiungere? Verranno calibrate serie, ripetizioni e intensità.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: 'ipertrofia',
                title: 'Ipertrofia (Massa Muscolare)',
                reps: '8-12 ripetizioni • 75-90s recupero',
              },
              {
                id: 'forza',
                title: 'Forza Massimale',
                reps: '4-6 ripetizioni • 120-150s recupero',
              },
              {
                id: 'dimagrimento',
                title: 'Definizione & Tono',
                reps: '10-15 ripetizioni • 45-60s recupero',
              },
              {
                id: 'mantenimento',
                title: 'Mantenimento Salute',
                reps: '8-10 ripetizioni • Volume sostenibile',
              },
              {
                id: 'ricomposizione',
                title: 'Ricomposizione Corporea',
                reps: '6-10 ripetizioni • Stimolo denso',
              },
            ].map((g) => (
              <div
                key={g.id}
                onClick={() => setGoal(g.id as GoalType)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  goal === g.id
                    ? 'bg-accent-subtle border-accent text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-xs text-white flex items-center justify-between">
                  {g.title}
                  {goal === g.id && <Check size={15} className="text-accent" />}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{g.reps}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: FREQUENZA GIORNI & DURATA ALLENAMENTO */}
      {step === 4 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Imposta quanti giorni vuoi allenarti e quanto tempo hai a disposizione per ogni sessione:
            </p>
          </div>

          {/* GIORNI DI ALLENAMENTO */}
          <div>
            <label className="block text-xs uppercase text-accent font-bold mb-2 flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Giorni di allenamento a settimana:</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFrequencyDays(d)}
                  className={`py-3 rounded-xl border font-bold text-xs transition-all ${
                    frequencyDays === d
                      ? 'bg-accent border-accent text-white shadow'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-extrabold">{d}</div>
                  <div className="text-[10px] font-normal opacity-80">giorni</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Verrà creata una scheda esattamente con {frequencyDays} giorni dedicati.
            </p>
          </div>

          {/* DURATA ALLENAMENTO SLIDER */}
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-3">
            <label className="block text-xs uppercase text-accent font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>Tempo a disposizione per sessione:</span>
              </span>
              <span className="text-lg font-bold text-white">{workoutDurationMinutes} minuti</span>
            </label>
            <input
              type="range"
              min="30"
              max="90"
              step="15"
              value={workoutDurationMinutes}
              onChange={(e) => setWorkoutDurationMinutes(parseInt(e.target.value) || 60)}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-medium">
              <span>30 min</span>
              <span>45 min</span>
              <span>60 min</span>
              <span>75 min</span>
              <span>90 min</span>
            </div>
            <div className="text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
              ⚡ {getDurationDesc(workoutDurationMinutes)}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: ATTREZZATURA DISPONIBILE */}
      {step === 5 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase text-zinc-300 font-bold">
              Attrezzatura a tua disposizione:
            </label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className="px-2 py-0.5 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                Tutto
              </button>
              <button
                type="button"
                onClick={() => applyPreset('home')}
                className="px-2 py-0.5 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                Home Gym
              </button>
              <button
                type="button"
                onClick={() => applyPreset('none')}
                className="px-2 py-0.5 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                Corpo Libero
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {EQUIPMENT_LIST.map((item) => {
              const active = availableEquipment.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleEquipment(item.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    active
                      ? 'bg-accent-subtle border-accent text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-medium truncate">{item.name}</span>
                  {active ? (
                    <CheckSquare size={16} className="text-accent flex-shrink-0 ml-1" />
                  ) : (
                    <Square size={16} className="text-zinc-600 flex-shrink-0 ml-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-5 mt-4 border-t border-zinc-800">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors"
          >
            <ChevronLeft size={16} />
            Indietro
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 px-5 py-2.5 bg-accent hover:opacity-90 rounded-xl text-xs font-bold text-white transition-all shadow-lg"
          >
            Avanti
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-accent hover:opacity-90 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-accent/20"
          >
            <Sparkles size={16} />
            Crea la mia Scheda
          </button>
        )}
      </div>
    </div>
  );
};
