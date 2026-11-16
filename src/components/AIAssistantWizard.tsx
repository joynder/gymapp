import React, { useState } from 'react';
import { EQUIPMENT_LIST } from '../data/equipment';
import type {
  EquipmentId,
  GoalType,
  LifestyleType,
  SplitType,
  UserPreferences,
} from '../types';
import {
  ArrowRight,
  ArrowLeft,
  Check,
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
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(currentPreferences.bodyWeightKg || 75);
  const [lifestyle, setLifestyle] = useState<LifestyleType>(currentPreferences.lifestyle || 'moderato');
  const [goal, setGoal] = useState<GoalType>(currentPreferences.goal || 'ipertrofia');
  const [frequencyDays, setFrequencyDays] = useState<number>(currentPreferences.frequencyDays || 3);
  const [splitType, setSplitType] = useState<SplitType>(currentPreferences.splitType || 'push_pull_legs');
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
      splitType,
      experienceLevel,
      availableEquipment,
    };
    onComplete(updated);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl max-w-2xl mx-auto text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Configura la tua Scheda</h2>
          <p className="text-xs text-zinc-400">
            Passo {step} di 5: Imposta il tuo programma
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            Annulla
          </button>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
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
            <label className="block text-xs uppercase text-orange-400 font-bold flex items-center justify-between">
              <span>Peso Corporeo:</span>
              <span className="text-xl font-bold text-white">{bodyWeightKg} kg</span>
            </label>
            <input
              type="range"
              min="40"
              max="150"
              step="0.5"
              value={bodyWeightKg}
              onChange={(e) => setBodyWeightKg(parseFloat(e.target.value) || 75)}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>40 kg</span>
              <span>80 kg</span>
              <span>120 kg</span>
              <span>150 kg</span>
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
                      ? 'bg-orange-600 border-orange-500 text-white font-bold shadow-md shadow-orange-950'
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
                    ? 'bg-orange-950/40 border-orange-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-white">
                  <span>{item.label}</span>
                  {lifestyle === item.id && <Check size={16} className="text-orange-400" />}
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
              Quale obiettivo primario vuoi raggiungere? Verranno impostate serie, ripetizioni e tempi di recupero adatti.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: 'ipertrofia',
                title: 'Ipertrofia (Crescita Muscolare)',
                reps: '8-12 ripetizioni • 75-90s recupero',
              },
              {
                id: 'forza',
                title: 'Forza Massimale',
                reps: '4-6 ripetizioni • 150-180s recupero',
              },
              {
                id: 'dimagrimento',
                title: 'Dimagrimento & Definizione',
                reps: '12-15 ripetizioni • 45-60s recupero',
              },
              {
                id: 'mantenimento',
                title: 'Mantenimento & Tono',
                reps: '8-10 ripetizioni • Volume moderato',
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
                    ? 'bg-orange-950/40 border-orange-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-xs text-white flex items-center justify-between">
                  {g.title}
                  {goal === g.id && <Check size={15} className="text-orange-400" />}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{g.reps}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: FREQUENZA E SPLIT */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Quanti giorni a settimana vuoi allenarti?
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-300 font-bold mb-2">
              Giorni di allenamento a settimana
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFrequencyDays(d)}
                  className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${
                    frequencyDays === d
                      ? 'bg-orange-600 border-orange-500 text-white shadow'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {d} gg
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-zinc-300 font-bold mb-2">
              Struttura della Scheda
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'push_pull_legs',
                  name: 'Push / Pull / Legs (PPL)',
                  desc: 'Giorno Spinta (Petto/Spalle/Tri), Tirata (Dorso/Bi), Gambe (Quad/Fem/Core).',
                },
                {
                  id: 'upper_lower',
                  name: 'Upper / Lower (4 Giorni)',
                  desc: 'Alternanza ottimale tra parte superiore e parte inferiore del corpo.',
                },
                {
                  id: 'full_body',
                  name: 'Full Body (2 o 3 Giorni)',
                  desc: 'Tutto il corpo stimolato in ogni seduta.',
                },
                {
                  id: 'monofrequenza',
                  name: 'Monofrequenza 4 Split',
                  desc: 'Petto/Tri, Dorso/Bi, Spalle/Addome, Gambe.',
                },
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSplitType(s.id as SplitType)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    splitType === s.id
                      ? 'bg-orange-950/40 border-orange-500 text-white font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="text-xs text-white font-bold">{s.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{s.desc}</div>
                  </div>
                  {splitType === s.id && <Check size={16} className="text-orange-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: MACCHINARI DISPONIBILI */}
      {step === 5 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Ultimo passo: seleziona gli attrezzi che hai a disposizione. Verranno scelti solo esercizi compatibili con la tua attrezzatura.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-zinc-800">
            <span className="text-xs text-zinc-400 mr-1">Preseleziona:</span>
            <button
              type="button"
              onClick={() => applyPreset('all')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200"
            >
              Palestra Completa
            </button>
            <button
              type="button"
              onClick={() => applyPreset('home')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200"
            >
              Casa con Manubri
            </button>
            <button
              type="button"
              onClick={() => applyPreset('none')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200"
            >
              Solo Corpo Libero
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {EQUIPMENT_LIST.map((eq) => {
              const checked = availableEquipment.includes(eq.id);
              return (
                <div
                  key={eq.id}
                  onClick={() => toggleEquipment(eq.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs transition-all ${
                    checked
                      ? 'bg-orange-950/30 border-orange-500/70 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {checked ? (
                    <CheckSquare size={16} className="text-orange-500 flex-shrink-0" />
                  ) : (
                    <Square size={16} className="text-zinc-600 flex-shrink-0" />
                  )}
                  <span className="font-bold text-white text-[11px] truncate">{eq.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800 mt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} /> Indietro
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-lg shadow-orange-950 transition-colors"
          >
            Continua <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <span>Genera Scheda di Allenamento</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
