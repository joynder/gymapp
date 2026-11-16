import React, { useState, useEffect, useRef } from 'react';
import type { Exercise } from '../types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TechnicalVideoPlayerProps {
  exercise: Exercise;
  className?: string;
}

type MovementPhase = 'setup' | 'eccentric' | 'inflection' | 'concentric';

export const TechnicalVideoPlayer: React.FC<TechnicalVideoPlayerProps> = ({
  exercise,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [showMuscles, setShowMuscles] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);

  const reqIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const cycleDuration = 3600 / speed;

    const updateFrame = (now: number) => {
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (isPlaying) {
        setProgress((prev) => (prev + dt / cycleDuration) % 1.0);
      }
      reqIdRef.current = requestAnimationFrame(updateFrame);
    };

    lastTimeRef.current = performance.now();
    reqIdRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [isPlaying, speed]);

  let currentPhase: MovementPhase = 'setup';
  let phaseLabel = '1. Posizionamento & Setup';
  let phaseDescription = 'Assetto neutro, articolazioni stabilizzate e pre-attivazione del core.';
  let phaseProgress = 0; // 0 to 1

  if (progress < 0.15) {
    currentPhase = 'setup';
    phaseLabel = 'Fase 1: Setup & Pre-Tensione';
    phaseDescription = 'Articolazioni allineate, addome compatto e scapole bloccate.';
    phaseProgress = 0;
  } else if (progress < 0.50) {
    currentPhase = 'eccentric';
    phaseLabel = 'Fase 2: Eccentrica (Discesa Controllata)';
    phaseDescription = 'Frena il carico in 2-3 secondi controllando l\'escursione articolare.';
    phaseProgress = (progress - 0.15) / 0.35;
  } else if (progress < 0.65) {
    currentPhase = 'inflection';
    phaseLabel = 'Fase 3: Massimo Allungamento / Fermo';
    phaseDescription = 'Punto di inversione: massima tensione meccanica sulle fibre muscolari bersaglio.';
    phaseProgress = 1;
  } else {
    currentPhase = 'concentric';
    phaseLabel = 'Fase 4: Concentrica (Spinta / Tirata)';
    phaseDescription = 'Spinta potente ed esplosiva mantenendo la traiettoria ideale.';
    phaseProgress = 1 - (progress - 0.65) / 0.35;
  }

  // Smooth sinusoidal easing
  const eased = 0.5 - Math.cos(phaseProgress * Math.PI) / 2;

  const jumpToPhase = (target: number) => {
    setProgress(target);
  };

  const { diagramType, musclePrimary, isBodyweight } = exercise;

  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl ${className}`}>
      {/* Top Technical HUD Bar */}
      <div className="px-3.5 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span className="font-mono text-orange-400 font-bold uppercase tracking-wider text-[11px]">
            Simulatore Biomeccanico Tecnico
          </span>
          {isBodyweight && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
              Corpo Libero
            </span>
          )}
        </div>

        <button
          onClick={() => setSpeed(speed === 1.0 ? 0.5 : 1.0)}
          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
            speed === 0.5
              ? 'bg-orange-950/80 border-orange-500 text-orange-300 font-bold'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          {speed}x Slow Motion
        </button>
      </div>

      {/* Stylized Animation Canvas (SVG) */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center p-2 select-none overflow-hidden">
        {/* Subtle Engineering Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* HUD Overlay Readings */}
        <div className="absolute top-2.5 left-3 z-10 font-mono text-[10px] space-y-0.5 pointer-events-none">
          <div className="text-zinc-500">
            ESCURSIONE: <span className="text-orange-400 font-bold">{Math.round(eased * 100)}%</span>
          </div>
          <div className="text-zinc-500">
            TARGET: <span className="text-white font-bold">{musclePrimary}</span>
          </div>
        </div>

        <svg
          viewBox="0 0 400 240"
          className="w-full h-full object-contain relative z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="neonOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <filter id="glowOrange" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="techArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
            </marker>
          </defs>

          {/* Reference Ground Line */}
          <line x1="30" y1="210" x2="370" y2="210" stroke="#27272a" strokeWidth="2" strokeDasharray="3 3" />

          {/* 1. REAL PUSHUP ON THE FLOOR (NO BARBELL, NO BENCH!) */}
          {diagramType === 'pushup' && (
            <g>
              {(() => {
                // Chest and torso lower from height 140 down to 185 (touching floor)
                const torsoY = 140 + eased * 45;
                const headY = torsoY - 8;
                const shoulderY = torsoY;
                const elbowY = 175 - (1 - eased) * 20; // elbow bends backward
                const elbowX = 135 - eased * 15;

                return (
                  <g>
                    {/* Floor contact for hands and toes */}
                    <rect x="155" y="206" width="22" height="4" rx="2" fill="#71717a" />
                    <rect x="300" y="206" width="22" height="4" rx="2" fill="#71717a" />

                    {/* Lifter Body in Horizontal Plank Line */}
                    {/* Head */}
                    <circle cx="125" cy={headY} r="10" fill="#71717a" />

                    {/* Torso & Spine */}
                    <line
                      x1="135"
                      y1={shoulderY}
                      x2="250"
                      y2={165 + eased * 20}
                      stroke="#52525b"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />

                    {/* Legs stretching to toes on floor */}
                    <line
                      x1="250"
                      y1={165 + eased * 20}
                      x2="310"
                      y2="208"
                      stroke="#52525b"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />

                    {/* Primary Chest & Triceps Activation (Orange Glow) */}
                    {showMuscles && (
                      <g>
                        <path
                          d={`M 140 ${shoulderY + 4} L 180 ${shoulderY + 6}`}
                          stroke="url(#neonOrangeGrad)"
                          strokeWidth={9 + eased * 4}
                          strokeLinecap="round"
                          filter="url(#glowOrange)"
                        />
                        <line
                          x1={shoulderY}
                          y1={shoulderY}
                          x2={elbowX}
                          y2={elbowY}
                          stroke="url(#neonOrangeGrad)"
                          strokeWidth={6}
                          strokeLinecap="round"
                        />
                      </g>
                    )}

                    {/* Arm: Shoulder -> Elbow -> Hands planted at (165, 208) */}
                    <path
                      d={`M 145 ${shoulderY} L ${elbowX} ${elbowY} L 165 208`}
                      fill="none"
                      stroke="#a1a1aa"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Angle degree marker at elbow */}
                    {showAngles && (
                      <g>
                        <circle cx={elbowX} cy={elbowY} r="4" fill="#f97316" />
                        <text
                          x={elbowX - 28}
                          y={elbowY - 4}
                          fill="#f97316"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {Math.round(160 - eased * 70)}°
                        </text>
                      </g>
                    )}

                    {/* Pushup vector */}
                    {showTrajectory && (
                      <line
                        x1="145"
                        y1="135"
                        x2="145"
                        y2="185"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        markerEnd="url(#techArrow)"
                      />
                    )}
                  </g>
                );
              })()}
            </g>
          )}

          {/* 2. PLANK ON FLOOR */}
          {diagramType === 'plank' && (
            <g>
              {(() => {
                const pulse = Math.sin(progress * Math.PI * 4) * 2;
                return (
                  <g>
                    {/* Forearms and toes on ground */}
                    <rect x="120" y="206" width="35" height="4" rx="2" fill="#71717a" />
                    <rect x="290" y="206" width="25" height="4" rx="2" fill="#71717a" />

                    {/* Head */}
                    <circle cx="110" cy="155" r="10" fill="#71717a" />

                    {/* Forearm vertical */}
                    <line x1="140" y1="165" x2="140" y2="208" stroke="#a1a1aa" strokeWidth="8" strokeLinecap="round" />

                    {/* Straight Plank Spine */}
                    <line x1="140" y1="165" x2="295" y2="195" stroke="#52525b" strokeWidth="15" strokeLinecap="round" />

                    {/* Pulsing Core / Abs highlighted */}
                    {showMuscles && (
                      <path
                        d="M 170 178 L 220 185"
                        stroke="url(#neonOrangeGrad)"
                        strokeWidth={10 + pulse}
                        strokeLinecap="round"
                        filter="url(#glowOrange)"
                      />
                    )}

                    <text x="180" y="150" fill="#f97316" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      ISOMETRIA CORE
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* 3. BENCH PRESS (BARBELL / DUMBBELL) */}
          {(diagramType === 'bench_press' || diagramType === 'incline_bench') && (
            <g>
              {(() => {
                const isIncline = diagramType === 'incline_bench';
                const barY = (isIncline ? 65 : 75) + eased * 60;
                const elbowY = (isIncline ? 100 : 110) + eased * 35;
                const elbowX = 185 - eased * 12;

                return (
                  <g>
                    {/* Bench */}
                    {isIncline ? (
                      <line x1="90" y1="185" x2="220" y2="125" stroke="#3f3f46" strokeWidth="14" strokeLinecap="round" />
                    ) : (
                      <rect x="90" y="155" width="220" height="14" rx="3" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                    )}

                    {/* Lifter Body */}
                    <path
                      d={isIncline ? "M 100 175 L 210 130 L 250 175" : "M 125 150 Q 180 142 240 150 L 270 150"}
                      fill="none"
                      stroke="#52525b"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />
                    <circle cx={isIncline ? 215 : 110} cy={isIncline ? 115 : 147} r="11" fill="#71717a" />

                    {/* Chest with Glow */}
                    {showMuscles && (
                      <path
                        d={isIncline ? "M 160 150 L 190 138" : "M 160 144 Q 185 137 210 144"}
                        stroke="url(#neonOrangeGrad)"
                        strokeWidth={8 + eased * 4}
                        strokeLinecap="round"
                        filter="url(#glowOrange)"
                      />
                    )}

                    {/* Arms & Barbell */}
                    <path
                      d={`M 160 ${isIncline ? 145 : 146} L ${elbowX} ${elbowY} L 185 ${barY}`}
                      fill="none"
                      stroke="#a1a1aa"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <line x1="85" y1={barY} x2="285" y2={barY} stroke="#e4e4e7" strokeWidth="6" />
                    <rect x="80" y={barY - 14} width="8" height="28" rx="2" fill="#f97316" />
                    <rect x="282" y={barY - 14} width="8" height="28" rx="2" fill="#f97316" />

                    {showTrajectory && (
                      <line x1="225" y1={isIncline ? 65 : 75} x2="225" y2={barY + 15} stroke="#f97316" strokeWidth="2" strokeDasharray="3 3" markerEnd="url(#techArrow)" />
                    )}
                  </g>
                );
              })()}
            </g>
          )}

          {/* 4. SQUAT / LEG PRESS */}
          {(diagramType === 'squat' || diagramType === 'leg_press' || diagramType === 'lunges') && (
            <g>
              {(() => {
                const hipY = 120 + eased * 38;
                const hipX = 175 - eased * 15;
                const kneeY = 155 + eased * 15;
                const kneeX = 215 + eased * 10;
                const barY = 65 + eased * 50;
                const barX = 195 - eased * 10;

                return (
                  <g>
                    <circle cx={barX + 2} cy={barY - 14} r="10" fill="#71717a" />
                    <line x1={barX} y1={barY} x2={hipX} y2={hipY} stroke="#52525b" strokeWidth="16" strokeLinecap="round" />

                    {/* Quads with orange glow */}
                    {showMuscles ? (
                      <line
                        x1={hipX}
                        y1={hipY}
                        x2={kneeX}
                        y2={kneeY}
                        stroke="url(#neonOrangeGrad)"
                        strokeWidth={13 + eased * 3}
                        strokeLinecap="round"
                        filter="url(#glowOrange)"
                      />
                    ) : (
                      <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#71717a" strokeWidth="13" strokeLinecap="round" />
                    )}

                    <line x1={kneeX} y1={kneeY} x2="205" y2="210" stroke="#52525b" strokeWidth="10" strokeLinecap="round" />
                    <rect x="195" y="208" width="28" height="4" rx="2" fill="#a1a1aa" />

                    {diagramType === 'squat' && (
                      <g>
                        <line x1={barX - 70} y1={barY} x2={barX + 70} y2={barY} stroke="#e4e4e7" strokeWidth="6" />
                        <rect x={barX - 78} y={barY - 16} width="8" height="32" rx="2" fill="#f97316" />
                        <rect x={barX + 70} y={barY - 16} width="8" height="32" rx="2" fill="#f97316" />
                      </g>
                    )}

                    {showAngles && (
                      <g>
                        <circle cx={kneeX} cy={kneeY} r="4" fill="#f97316" />
                        <text x={kneeX + 8} y={kneeY} fill="#f97316" fontSize="10" fontFamily="monospace" fontWeight="bold">
                          {Math.round(150 - eased * 65)}°
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}
            </g>
          )}

          {/* 5. DEADLIFT */}
          {diagramType === 'deadlift' && (
            <g>
              {(() => {
                const barY = 180 - eased * 55;
                const hipY = 145 - eased * 25;
                const hipX = 185 + eased * 15;
                const shoulderY = 120 - eased * 40;
                const shoulderX = 140 + eased * 40;

                return (
                  <g>
                    <circle cx={shoulderX - 5} cy={shoulderY - 15} r="10" fill="#71717a" />
                    {showMuscles ? (
                      <line
                        x1={shoulderX}
                        y1={shoulderY}
                        x2={hipX}
                        y2={hipY}
                        stroke="url(#neonOrangeGrad)"
                        strokeWidth={14}
                        strokeLinecap="round"
                        filter="url(#glowOrange)"
                      />
                    ) : (
                      <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#52525b" strokeWidth="14" strokeLinecap="round" />
                    )}

                    <line x1={hipX} y1={hipY} x2="195" y2="165" stroke="#52525b" strokeWidth="11" strokeLinecap="round" />
                    <line x1="195" y1="165" x2="190" y2="210" stroke="#52525b" strokeWidth="10" strokeLinecap="round" />
                    <rect x="180" y="208" width="28" height="4" rx="2" fill="#a1a1aa" />

                    <line x1={shoulderX} y1={shoulderY} x2="190" y2={barY} stroke="#a1a1aa" strokeWidth="6" strokeLinecap="round" />

                    <line x1="110" y1={barY} x2="270" y2={barY} stroke="#e4e4e7" strokeWidth="6" />
                    <rect x="102" y={barY - 18} width="8" height="36" rx="2" fill="#f97316" />
                    <rect x="270" y={barY - 18} width="8" height="36" rx="2" fill="#f97316" />
                  </g>
                );
              })()}
            </g>
          )}

          {/* 6. PULLUPS & LAT MACHINE */}
          {(diagramType === 'pullup' || diagramType === 'lat_pulldown') && (
            <g>
              {(() => {
                const lifterY = 125 - eased * 35;
                return (
                  <g>
                    <line x1="100" y1="40" x2="300" y2="40" stroke="#3f3f46" strokeWidth="6" />
                    <line x1="165" y1="42" x2="185" y2={lifterY - 15} stroke="#a1a1aa" strokeWidth="7" strokeLinecap="round" />
                    <line x1="235" y1="42" x2="215" y2={lifterY - 15} stroke="#a1a1aa" strokeWidth="7" strokeLinecap="round" />

                    <circle cx="200" cy={lifterY - 24} r="10" fill="#71717a" />

                    {showMuscles ? (
                      <path
                        d={`M 180 ${lifterY - 10} L 220 ${lifterY - 10} L 208 ${lifterY + 45} L 192 ${lifterY + 45} Z`}
                        fill="url(#neonOrangeGrad)"
                        filter="url(#glowOrange)"
                      />
                    ) : (
                      <path
                        d={`M 180 ${lifterY - 10} L 220 ${lifterY - 10} L 208 ${lifterY + 45} L 192 ${lifterY + 45} Z`}
                        fill="#52525b"
                      />
                    )}

                    <line x1="200" y1={lifterY + 45} x2="195" y2={lifterY + 95} stroke="#52525b" strokeWidth="8" strokeLinecap="round" />
                    <line x1="200" y1={lifterY + 45} x2="205" y2={lifterY + 95} stroke="#52525b" strokeWidth="8" strokeLinecap="round" />
                  </g>
                );
              })()}
            </g>
          )}

          {/* 7. BICEP CURL / HAMMER CURL */}
          {(diagramType === 'bicep_curl' || diagramType === 'hammer_curl') && (
            <g>
              {(() => {
                const handAngle = eased * Math.PI * 0.65;
                const elbowX = 185;
                const elbowY = 125;
                const handX = elbowX + Math.sin(handAngle) * 35;
                const handY = elbowY - Math.cos(handAngle) * 35;

                return (
                  <g>
                    <rect x="175" y="208" width="40" height="4" rx="2" fill="#a1a1aa" />
                    <line x1="195" y1="210" x2="195" y2="150" stroke="#52525b" strokeWidth="10" strokeLinecap="round" />
                    <line x1="195" y1="150" x2="195" y2="90" stroke="#52525b" strokeWidth="15" strokeLinecap="round" />
                    <circle cx="195" cy="75" r="10" fill="#71717a" />

                    {/* Upper arm */}
                    <line x1="190" y1="95" x2={elbowX} y2={elbowY} stroke="#71717a" strokeWidth="8" strokeLinecap="round" />

                    {/* Forearm flexing up */}
                    <line x1={elbowX} y1={elbowY} x2={handX} y2={handY} stroke="#a1a1aa" strokeWidth="7" strokeLinecap="round" />

                    {/* Bicep muscle peak highlight */}
                    {showMuscles && (
                      <ellipse
                        cx="188"
                        cy="110"
                        rx={6 + eased * 3}
                        ry="9"
                        fill="url(#neonOrangeGrad)"
                        filter="url(#glowOrange)"
                      />
                    )}

                    {/* Dumbbell in hand */}
                    <circle cx={handX} cy={handY} r="7" fill="#f97316" />

                    {showTrajectory && (
                      <path
                        d={`M 185 160 A 35 35 0 0 1 ${handX} ${handY}`}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        markerEnd="url(#techArrow)"
                      />
                    )}
                  </g>
                );
              })()}
            </g>
          )}

          {/* 8. DIP / PARALLEL BARS */}
          {diagramType === 'dip' && (
            <g>
              {(() => {
                const lifterY = 100 + eased * 40;
                return (
                  <g>
                    {/* Parallel Bars */}
                    <line x1="130" y1="120" x2="130" y2="210" stroke="#3f3f46" strokeWidth="6" />
                    <line x1="270" y1="120" x2="270" y2="210" stroke="#3f3f46" strokeWidth="6" />
                    <line x1="110" y1="120" x2="290" y2="120" stroke="#71717a" strokeWidth="6" />

                    {/* Body dipping down */}
                    <circle cx="190" cy={lifterY - 20} r="10" fill="#71717a" />
                    <line x1="190" y1={lifterY - 10} x2="205" y2={lifterY + 50} stroke="#52525b" strokeWidth="16" strokeLinecap="round" />

                    {/* Arms on bars */}
                    <path
                      d={`M 150 120 L 175 ${lifterY} L 190 ${lifterY - 5}`}
                      fill="none"
                      stroke="#a1a1aa"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />

                    {showMuscles && (
                      <path
                        d={`M 185 ${lifterY + 5} L 205 ${lifterY + 25}`}
                        stroke="url(#neonOrangeGrad)"
                        strokeWidth={10}
                        strokeLinecap="round"
                        filter="url(#glowOrange)"
                      />
                    )}
                  </g>
                );
              })()}
            </g>
          )}

          {/* 9. DEFAULT / OTHER MOVEMENTS (ROW, OVERHEAD, EXTENSIONS, CALF) */}
          {diagramType !== 'pushup' &&
            diagramType !== 'plank' &&
            diagramType !== 'bench_press' &&
            diagramType !== 'incline_bench' &&
            diagramType !== 'squat' &&
            diagramType !== 'leg_press' &&
            diagramType !== 'lunges' &&
            diagramType !== 'deadlift' &&
            diagramType !== 'pullup' &&
            diagramType !== 'lat_pulldown' &&
            diagramType !== 'bicep_curl' &&
            diagramType !== 'hammer_curl' &&
            diagramType !== 'dip' && (
              <g>
                {(() => {
                  const shift = eased * 35;
                  return (
                    <g>
                      <circle cx="200" cy="70" r="11" fill="#71717a" />
                      <line x1="200" y1="82" x2="200" y2="150" stroke="#52525b" strokeWidth="18" strokeLinecap="round" />

                      {showMuscles && (
                        <circle cx="200" cy="110" r="15" fill="url(#neonOrangeGrad)" filter="url(#glowOrange)" />
                      )}

                      <line x1="190" y1="95" x2={160 - shift} y2={125 - shift} stroke="#a1a1aa" strokeWidth="8" strokeLinecap="round" />
                      <line x1="210" y1="95" x2={240 + shift} y2={125 - shift} stroke="#a1a1aa" strokeWidth="8" strokeLinecap="round" />

                      <circle cx={160 - shift} cy={125 - shift} r="8" fill="#f97316" />
                      <circle cx={240 + shift} cy={125 - shift} r="8" fill="#f97316" />

                      <line x1="195" y1="150" x2="190" y2="210" stroke="#52525b" strokeWidth="10" strokeLinecap="round" />
                      <line x1="205" y1="150" x2="210" y2="210" stroke="#52525b" strokeWidth="10" strokeLinecap="round" />
                      <rect x="180" y="208" width="40" height="4" rx="2" fill="#a1a1aa" />
                    </g>
                  );
                })()}
              </g>
            )}
        </svg>
      </div>

      {/* Scrubbing & Phase Navigation */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 space-y-2">
        {/* Timeline Bar */}
        <div className="relative w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-orange-500 transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Phase Buttons */}
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
          {[
            { phase: 'setup', label: '1. Setup', prog: 0.05 },
            { phase: 'eccentric', label: '2. Discesa', prog: 0.30 },
            { phase: 'inflection', label: '3. Fermo', prog: 0.55 },
            { phase: 'concentric', label: '4. Risalita', prog: 0.80 },
          ].map((item) => (
            <button
              key={item.phase}
              type="button"
              onClick={() => jumpToPhase(item.prog)}
              className={`py-1 rounded text-center transition-colors truncate ${
                currentPhase === item.phase
                  ? 'bg-orange-600 text-white font-bold'
                  : 'bg-black text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Technical Cue Card */}
        <div className="p-2.5 bg-black rounded-xl border border-zinc-800 flex items-start gap-2 text-xs">
          <div className="w-4 h-4 rounded bg-orange-950/80 border border-orange-500/50 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[9px] font-bold">
            !
          </div>
          <div>
            <div className="font-bold text-white text-[11px] font-mono">{phaseLabel}</div>
            <div className="text-zinc-400 text-[10px] sm:text-[11px] mt-0.5 leading-snug">{phaseDescription}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span className="text-xs">{isPlaying ? 'Pausa' : 'Avvia'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProgress(0);
                setIsPlaying(true);
              }}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Ricomincia ciclo"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setShowTrajectory(!showTrajectory)}
              className={`px-2 py-1 rounded-lg border transition-colors ${
                showTrajectory
                  ? 'bg-orange-950/60 border-orange-600 text-orange-400 font-bold'
                  : 'bg-black border-zinc-800 text-zinc-500'
              }`}
            >
              Vettori
            </button>
            <button
              type="button"
              onClick={() => setShowMuscles(!showMuscles)}
              className={`px-2 py-1 rounded-lg border transition-colors ${
                showMuscles
                  ? 'bg-orange-950/60 border-orange-600 text-orange-400 font-bold'
                  : 'bg-black border-zinc-800 text-zinc-500'
              }`}
            >
              Muscoli
            </button>
            <button
              type="button"
              onClick={() => setShowAngles(!showAngles)}
              className={`px-2 py-1 rounded-lg border transition-colors ${
                showAngles
                  ? 'bg-orange-950/60 border-orange-600 text-orange-400 font-bold'
                  : 'bg-black border-zinc-800 text-zinc-500'
              }`}
            >
              Gradi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
