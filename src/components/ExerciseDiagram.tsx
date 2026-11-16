import React from 'react';
import type { Exercise } from '../types';

interface ExerciseDiagramProps {
  exercise: Exercise;
  className?: string;
}

export const ExerciseDiagram: React.FC<ExerciseDiagramProps> = ({ exercise, className = '' }) => {
  const { diagramType, musclePrimary } = exercise;

  // Renders precise vector illustrations showing biomechanics, body position and target muscles
  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
          Target: {musclePrimary}
        </span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
          {exercise.category}
        </span>
      </div>

      <svg
        viewBox="0 0 320 200"
        className="w-full h-44 object-contain select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="primaryMuscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Floor grid / benchmark */}
        <line x1="20" y1="180" x2="300" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

        {/* SPECIFIC DIAGRAMS */}
        {diagramType === 'bench_press' && (
          <g>
            {/* Bench */}
            <rect x="70" y="140" width="180" height="12" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="90" y="152" width="10" height="28" fill="#334155" />
            <rect x="220" y="152" width="10" height="28" fill="#334155" />

            {/* Torso lying on bench */}
            <path d="M 95 136 Q 140 128 185 136 L 210 136" fill="none" stroke="url(#bodyGrad)" strokeWidth="16" strokeLinecap="round" />

            {/* Head */}
            <circle cx="85" cy="134" r="9" fill="#94a3b8" />

            {/* Chest Highlight */}
            <path d="M 125 130 Q 145 125 160 130" stroke="url(#primaryMuscleGrad)" strokeWidth="8" strokeLinecap="round" />

            {/* Arms & Barbell */}
            <path d="M 140 132 L 140 92" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <line x1="80" y1="88" x2="200" y2="88" stroke="url(#barGrad)" strokeWidth="5" />
            <rect x="74" y="76" width="6" height="24" rx="2" fill="#38bdf8" />
            <rect x="200" y="76" width="6" height="24" rx="2" fill="#38bdf8" />

            {/* Movement vector */}
            <line x1="140" y1="115" x2="140" y2="75" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <text x="148" y="75" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">Spinta</text>

            {/* Leg & Foot */}
            <path d="M 210 136 L 235 150 L 235 180" fill="none" stroke="#64748b" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="230" y="178" width="18" height="4" rx="2" fill="#94a3b8" />
          </g>
        )}

        {diagramType === 'squat' && (
          <g>
            {/* Athlete performing squat */}
            {/* Head */}
            <circle cx="150" cy="55" r="9" fill="#94a3b8" />

            {/* Barbell on shoulders */}
            <line x1="90" y1="62" x2="210" y2="62" stroke="url(#barGrad)" strokeWidth="6" />
            <rect x="85" y="48" width="6" height="28" rx="2" fill="#38bdf8" />
            <rect x="209" y="48" width="6" height="28" rx="2" fill="#38bdf8" />

            {/* Torso at 60-70 degree angle */}
            <line x1="150" y1="64" x2="135" y2="105" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />

            {/* Quads highlight */}
            <line x1="135" y1="105" x2="175" y2="128" stroke="url(#primaryMuscleGrad)" strokeWidth="10" strokeLinecap="round" />

            {/* Lower leg */}
            <line x1="175" y1="128" x2="165" y2="180" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
            {/* Foot */}
            <rect x="155" y="178" width="22" height="4" rx="2" fill="#94a3b8" />

            {/* Trajectory */}
            <path d="M 120 70 L 120 120" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <text x="75" y="110" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">Profondità</text>
          </g>
        )}

        {diagramType === 'deadlift' && (
          <g>
            {/* Barbell on floor / mid shin */}
            <line x1="80" y1="150" x2="240" y2="150" stroke="url(#barGrad)" strokeWidth="6" />
            <rect x="74" y="132" width="8" height="36" rx="2" fill="#38bdf8" />
            <rect x="238" y="132" width="8" height="36" rx="2" fill="#38bdf8" />

            {/* Athlete */}
            {/* Head */}
            <circle cx="120" cy="78" r="9" fill="#94a3b8" />
            {/* Spine (neutral) with back highlight */}
            <line x1="124" y1="86" x2="170" y2="115" stroke="url(#primaryMuscleGrad)" strokeWidth="10" strokeLinecap="round" />
            {/* Hamstrings / Glutes */}
            <line x1="170" y1="115" x2="162" y2="148" stroke="#3b82f6" strokeWidth="9" strokeLinecap="round" />
            {/* Tibia */}
            <line x1="162" y1="148" x2="160" y2="180" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            {/* Arms holding bar straight */}
            <line x1="128" y1="92" x2="160" y2="148" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />

            {/* Vector */}
            <line x1="190" y1="150" x2="190" y2="105" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <text x="198" y="125" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">Trazione</text>
          </g>
        )}

        {diagramType === 'overhead_press' && (
          <g>
            {/* Standing lifter */}
            <rect x="140" y="178" width="40" height="4" rx="2" fill="#94a3b8" />
            <line x1="155" y1="180" x2="155" y2="135" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
            <line x1="165" y1="180" x2="165" y2="135" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
            <line x1="160" y1="135" x2="160" y2="85" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
            <circle cx="160" cy="70" r="9" fill="#94a3b8" />

            {/* Shoulder Highlight */}
            <circle cx="148" cy="84" r="6" fill="#3b82f6" />
            <circle cx="172" cy="84" r="6" fill="#3b82f6" />

            {/* Arms pressing up */}
            <path d="M 148 84 L 140 50" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <path d="M 172 84 L 180 50" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />

            {/* Barbell overhead */}
            <line x1="100" y1="46" x2="220" y2="46" stroke="url(#barGrad)" strokeWidth="5" />
            <rect x="94" y="36" width="6" height="20" rx="2" fill="#38bdf8" />
            <rect x="220" y="36" width="6" height="20" rx="2" fill="#38bdf8" />

            {/* Arrow */}
            <line x1="160" y1="75" x2="160" y2="35" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
          </g>
        )}

        {diagramType === 'pullup' && (
          <g>
            {/* Pullup bar */}
            <line x1="60" y1="30" x2="260" y2="30" stroke="#475569" strokeWidth="6" />
            <rect x="70" y="20" width="10" height="20" fill="#334155" />
            <rect x="240" y="20" width="10" height="20" fill="#334155" />

            {/* Lifter hanging / pulling */}
            <line x1="135" y1="32" x2="148" y2="65" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <line x1="185" y1="32" x2="172" y2="65" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <circle cx="160" cy="55" r="9" fill="#94a3b8" />

            {/* Torso & V-taper Lats Highlight */}
            <path d="M 145 68 L 175 68 L 165 110 L 155 110 Z" fill="url(#primaryMuscleGrad)" />
            <line x1="160" y1="110" x2="155" y2="155" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            <line x1="160" y1="110" x2="165" y2="155" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

            {/* Arrow pulling upwards */}
            <line x1="120" y1="80" x2="120" y2="40" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <text x="100" y="40" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">Trazione</text>
          </g>
        )}

        {diagramType === 'row' && (
          <g>
            {/* Bent over row */}
            <line x1="160" y1="180" x2="160" y2="140" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
            <line x1="160" y1="140" x2="125" y2="115" stroke="url(#primaryMuscleGrad)" strokeWidth="11" strokeLinecap="round" />
            <circle cx="115" cy="105" r="9" fill="#94a3b8" />

            {/* Arms pulling barbell */}
            <line x1="132" y1="118" x2="145" y2="142" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <circle cx="145" cy="142" r="7" fill="url(#barGrad)" />

            {/* Arrow */}
            <line x1="145" y1="158" x2="145" y2="135" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <text x="155" y="145" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">Gomito alto</text>
          </g>
        )}

        {(diagramType === 'bicep_curl' || diagramType === 'hammer_curl') && (
          <g>
            {/* Standing athlete arm curl */}
            <line x1="150" y1="180" x2="150" y2="85" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
            <circle cx="150" cy="68" r="9" fill="#94a3b8" />

            {/* Arm & Bicep */}
            <line x1="152" y1="85" x2="152" y2="118" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
            {/* Forearm flexing up */}
            <line x1="152" y1="118" x2="175" y2="92" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            {/* Bicep muscle peak highlight */}
            <ellipse cx="158" cy="102" rx="6" ry="9" fill="url(#primaryMuscleGrad)" />
            {/* Dumbbell / Barbell */}
            <rect x="170" y="86" width="10" height="12" rx="2" fill="#38bdf8" />

            {/* Arc vector */}
            <path d="M 154 135 A 30 30 0 0 1 178 95" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrow)" />
          </g>
        )}

        {diagramType === 'lateral_raise' && (
          <g>
            {/* Standing lifter doing lateral raise */}
            <line x1="160" y1="180" x2="160" y2="90" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
            <circle cx="160" cy="72" r="9" fill="#94a3b8" />

            {/* Delts highlight */}
            <circle cx="148" cy="90" r="7" fill="url(#primaryMuscleGrad)" />
            <circle cx="172" cy="90" r="7" fill="url(#primaryMuscleGrad)" />

            {/* Arms raised to 90 degrees */}
            <line x1="148" y1="90" x2="95" y2="92" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <line x1="172" y1="90" x2="225" y2="92" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />

            {/* Weights */}
            <rect x="88" y="86" width="7" height="12" rx="2" fill="#38bdf8" />
            <rect x="225" y="86" width="7" height="12" rx="2" fill="#38bdf8" />

            {/* Lift arc */}
            <path d="M 130 130 Q 110 115 100 98" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <path d="M 190 130 Q 210 115 220 98" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrow)" />
          </g>
        )}

        {diagramType === 'dip' && (
          <g>
            {/* Dip bars */}
            <line x1="110" y1="110" x2="110" y2="180" stroke="#475569" strokeWidth="5" />
            <line x1="210" y1="110" x2="210" y2="180" stroke="#475569" strokeWidth="5" />
            <line x1="95" y1="110" x2="225" y2="110" stroke="#64748b" strokeWidth="5" />

            {/* Torso leaning forward */}
            <line x1="150" y1="85" x2="165" y2="135" stroke="url(#primaryMuscleGrad)" strokeWidth="12" strokeLinecap="round" />
            <circle cx="145" cy="72" r="9" fill="#94a3b8" />
            {/* Legs bent back */}
            <path d="M 165 135 L 180 155 L 175 170" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />

            {/* Arms on bars */}
            <path d="M 152 88 L 135 110" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
            <path d="M 160 88 L 185 110" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />

            {/* Vector */}
            <line x1="120" y1="130" x2="120" y2="90" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrow)" />
          </g>
        )}

        {diagramType === 'leg_extension' && (
          <g>
            {/* Machine seat */}
            <rect x="90" y="110" width="80" height="10" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="90" y="60" width="10" height="55" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="2" />

            {/* Lifter seated */}
            <line x1="105" y1="70" x2="115" y2="110" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
            <circle cx="102" cy="55" r="9" fill="#94a3b8" />
            {/* Thigh (quad highlighted) */}
            <line x1="115" y1="110" x2="170" y2="110" stroke="url(#primaryMuscleGrad)" strokeWidth="10" strokeLinecap="round" />
            {/* Tibia kicking forward */}
            <line x1="170" y1="110" x2="215" y2="120" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            {/* Roller cushion */}
            <circle cx="210" cy="116" r="6" fill="#38bdf8" />

            {/* Arc vector */}
            <path d="M 175 145 A 40 40 0 0 0 215 125" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#arrow)" />
          </g>
        )}

        {diagramType === 'generic' && (
          <g>
            {/* Utilitarian biomechanical human outline with muscle highlight */}
            <circle cx="160" cy="50" r="10" fill="#94a3b8" />
            {/* Torso */}
            <line x1="160" y1="62" x2="160" y2="115" stroke="url(#primaryMuscleGrad)" strokeWidth="14" strokeLinecap="round" />
            {/* Arms */}
            <line x1="152" y1="70" x2="120" y2="105" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
            <line x1="168" y1="70" x2="200" y2="105" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
            {/* Legs */}
            <line x1="154" y1="115" x2="140" y2="175" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            <line x1="166" y1="115" x2="180" y2="175" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}
      </svg>
      <div className="w-full text-center text-xs text-slate-400 mt-1 font-mono">
        Traiettoria biomeccanica & Attivazione
      </div>
    </div>
  );
};
