import React, { useState, useMemo } from 'react';
import { EQUIPMENT_LIST } from '../data/equipment';
import type {
  EquipmentId,
  GoalType,
  LifestyleType,
  SplitType,
  UserPreferences,
} from '../types';
import {
  Wrench,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Search,
  Calendar,
  Clock,
} from 'lucide-react';

interface PreferencesViewProps {
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
  onGenerateRoutine: (updated: UserPreferences) => void;
}

export const PreferencesView: React.FC<PreferencesViewProps> = ({
  preferences,
  onSavePreferences,
  onGenerateRoutine,
}) => {
  const [equipment, setEquipment] = useState<EquipmentId[]>(preferences.availableEquipment);
  const [frequencyDays, setFrequencyDays] = useState<number>(preferences.frequencyDays || 3);
  const [workoutDurationMinutes, setWorkoutDurationMinutes] = useState<number>(
    preferences.workoutDurationMinutes || 60
  );
  const [splitType, setSplitType] = useState<SplitType>(preferences.splitType || 'push_pull_legs');
  const [goal, setGoal] = useState<GoalType>(preferences.goal || 'ipertrofia');
  const [lifestyle, setLifestyle] = useState<LifestyleType>(preferences.lifestyle || 'moderato');
  // Body weight rounded strictly to nearest 5 kg without decimals
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(() => {
    const raw = preferences.bodyWeightKg || 75;
    return Math.round(raw / 5) * 5;
  });
  const [experienceLevel, setExperienceLevel] = useState<
    'Principiante' | 'Intermedio' | 'Avanzato'
  >(preferences.experienceLevel || 'Intermedio');

  const [equipmentSearch, setEquipmentSearch] = useState<string>('');
  const [showProfileSection, setShowProfileSection] = useState<boolean>(true);
  const [showEquipmentSection, setShowEquipmentSection] = useState<boolean>(true);

  // Filter equipment based on search input
  const filteredEquipment = useMemo(() => {
    const query = equipmentSearch.trim().toLowerCase();
    if (!query) return EQUIPMENT_LIST;
    return EQUIPMENT_LIST.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [equipmentSearch]);

  // Group filtered equipment by category
  const equipmentByCategory = useMemo(() => {
    const map: Record<string, typeof EQUIPMENT_LIST> = {};
    filteredEquipment.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [filteredEquipment]);

  const toggleEquipment = (id: EquipmentId) => {
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyEquipmentPreset = (type: 'all' | 'none' | 'home') => {
    if (type === 'all') {
      setEquipment(EQUIPMENT_LIST.map((e) => e.id));
    } else if (type === 'none') {
      setEquipment(['bodyweight']);
    } else if (type === 'home') {
      setEquipment(['barbell', 'dumbbells', 'bench', 'rack', 'pullup_bar', 'bodyweight']);
    }
  };

  const handleSaveAndGenerate = () => {
    const updated: UserPreferences = {
      ...preferences,
      availableEquipment: equipment,
      frequencyDays,
      workoutDurationMinutes,
      splitType,
      goal,
      lifestyle,
      bodyWeightKg,
      experienceLevel,
    };
    onSavePreferences(updated);
    onGenerateRoutine(updated);
  };

  const handleOnlySave = () => {
    const updated: UserPreferences = {
      ...preferences,
      availableEquipment: equipment,
      frequencyDays,
      workoutDurationMinutes,
      splitType,
      goal,
      lifestyle,
      bodyWeightKg,
      experienceLevel,
    };
    onSavePreferences(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 text-zinc-100">
      {/* Header Banner */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-md">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Parametri Scheda & Attrezzatura
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Configura il tuo profilo fisico, l'obiettivo e i macchinari a cui hai accesso per calcolare
          automaticamente i carichi base e creare schede su misura.
        </p>
      </div>

      {/* 1. SEZIONE ORDINATA: PESO, STILE DI VITA, OBIETTIVO E PROGRAMMA */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div
          onClick={() => setShowProfileSection(!showProfileSection)}
          className="px-4 py-3.5 bg-zinc-900 flex items-center justify-between cursor-pointer border-b border-zinc-800 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent flex items-center justify-center text-accent">
              <HeartPulse size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                1. Dati Fisici, Stile di Vita e Obiettivo
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">
                {bodyWeightKg} kg • {goal.toUpperCase()} • {frequencyDays} gg • {workoutDurationMinutes} min
              </span>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white">
            {showProfileSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showProfileSection && (
          <div className="p-4 sm:p-6 space-y-6 text-xs">
            {/* A. PESO CORPOREO (Step 5kg, niente decimali) */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs uppercase font-mono font-bold text-accent">
                    Peso Corporeo
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Utilizzato per stimare i carichi di partenza proporzionati (step di 5 kg).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono">{bodyWeightKg}</span>
                  <span className="text-xs text-zinc-400 ml-1 font-mono">kg</span>
                </div>
              </div>

              <input
                type="range"
                min="40"
                max="160"
                step="5"
                value={bodyWeightKg}
                onChange={(e) => setBodyWeightKg(parseInt(e.target.value, 10) || 75)}
                className="w-full accent-accent cursor-pointer h-2 bg-zinc-950 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                <span>40 kg</span>
                <span>60 kg</span>
                <span>80 kg</span>
                <span>100 kg</span>
                <span>120 kg</span>
                <span>140 kg</span>
                <span>160 kg</span>
              </div>
            </div>

            {/* B. STILE DI VITA QUOTIDIANO */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-mono font-bold text-zinc-300">
                Stile di Vita Quotidiano (Recupero Nervoso & Muscolare)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'sedentario',
                    label: 'Sedentario',
                    sub: 'Lavoro d\'ufficio o studio',
                    desc: 'Recuperi più ampi sui movimenti pesanti.',
                  },
                  {
                    id: 'moderato',
                    label: 'Moderato',
                    sub: 'Movimento medio o camminate',
                    desc: 'Equilibrio ideale tra carico e recupero.',
                  },
                  {
                    id: 'attivo',
                    label: 'Molto Attivo',
                    sub: 'Lavoro fisico o altri sport',
                    desc: 'Volume calibrato per evitare sovraccarico.',
                  },
                ].map((ls) => (
                  <button
                    key={ls.id}
                    type="button"
                    onClick={() => setLifestyle(ls.id as LifestyleType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      lifestyle === ls.id
                        ? 'bg-accent-subtle border-accent text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs text-white">
                      <span>{ls.label}</span>
                      {lifestyle === ls.id && <Check size={14} className="text-accent" />}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{ls.sub}</div>
                    <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{ls.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* C. OBIETTIVO PRIMARIO */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-mono font-bold text-zinc-300">
                Obiettivo Primario
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'ipertrofia', label: 'Ipertrofia (Massa Muscolare)', desc: '8-12 reps • 75-90s recupero' },
                  { id: 'forza', label: 'Forza Massimale', desc: '4-6 reps • 120-150s recupero' },
                  { id: 'dimagrimento', label: 'Definizione & Tono', desc: '10-15 reps • 45-60s recupero' },
                  { id: 'mantenimento', label: 'Mantenimento Salute', desc: '8-10 reps • Volume moderato' },
                  { id: 'ricomposizione', label: 'Ricomposizione Corporea', desc: '6-10 reps • Stimolo ibrido' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as GoalType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      goal === g.id
                        ? 'bg-accent-subtle border-accent text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-white flex items-center justify-between">
                      <span>{g.label}</span>
                      {goal === g.id && <Check size={14} className="text-accent" />}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 font-mono">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* D. FREQUENZA, DURATA E STRUTTURA SCHEDA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
              {/* Frequenza giorni */}
              <div className="space-y-2">
                <label className="block text-xs uppercase font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Calendar size={13} className="text-accent" />
                  <span>Giorni a Settimana</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFrequencyDays(d)}
                      className={`py-2 rounded-xl border text-center font-bold text-xs font-mono transition-all ${
                        frequencyDays === d
                          ? 'bg-accent border-accent text-white shadow'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {d} gg
                    </button>
                  ))}
                </div>
              </div>

              {/* Durata seduta slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-accent">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>Durata per Sessione</span>
                  </span>
                  <span className="text-white text-xs">{workoutDurationMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="15"
                  value={workoutDurationMinutes}
                  onChange={(e) => setWorkoutDurationMinutes(parseInt(e.target.value, 10) || 60)}
                  className="w-full accent-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>30m</span>
                  <span>45m</span>
                  <span>60m</span>
                  <span>75m</span>
                  <span>90m</span>
                </div>
              </div>
            </div>

            {/* E. LIVELLO ESPERIENZA & SPLIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs uppercase font-mono font-bold text-zinc-300">
                  Livello di Esperienza
                </label>
                <div className="flex gap-2">
                  {(['Principiante', 'Intermedio', 'Avanzato'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`flex-1 py-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        experienceLevel === lvl
                          ? 'bg-accent border-accent text-white shadow'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase font-mono font-bold text-zinc-300">
                  Tipologia Split Preferita
                </label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as SplitType)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="push_pull_legs">Push / Pull / Legs (PPL)</option>
                  <option value="upper_lower">Upper / Lower (Superiore & Inferiore)</option>
                  <option value="full_body">Full Body (Total Body)</option>
                  <option value="monofrequenza">Monofrequenza (Gruppi Singoli)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SEZIONE ATTREZZATURA E MACCHINARI CON BARRA DI RICERCA */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div
          onClick={() => setShowEquipmentSection(!showEquipmentSection)}
          className="px-4 py-3.5 bg-zinc-900 flex items-center justify-between cursor-pointer border-b border-zinc-800 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent flex items-center justify-center text-accent">
              <Wrench size={17} />
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
          <div className="p-4 sm:p-6 space-y-4">
            {/* Search Bar for Equipment */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Cerca attrezzo o macchinario (es. panca, manubri, lat machine, cavi...)"
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
              />
              {equipmentSearch && (
                <button
                  type="button"
                  onClick={() => setEquipmentSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Azzera
                </button>
              )}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-400 mr-1">Preset veloci:</span>
              <button
                type="button"
                onClick={() => applyEquipmentPreset('all')}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200 transition-colors"
              >
                Tutto (Palestra Completa)
              </button>
              <button
                type="button"
                onClick={() => applyEquipmentPreset('home')}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200 transition-colors"
              >
                Home Gym Essenziale
              </button>
              <button
                type="button"
                onClick={() => applyEquipmentPreset('none')}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-200 transition-colors"
              >
                Solo Corpo Libero
              </button>
            </div>

            {/* List grouped by category */}
            <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
              {Object.keys(equipmentByCategory).length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs font-mono">
                  Nessun attrezzo o macchinario trovato per "{equipmentSearch}".
                </div>
              ) : (
                Object.entries(equipmentByCategory).map(([category, items]) => (
                  <div key={category}>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold mb-2">
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
                                ? 'bg-accent-subtle border-accent text-white'
                                : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {isSelected ? (
                                <CheckSquare size={16} className="text-accent" />
                              ) : (
                                <Square size={16} className="text-zinc-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold leading-tight truncate">{item.name}</div>
                              <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleOnlySave}
          className="flex-1 py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-200 hover:text-white transition-colors"
        >
          Salva Parametri
        </button>

        <button
          type="button"
          onClick={handleSaveAndGenerate}
          className="flex-1 py-3.5 px-4 bg-accent hover:opacity-90 active:opacity-100 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Sparkles size={16} />
          Salva e Genera Nuova Scheda Adattata
        </button>
      </div>
    </div>
  );
};
