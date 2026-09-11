import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, RotateCcw, Grid, Trophy } from 'lucide-react';
import { LevelConfig } from '../types';

interface LevelCompleteModalProps {
  level: LevelConfig;
  score: number;
  movesRemaining: number;
  stars: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  score,
  movesRemaining,
  stars,
  onNextLevel,
  onReplay,
  onLevelSelect,
  hasNextLevel,
}) => {
  const movesBonus = movesRemaining * 150;
  const totalScore = score + movesBonus;

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#F43F5E', '#0EA5E9', '#A855F7', '#22C55E', '#FB923C'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-100/90 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center">
        {/* Ribbon Header */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white font-black text-lg px-6 py-2 rounded-2xl shadow-lg border-2 border-white -mt-10 mb-3 tracking-wider">
          LEVEL COMPLETE!
        </div>

        <h3 className="text-xl font-black text-stone-800 tracking-tight">
          Level {level.id}: {level.name}
        </h3>

        {/* 3 Stars Animation */}
        <div className="flex items-center justify-center gap-3 my-4">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`transition-all duration-500 transform ${
                stars >= starIdx
                  ? 'scale-125 animate-bounce text-amber-500'
                  : 'scale-90 text-stone-300'
              }`}
              style={{ animationDelay: `${starIdx * 200}ms` }}
            >
              <Star
                className={`w-10 h-10 ${
                  stars >= starIdx ? 'fill-amber-400 drop-shadow-md' : 'fill-stone-200'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Score & Moves Bonus Breakdown */}
        <div className="w-full bg-white/90 rounded-2xl p-4 shadow-sm border border-amber-200 mb-5 flex flex-col gap-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-stone-600 font-bold">
            <span>Base Score</span>
            <span className="text-stone-900 font-black">{score.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-stone-600 font-bold">
            <span>Moves Left Bonus ({movesRemaining} × 150)</span>
            <span className="text-emerald-600 font-black">+{movesBonus.toLocaleString()}</span>
          </div>

          <div className="border-t border-amber-100 pt-2 flex items-center justify-between text-stone-800 font-black text-base">
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
              Total Score
            </span>
            <span className="text-amber-600 text-lg">{totalScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {hasNextLevel ? (
            <button
              id="next-level-button"
              onClick={onNextLevel}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base rounded-2xl shadow-lg border-2 border-white active:scale-95 transition-all cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="text-sm font-bold text-amber-800 bg-amber-200/80 p-2.5 rounded-xl border border-amber-300">
              🎉 Congratulations! You have conquered all levels!
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              id="replay-level-button"
              onClick={onReplay}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              id="select-level-button"
              onClick={onLevelSelect}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Grid className="w-4 h-4 text-amber-600" />
              <span>Levels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
