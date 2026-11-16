import React, { useState, useMemo } from 'react';
import { EQUIPMENT_LIST } from '../data/equipment';
import { EXERCISES_DATABASE } from '../data/exercises';
import type {
  EquipmentId,
  Exercise,
  GoalType,
  LifestyleType,
  SplitType,
  UserPreferences,
  ThemeColor,
} from '../types';
import { isExerciseAvailable } from '../utils/routineGenerator';
import {
  Wrench,
  Target,
  Sparkles,
  Check,
  Eye,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  HeartPulse,
} from 'lucide-react';

interface PreferencesViewProps {
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
  onGenerateRoutine: (updated: UserPreferences) => void;
  onOpenExerciseModal: (ex: Exercise) => void;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  preferences,
  onSavePreferences,
  onGenerateRoutine,
  onOpenExerciseModal,
}) => {
  const [equipment, setEquipment] = useState<EquipmentId[]>(preferences.availableEquipment);
  const [preferredExercises, setPreferredExercises] = useState<string[]>(
    preferences.preferredExerciseIds
  );
  const [frequencyDays, setFrequencyDays] = useState<number>(preferences.frequencyDays);
  const [splitType, setSplitType] = useState<SplitType>(preferences.splitType);
  const [goal, setGoal] = useState<GoalType>(preferences.goal || 'ipertrofia');
  const [lifestyle, setLifestyle] = useState<LifestyleType>(preferences.lifestyle || 'moderato');
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(preferences.bodyWeightKg || 75);
  const [themeColor, setThemeColor] = useState<ThemeColor>(preferences.themeColor || 'orange');
  const [experienceLevel, setExperienceLevel] = useState<
    'Principiante' | 'Intermedio' | 'Avanzato'
  >(preferences.experienceLevel || 'Intermedio');

  const [activeMuscleFilter, setActiveMuscleFilter] = useState<string>('Tutti');
  const [showProfileSection, setShowProfileSection] = useState<boolean>(true);
  const [showEquipmentSection, setShowEquipmentSection] = useState<boolean>(true);
  const [showExercisesSection, setShowExercisesSection] = useState<boolean>(true);

  // Group equipment by category
  const equipmentByCategory = useMemo(() => {
    const map: Record<string, typeof EQUIPMENT_LIST> = {};
    EQUIPMENT_LIST.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, []);

  const feasibleExercises = useMemo(() => {
    return EXERCISES_DATABASE.filter((ex) => isExerciseAvailable(ex, equipment));
  }, [equipment]);

  const muscleGroups = [
    'Tutti',
    'Petto',
    'Dorso',
    'Spalle',
    'Quadricipiti',
    'Femorali',
    'Bicipiti',
    'Tricipiti',
    'Addome',
  ];

  const filteredExercises = useMemo(() => {
    if (activeMuscleFilter === 'Tutti') return feasibleExercises;
    return feasibleExercises.filter(
      (ex) =>
        ex.musclePrimary === activeMuscleFilter ||
        ex.musclesSecondary.includes(activeMuscleFilter as any)
    );
  }, [feasibleExercises, activeMuscleFilter]);

  const toggleEquipment = (id: EquipmentId) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyEquipmentPreset = (type: 'all' | 'none' | 'home' | 'commercial') => {
    if (type === 'all' || type === 'commercial') {
      setEquipment(EQUIPMENT_LIST.map((e) => e.id));
    } else if (type === 'none') {
      setEquipment(['bodyweight']);
    } else if (type === 'home') {
      setEquipment(['barbell', 'dumbbells', 'bench', 'rack', 'pullup_bar', 'bodyweight']);
    }
  };

  const togglePreferredExercise = (id: string) => {
    setPreferredExercises((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    const updated: UserPreferences = {
      availableEquipment: equipment,
      preferredExerciseIds: preferredExercises,
      frequencyDays,
      splitType,
      goal,
      lifestyle,
      bodyWeightKg,
      experienceLevel,
      themeColor,
    };
    onSavePreferences(updated);
    onGenerateRoutine(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-md">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Parametri Scheda & Stile di Vita
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Inserisci il tuo peso corporeo, obiettivo e stile di vita per calcolare automaticamente
          i carichi base consigliati e i tempi di recupero ideali.
        </p>
      </div>

      {/* 1. SEZIONE DATI PERSONALI & PIANO DI ALLENAMENTO */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div
          onClick={() => setShowProfileSection(!showProfileSection)}
          className="px-4 py-3.5 bg-zinc-900 flex items-center justify-between cursor-pointer border-b border-zinc-800 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-orange-400">
              <HeartPulse size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                1. Peso, Stile di Vita e Obiettivo
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">
                {bodyWeightKg} kg • {goal.toUpperCase()} • Stile: {lifestyle.toUpperCase()}
              </span>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white">
            {showProfileSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showProfileSection && (
          <div className="p-4 sm:p-5 space-y-5 text-xs">
            {/* Peso Corporeo & Stile di Vita */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Peso corporeo */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <label className="block text-[11px] font-mono uppercase text-orange-400 font-bold mb-1.5 flex items-center justify-between">
                  <span>Il Tuo Peso Corporeo</span>
                  <span className="text-white font-bold">{bodyWeightKg} kg</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="40"
                    max="160"
                    step="0.5"
                    value={bodyWeightKg}
                    onChange={(e) => setBodyWeightKg(parseFloat(e.target.value) || 75)}
                    className="flex-1 accent-orange-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="35"
                    max="200"
                    value={bodyWeightKg}
                    onChange={(e) => setBodyWeightKg(parseFloat(e.target.value) || 75)}
                    className="w-16 px-2 py-1 bg-black border border-zinc-800 rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  Usato per stabilire i carichi di partenza proporzionati.
                </p>
              </div>

              {/* Lifestyle selector */}
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <label className="block text-[11px] font-mono uppercase text-orange-400 font-bold mb-1.5">
                  Stile di Vita Quotidiano
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'sedentario', label: 'Sedentario', sub: 'Lavoro d\'ufficio' },
                    { id: 'moderato', label: 'Moderato', sub: 'In movimento medio' },
                    { id: 'attivo', label: 'Attivo', sub: 'Lavoro pesante / sport' },
                  ].map((ls) => (
                    <button
                      key={ls.id}
                      type="button"
                      onClick={() => setLifestyle(ls.id as LifestyleType)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        lifestyle === ls.id
                          ? 'bg-orange-600 border-orange-500 text-white font-bold shadow-sm'
                          : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{ls.label}</div>
                      <div className="text-[9px] opacity-80 mt-0.5 leading-tight">{ls.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Obiettivo di Allenamento */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-300 font-bold mb-2">
                Obiettivo Primario
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'ipertrofia', label: 'Ipertrofia', desc: '8-12 reps, crescita' },
                  { id: 'forza', label: 'Forza', desc: '4-6 reps, carichi alti' },
                  { id: 'dimagrimento', label: 'Dimagrimento', desc: '12-15 reps, densità' },
                  { id: 'mantenimento', label: 'Mantenimento', desc: 'Volume moderato' },
                  { id: 'ricomposizione', label: 'Ricomposizione', desc: 'Stimolo ibrido' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as GoalType)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      goal === g.id
                        ? 'bg-orange-950/60 border-orange-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white flex items-center justify-between">
                      {g.label}
                      {goal === g.id && <Check size={13} className="text-orange-400" />}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Split & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-300 font-bold mb-2">
                  Struttura / Split della Scheda
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'push_pull_legs', name: 'Push / Pull / Legs (PPL)', desc: 'Spinta, Tirata, Gambe' },
                    { id: 'upper_lower', name: 'Upper / Lower (4 Giorni)', desc: 'Alto e Basso alternati' },
                    { id: 'full_body', name: 'Full Body (2-3 Giorni)', desc: 'Tutto il corpo ogni sessione' },
                    { id: 'monofrequenza', name: 'Monofrequenza 4 Split', desc: 'Gruppi singoli ad alto volume' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSplitType(s.id as SplitType)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        splitType === s.id
                          ? 'bg-orange-950/40 border-orange-500 text-white font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-white font-bold">{s.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{s.desc}</div>
                      </div>
                      {splitType === s.id && <Check size={14} className="text-orange-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-300 font-bold mb-2">
                  Frequenza Settimanale
                </label>
                <div className="flex gap-2 mb-4">
                  {[2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFrequencyDays(d)}
                      className={`flex-1 py-2 rounded-xl border text-center font-bold text-xs font-mono ${
                        frequencyDays === d
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {d} gg
                    </button>
                  ))}
                </div>

                <label className="block text-[11px] font-mono uppercase text-zinc-300 font-bold mb-2">
                  Livello di Esperienza
                </label>
                <div className="flex gap-2">
                  {(['Principiante', 'Intermedio', 'Avanzato'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`flex-1 py-2 rounded-xl border text-center font-bold text-xs ${
                        experienceLevel === lvl
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colore del Tema */}
              <div>
                <label className="block text-xs uppercase text-zinc-300 font-bold mb-2">
                  Colore del Tema
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'orange', name: 'Arancione', bg: 'bg-[#f97316]' },
                    { id: 'green', name: 'Verde', bg: 'bg-[#22c55e]' },
                    { id: 'pink', name: 'Rosa', bg: 'bg-[#ec4899]' },
                    { id: 'blue', name: 'Azzurro', bg: 'bg-[#0ea5e9]' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setThemeColor(t.id as ThemeColor);
                        document.documentElement.setAttribute('data-theme', t.id);
                      }}
                      className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        themeColor === t.id
                          ? 'border-white bg-zinc-800 text-white font-bold'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${t.bg}`} />
                      <span className="text-[11px]">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SEZIONE ATTREZZATURA E MACCHINARI */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div
          onClick={() => setShowEquipmentSection(!showEquipmentSection)}
          className="px-4 py-3.5 bg-zinc-900 flex items-center justify-between cursor-pointer border-b border-zinc-800 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-orange-400">
              <Wrench size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                2. Macchinari e Attrezzatura Disponibile
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">
                {equipment.length} di {EQUIPMENT_LIST.length} selezionate
              </span>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white">
            {showEquipmentSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showEquipmentSection && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">Preset veloci:</span>
              <button
                type="button"
                onClick={() => applyEquipmentPreset('commercial')}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200"
              >
                Palestra Completa
              </button>
              <button
                type="button"
                onClick={() => applyEquipmentPreset('home')}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200"
              >
                Home Gym
              </button>
              <button
                type="button"
                onClick={() => applyEquipmentPreset('none')}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200"
              >
                Corpo Libero
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(equipmentByCategory).map(([category, items]) => (
                <div key={category}>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold mb-2">
                    {category}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {items.map((item) => {
                      const isSelected = equipment.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleEquipment(item.id)}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-orange-950/30 border-orange-500/70 text-white'
                              : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isSelected ? (
                              <CheckSquare size={16} className="text-orange-500" />
                            ) : (
                              <Square size={16} className="text-zinc-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">{item.name}</div>
                            <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. SELEZIONE ESERCIZI PREFERITI */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div
          onClick={() => setShowExercisesSection(!showExercisesSection)}
          className="px-4 py-3.5 bg-zinc-900 flex items-center justify-between cursor-pointer border-b border-zinc-800 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-orange-400">
              <Target size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                3. Esercizi Preferiti (Priorità nella Scheda)
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">
                {feasibleExercises.length} esercizi compatibili ({preferredExercises.length} prioritari)
              </span>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white">
            {showExercisesSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showExercisesSection && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-zinc-800">
              {muscleGroups.map((mg) => (
                <button
                  key={mg}
                  onClick={() => setActiveMuscleFilter(mg)}
                  className={`px-2.5 py-1 rounded text-xs font-medium font-mono transition-colors ${
                    activeMuscleFilter === mg
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {mg}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
              {filteredExercises.map((ex) => {
                const isPreferred = preferredExercises.includes(ex.id);
                return (
                  <div
                    key={ex.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      isPreferred
                        ? 'bg-orange-950/30 border-orange-500/80 text-white'
                        : 'bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      onClick={() => togglePreferredExercise(ex.id)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="flex-shrink-0">
                        {isPreferred ? (
                          <CheckSquare size={16} className="text-orange-500" />
                        ) : (
                          <Square size={16} className="text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate text-white">{ex.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {ex.musclePrimary} • {ex.category}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenExerciseModal(ex)}
                      className="p-1.5 text-zinc-400 hover:text-orange-400 rounded hover:bg-zinc-800 flex-shrink-0"
                      title="Vedi video stilizzato e tecnica"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleGenerate}
          className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-950 flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles size={18} />
          Salva Parametri e Genera Nuova Scheda
        </button>
      </div>
    </div>
  );
};
