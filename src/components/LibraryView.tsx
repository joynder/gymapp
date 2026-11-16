import React, { useState, useMemo } from 'react';
import { EXERCISES_DATABASE } from '../data/exercises';
import { EQUIPMENT_LIST } from '../data/equipment';
import type { Exercise } from '../types';
import { Search, ChevronRight } from 'lucide-react';

interface LibraryViewProps {
  onOpenExerciseModal: (ex: Exercise) => void;
  userBodyWeightKg?: number;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onOpenExerciseModal,
  userBodyWeightKg = 75,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Tutti');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('Tutti');

  const muscleOptions = [
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
    return EXERCISES_DATABASE.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMuscle =
        selectedMuscle === 'Tutti' ||
        ex.musclePrimary === selectedMuscle ||
        ex.musclesSecondary.includes(selectedMuscle as any);

      const matchesEquipment =
        selectedEquipment === 'Tutti' ||
        ex.requiredEquipment.includes(selectedEquipment as any);

      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [searchTerm, selectedMuscle, selectedEquipment]);

  const getEquipmentName = (id: string) => {
    const item = EQUIPMENT_LIST.find((e) => e.id === id);
    return item ? item.name : id;
  };

  const bw = userBodyWeightKg || 75;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-24 text-zinc-100">
      {/* Search & Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Cerca esercizio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
          >
            <option value="Tutti">Tutta l'attrezzatura</option>
            {EQUIPMENT_LIST.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>
        </div>

        {/* Muscle selector pills */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {muscleOptions.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedMuscle === m
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Count */}
      <div className="text-xs text-zinc-500 px-1">
        {filteredExercises.length} esercizi trovati
      </div>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredExercises.map((ex) => {
          const isBw = ex.isBodyweight;
          const intermediateStandard = isBw
            ? `${ex.strengthStandards.intermediate} reps`
            : `${Math.round(bw * ex.strengthStandards.intermediate)} kg`;

          const equipNames = ex.requiredEquipment.map(getEquipmentName).join(', ');

          return (
            <div
              key={ex.id}
              onClick={() => onOpenExerciseModal(ex)}
              className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div>
                {/* Official StrengthLevel Exercise Image - White Frame Seamless Fitting */}
                <div className="w-full bg-white aspect-[4/3] flex items-center justify-center p-3 border-b border-zinc-800/80 overflow-hidden">
                  <img
                    src={ex.imageUrl}
                    alt={ex.name}
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Card Text Content */}
                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                    <span>{ex.musclePrimary}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-zinc-400 normal-case font-normal truncate max-w-[180px]">
                      {equipNames}
                    </span>
                    {isBw && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-zinc-400 normal-case font-normal">Corpo Libero</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-orange-400 transition-colors">
                    {ex.name}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {ex.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 text-[11px] block">Standard intermedio</span>
                  <span className="font-semibold text-zinc-200">{intermediateStandard}</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-orange-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Guida</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
