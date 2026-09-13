import React, { useState } from 'react';
import { X, Star, Lock, Play, Sparkles, Target, Palette, Snowflake, Package } from 'lucide-react';
import { LevelConfig, LevelProgress } from '../types';
import { CHAPTERS, getChapterForLevel } from '../utils/levels';

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
  const currentChapter = getChapterForLevel(currentLevelId);
  const [activeChapterId, setActiveChapterId] = useState<number>(currentChapter.id);

  const activeChapter = CHAPTERS.find((c) => c.id === activeChapterId) || CHAPTERS[0];
  const chapterLevels = levels.filter(
    (lvl) => lvl.id >= activeChapter.startLevel && lvl.id <= activeChapter.endLevel
  );

  // Calculate stars earned in this chapter
  const chapterStars = chapterLevels.reduce(
    (acc, lvl) => acc + (progress[lvl.id]?.stars || 0),
    0
  );
  const maxChapterStars = chapterLevels.length * 3;

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'collect_colors':
        return <Palette className="w-3 h-3 text-pink-500" />;
      case 'break_ice':
        return <Snowflake className="w-3 h-3 text-cyan-500" />;
      case 'clear_crates':
        return <Package className="w-3 h-3 text-amber-700" />;
      default:
        return <Target className="w-3 h-3 text-emerald-500" />;
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'boss':
        return (
          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-purple-600 text-white shadow-sm">
            BOSS
          </span>
        );
      case 'hard':
        return (
          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-500 text-white">
            HARD
          </span>
        );
      case 'medium':
        return (
          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-amber-500 text-white">
            MED
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-emerald-500 text-white">
            EASY
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1E2536] via-[#161B26] to-[#0E121B] rounded-3xl p-5 shadow-2xl border-2 border-slate-700/80 flex flex-col max-h-[92vh] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{activeChapter.icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                LEVEL SELECT
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  120 LEVELS
                </span>
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Choose a world and conquer every 3D challenge!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full border border-slate-700 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter / Worlds Horizontal Tabs */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar border-b border-slate-800/80">
          {CHAPTERS.map((ch) => {
            const isActive = ch.id === activeChapterId;
            const hasUnlocked = levels
              .filter((l) => l.id >= ch.startLevel && l.id <= ch.endLevel)
              .some((l) => progress[l.id]?.unlocked);

            return (
              <button
                key={ch.id}
                onClick={() => setActiveChapterId(ch.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-stone-900 border-amber-400 shadow-md font-black scale-102'
                    : hasUnlocked
                    ? 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-400'
                }`}
              >
                <span>{ch.icon}</span>
                <span>{ch.name}</span>
                <span className={`text-[10px] ${isActive ? 'text-stone-900' : 'text-slate-400'}`}>
                  ({ch.startLevel}-{ch.endLevel})
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Chapter Details Bar */}
        <div className="flex items-center justify-between py-2 px-3 my-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-400">{activeChapter.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-semibold">{activeChapter.gridDescription}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>
              {chapterStars} / {maxChapterStars}
            </span>
          </div>
        </div>

        {/* Levels Grid (Scrollable) */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 py-2 overflow-y-auto pr-1 flex-1">
          {chapterLevels.map((lvl) => {
            const lvlProgress = progress[lvl.id] || {
              unlocked: lvl.id === 1,
              stars: 0,
              highScore: 0,
            };
            const isUnlocked = lvlProgress.unlocked;
            const isCurrent = lvl.id === currentLevelId;

            return (
              <button
                key={lvl.id}
                id={`level-btn-${lvl.id}`}
                disabled={!isUnlocked}
                onClick={() => onSelectLevel(lvl.id)}
                className={`relative flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all duration-150 text-center ${
                  isUnlocked
                    ? isCurrent
                      ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-stone-900 border-amber-300 shadow-lg shadow-amber-500/30 scale-102 cursor-pointer font-bold'
                      : 'bg-slate-800/90 hover:bg-slate-700/90 text-white border-slate-700 shadow-sm active:scale-95 cursor-pointer'
                    : 'bg-slate-900/50 border-slate-800/60 text-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Level Top Badges */}
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1">
                    {getTargetIcon(lvl.targetType)}
                    <span className="text-[10px] font-bold opacity-80">
                      {lvl.rows}x{lvl.cols}
                    </span>
                  </div>
                  {isUnlocked ? (
                    isCurrent ? (
                      <Sparkles className="w-3.5 h-3.5 text-stone-900 fill-stone-900" />
                    ) : (
                      getDifficultyBadge(lvl.difficulty)
                    )
                  ) : (
                    <Lock className="w-3 h-3 text-slate-500" />
                  )}
                </div>

                {/* Level Number */}
                <div
                  className={`text-xl font-black my-0.5 ${
                    isCurrent ? 'text-stone-950' : 'text-white'
                  }`}
                >
                  {lvl.id}
                </div>

                {/* Level Name */}
                <div
                  className={`text-[9px] font-semibold truncate w-full mb-1.5 ${
                    isCurrent ? 'text-stone-900' : 'text-slate-300'
                  }`}
                >
                  {lvl.name}
                </div>

                {/* Stars earned */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3 h-3 ${
                        lvlProgress.stars >= starIdx
                          ? isCurrent
                            ? 'fill-stone-950 text-stone-950'
                            : 'fill-amber-400 text-amber-400'
                          : isCurrent
                          ? 'fill-amber-600/50 text-amber-700/50'
                          : 'fill-slate-700 text-slate-600'
                      }`}
                    />
                  ))}
                </div>

                {lvlProgress.highScore > 0 && (
                  <span
                    className={`text-[8px] font-bold mt-1 ${
                      isCurrent ? 'text-stone-950' : 'text-amber-400'
                    }`}
                  >
                    {lvlProgress.highScore.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Jump Bar for Current Level */}
        <div className="pt-3 mt-1 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Current: Level {currentLevelId} ({currentChapter.name})
          </span>
          <button
            onClick={() => onSelectLevel(currentLevelId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-stone-900" />
            Play Current Level
          </button>
        </div>
      </div>
    </div>
  );
};
