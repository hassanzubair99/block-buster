import React from 'react';
import { RotateCcw, Grid, AlertCircle } from 'lucide-react';
import { LevelConfig } from '../types';

interface GameOverModalProps {
  level: LevelConfig;
  score: number;
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  onRetry,
  onLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-50 to-orange-50 rounded-3xl p-6 shadow-2xl border-4 border-rose-300 text-center flex flex-col items-center">
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-lg px-6 py-2 rounded-2xl shadow-lg border-2 border-white -mt-10 mb-3 tracking-wider">
          OUT OF MOVES!
        </div>

        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center my-2 text-rose-600">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-stone-800">
          So close! Give it another shot!
        </h3>
        <p className="text-xs font-bold text-stone-500 mb-4">
          Level {level.id}: {level.name}
        </p>

        {/* Stats */}
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-200 mb-5 flex flex-col gap-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-stone-600 font-bold">
            <span>Score Reached</span>
            <span className="text-stone-900 font-black">{score.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-stone-600 font-bold">
            <span>Target Goal</span>
            <span className="text-amber-700 font-black">{level.targetScore.toLocaleString()} PTS</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            id="retry-level-button"
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base rounded-2xl shadow-lg border-2 border-white active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>

          <button
            id="levels-from-gameover-button"
            onClick={onLevelSelect}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Grid className="w-4 h-4 text-amber-600" />
            <span>Select Level</span>
          </button>
        </div>
      </div>
    </div>
  );
};
