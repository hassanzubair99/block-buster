import React from 'react';
import { X, Star, Lock, Play } from 'lucide-react';
import { LevelConfig, LevelProgress } from '../types';

interface LevelSelectModalProps {
  levels: LevelConfig[];
  progress: Record<number, LevelProgress>;
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  progress,
  currentLevelId,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm select-none animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200">
          <div>
            <h2 className="text-2xl font-black text-stone-800 tracking-tight">
              SELECT LEVEL
            </h2>
            <p className="text-xs font-bold text-stone-500">
              Pick an unlocked level to challenge
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-stone-400 hover:text-stone-700 bg-white rounded-full border border-amber-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 overflow-y-auto pr-1">
          {levels.map((lvl) => {
            const lvlProgress = progress[lvl.id] || { unlocked: lvl.id === 1, stars: 0, highScore: 0 };
            const isUnlocked = lvlProgress.unlocked;
            const isCurrent = lvl.id === currentLevelId;

            return (
              <button
                key={lvl.id}
                id={`level-btn-${lvl.id}`}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(lvl.id)}
                className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border-2 transition-all duration-150 text-center ${
                  isUnlocked
                    ? isCurrent
                      ? 'bg-amber-300 border-amber-500 shadow-md scale-105 cursor-pointer'
                      : 'bg-white hover:bg-amber-100/60 border-amber-200 shadow-sm active:scale-95 cursor-pointer'
                    : 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Level Number */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[11px] font-bold text-stone-500">
                    LVL
                  </span>
                  {isUnlocked ? (
                    <Play className="w-3 h-3 text-amber-600 fill-amber-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-stone-400" />
                  )}
                </div>

                <div className="text-2xl font-black text-stone-800 my-1">
                  {lvl.id}
                </div>

                <div className="text-[10px] font-bold text-stone-600 truncate w-full mb-2">
                  {lvl.name}
                </div>

                {/* Stars earned */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3 h-3 ${
                        lvlProgress.stars >= starIdx
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-stone-200 text-stone-300'
                      }`}
                    />
                  ))}
                </div>

                {lvlProgress.highScore > 0 && (
                  <span className="text-[9px] font-bold text-amber-700 mt-1">
                    {lvlProgress.highScore.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
