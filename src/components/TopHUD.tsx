import React from 'react';
import { Pause, Star } from 'lucide-react';
import { LevelConfig } from '../types';

interface TopHUDProps {
  level: LevelConfig;
  score: number;
  movesRemaining: number;
  onPauseClick: () => void;
  onOpenLevels?: () => void;
  targetProgressPercent: number;
  starsEarned: number;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  level,
  score,
  movesRemaining,
  onPauseClick,
  onOpenLevels,
  targetProgressPercent,
  starsEarned,
}) => {
  const isMovesLow = movesRemaining <= 4;

  return (
    <header className="w-full max-w-xl mx-auto px-4 pt-3 pb-2 select-none">
      {/* Top row: Level title & Pause button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLevels}
            title="Open Level Selection"
            className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-3 py-1 rounded-xl text-xs sm:text-sm shadow-sm border border-amber-300 tracking-wider cursor-pointer active:scale-95 transition-all"
          >
            LEVEL {String(level.id).padStart(2, '0')}
          </button>
          <h1 className="text-stone-800 font-bold text-sm sm:text-base truncate max-w-[180px] sm:max-w-xs drop-shadow-sm">
            {level.name}
          </h1>
        </div>

        <button
          id="pause-button"
          onClick={onPauseClick}
          aria-label="Pause game"
          className="p-2 sm:p-2.5 bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 rounded-2xl shadow-sm border border-stone-200/80 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-stone-700" />
        </button>
      </div>

      {/* Main Stats Card: SCORE & MOVES in premium toy card style */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-3 shadow-md border-2 border-amber-100 flex items-center justify-between gap-2">
        {/* Score display */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-amber-100/80 pr-2">
          <span className="text-[11px] font-bold text-stone-600 tracking-wider uppercase">
            Score
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight transition-all duration-150">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Moves remaining pill */}
        <div className="flex-1 flex flex-col items-center justify-center pl-2">
          <span className="text-[11px] font-bold text-stone-600 tracking-wider uppercase">
            Moves
          </span>
          <div
            className={`flex items-center gap-1 font-black text-xl sm:text-2xl transition-all duration-200 ${
              isMovesLow
                ? 'text-rose-600 scale-110 animate-pulse'
                : 'text-stone-800'
            }`}
          >
            <span>{movesRemaining}</span>
          </div>
        </div>

        {/* Star Progress & Target Bar */}
        <div className="flex-[1.2] flex flex-col justify-center gap-1 pl-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
            <span>Goal</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((starNum) => (
                <Star
                  key={starNum}
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    starsEarned >= starNum
                      ? 'fill-amber-400 text-amber-500 scale-110'
                      : 'fill-stone-200 text-stone-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-amber-100/70 h-3 rounded-full overflow-hidden p-0.5 border border-amber-200/60">
            <div
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-inner"
              style={{ width: `${Math.min(100, Math.max(4, targetProgressPercent))}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
