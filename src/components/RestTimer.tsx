import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, GripHorizontal } from 'lucide-react';

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

  // Position state (null means default position in viewport)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemaining(initialSeconds);
    setIsActive(true);
  }, [initialSeconds, isOpen]);

  // Set default initial position on first open if not set
  useEffect(() => {
    if (isOpen && position === null && typeof window !== 'undefined') {
      const defaultX = Math.max(16, window.innerWidth - 280);
      const defaultY = Math.max(70, window.innerHeight - 230);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [isOpen, position]);

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

  // Drag handlers
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    const currentX = position?.x ?? (window.innerWidth - 280);
    const currentY = position?.y ?? (window.innerHeight - 230);
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialPosX: currentX,
      initialPosY: currentY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header or grip handle
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const touch = e.touches[0];
    handleStartDrag(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(8, Math.min(window.innerWidth - 270, dragRef.current.initialPosX + dx));
      const newY = Math.max(50, Math.min(window.innerHeight - 170, dragRef.current.initialPosY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent page scrolling during drag
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;
      const newX = Math.max(8, Math.min(window.innerWidth - 270, dragRef.current.initialPosX + dx));
      const newY = Math.max(50, Math.min(window.innerHeight - 170, dragRef.current.initialPosY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleEndDrag = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEndDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [isDragging]);

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

  const stylePos = position
    ? { left: `${position.x}px`, top: `${position.y}px` }
    : { right: '16px', bottom: '85px' };

  return (
    <div
      ref={cardRef}
      style={{
        ...stylePos,
        touchAction: isDragging ? 'none' : 'auto',
      }}
      className={`fixed z-50 bg-zinc-950/95 backdrop-blur border border-zinc-700/80 rounded-2xl shadow-2xl p-3.5 w-64 text-zinc-100 flex flex-col gap-2 transition-shadow select-none ${
        isDragging ? 'shadow-accent/30 ring-2 ring-accent scale-[1.02]' : 'shadow-black/70'
      }`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between pb-1.5 border-b border-zinc-800 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 text-zinc-400">
          <GripHorizontal size={16} className="text-zinc-500 hover:text-zinc-300" />
          <span className="font-bold uppercase tracking-wider text-accent text-[11px]">
            Timer Recupero
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          title="Chiudi timer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Countdown display in seconds */}
      <div className="flex items-baseline justify-center py-0.5">
        <span className={`text-4xl font-extrabold tracking-tight transition-colors ${
          remaining <= 5 ? 'text-accent animate-pulse' : 'text-white'
        }`}>
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
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 flex items-center transition-colors"
          >
            -15s
          </button>
          <button
            onClick={() => addTime(15)}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 flex items-center transition-colors"
          >
            +15s
          </button>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                : 'bg-accent hover:opacity-90 text-white shadow-lg'
            }`}
            title={isActive ? 'Pausa' : 'Avvia'}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs transition-colors"
            title="Azzera tempo"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
