import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

interface RestTimerProps {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  isOpen,
  onClose,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemaining(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && remaining > 0) {
      interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (remaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, remaining]);

  if (!isOpen) return null;

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  const addTime = (delta: number) => {
    setRemaining((prev) => Math.max(0, prev + delta));
    setTotalSeconds((prev) => Math.max(prev, remaining + delta));
  };

  const resetTimer = () => {
    setRemaining(totalSeconds);
    setIsActive(true);
  };

  return (
    <div className="fixed bottom-20 md:bottom-5 right-4 z-40 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 w-64 text-zinc-100 flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800">
        <span className="font-bold uppercase tracking-wider text-accent text-[11px]">
          Recupero
        </span>
        <button onClick={onClose} className="text-zinc-500 hover:text-white p-0.5">
          <X size={16} />
        </button>
      </div>

      {/* Countdown display in seconds */}
      <div className="flex items-baseline justify-center py-1">
        <span className="text-4xl font-extrabold tracking-tight text-white">
          {remaining}<span className="text-xl font-normal text-zinc-400 ml-0.5">s</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>

      {/* Quick modifiers and controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1.5">
          <button
            onClick={() => addTime(-15)}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 flex items-center"
          >
            -15s
          </button>
          <button
            onClick={() => addTime(15)}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 flex items-center"
          >
            +15s
          </button>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`p-2 rounded-lg text-xs font-semibold ${
              isActive
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                : 'bg-accent hover:opacity-90 text-white'
            }`}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs"
            title="Azzera"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
