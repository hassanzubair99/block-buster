import React from 'react';
import { RotateCcw, Lightbulb, Volume2, VolumeX, Music, Music2, Sparkles, Zap, Flame } from 'lucide-react';
import { Block, BlockColor, LevelConfig } from '../types';

interface BottomHUDProps {
  level: LevelConfig;
  selectedCluster: Block[];
  onConfirmBlast: () => void;
  onRestartClick: () => void;
  onHintClick: () => void;
  onShuffleClick: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  currentCombo: number;
  remainingGoalItems?: Partial<Record<BlockColor | 'ice' | 'crate', number>>;
}

const COLOR_EMOJIS: Record<BlockColor, string> = {
  yellow: '⭐',
  pink: '💖',
  blue: '😎',
  purple: '✨',
  orange: '🔥',
  green: '🍀',
};

export const BottomHUD: React.FC<BottomHUDProps> = ({
  level,
  selectedCluster,
  onConfirmBlast,
  onRestartClick,
  onHintClick,
  onShuffleClick,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  currentCombo,
  remainingGoalItems,
}) => {
  const matchCount = selectedCluster.length;
  const isMatchValid = matchCount >= 3 || (matchCount > 0 && selectedCluster[0].special !== 'none');

  // Special reward preview
  let rewardBadge = null;
  if (matchCount >= 6) {
    rewardBadge = (
      <span className="flex items-center gap-1 text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full animate-bounce">
        <Sparkles className="w-3.5 h-3.5" /> COLOR BLAST!
      </span>
    );
  } else if (matchCount === 5) {
    rewardBadge = (
      <span className="flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full animate-bounce">
        <Flame className="w-3.5 h-3.5" /> BOMB BLAST!
      </span>
    );
  } else if (matchCount === 4) {
    rewardBadge = (
      <span className="flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full animate-bounce">
        <Zap className="w-3.5 h-3.5" /> LINE BLAST!
      </span>
    );
  }

  return (
    <footer className="w-full max-w-xl mx-auto px-4 pb-4 pt-1 select-none flex flex-col gap-2">
      {/* Combo Banner if active */}
      {currentCombo > 1 && (
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-black text-xs sm:text-sm px-4 py-1 rounded-full shadow-lg border-2 border-white animate-bounce flex items-center gap-1.5 tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            COMBO x{currentCombo}! (+{currentCombo * 20}% BONUS)
          </div>
        </div>
      )}

      {/* Goal Items / Objective Box */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl p-2.5 shadow-sm border border-amber-200/70 flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="font-bold text-stone-500 uppercase text-[11px] tracking-wider whitespace-nowrap">
            Goal:
          </span>

          {level.targetType === 'score' && (
            <span className="font-bold text-stone-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              Reach <strong className="text-amber-700">{level.targetScore.toLocaleString()}</strong> PTS
            </span>
          )}

          {level.targetType === 'collect_colors' && remainingGoalItems && (
            <div className="flex items-center gap-2">
              {Object.entries(remainingGoalItems).map(([itemKey, count]) => (
                <div
                  key={itemKey}
                  className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-bold text-stone-700"
                >
                  <span>{COLOR_EMOJIS[itemKey as BlockColor] || itemKey}</span>
                  <span className={count === 0 ? 'text-emerald-600 line-through' : 'text-stone-900'}>
                    {count === 0 ? 'Done' : `${count} left`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {level.targetType === 'break_ice' && (
            <div className="flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 font-bold text-sky-800">
              <span>❄️ Break Ice:</span>
              <span className="text-sky-950 font-black">
                {remainingGoalItems?.ice !== undefined ? `${remainingGoalItems.ice} left` : 'Clear all'}
              </span>
            </div>
          )}

          {level.targetType === 'clear_crates' && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-bold text-amber-900">
              <span>📦 Crates:</span>
              <span className="text-amber-950 font-black">
                {remainingGoalItems?.crate !== undefined ? `${remainingGoalItems.crate} left` : 'Clear all'}
              </span>
            </div>
          )}
        </div>

        {/* Action button if valid match selected */}
        {isMatchValid ? (
          <button
            id="blast-action-button"
            onClick={onConfirmBlast}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all duration-150 cursor-pointer animate-pulse whitespace-nowrap"
          >
            <span>POP {matchCount}!</span>
            {rewardBadge}
          </button>
        ) : (
          <span className="text-[11px] font-bold text-amber-800/80 hidden sm:inline-block">
            ✨ Click 3+ same colors to pop!
          </span>
        )}
      </div>

      {/* Control Utility Toolbar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left tools: Hint & Shuffle */}
        <div className="flex items-center gap-1.5">
          <button
            id="hint-button"
            onClick={onHintClick}
            title="Get a hint"
            className="flex items-center gap-1 px-3 py-2 bg-white/80 hover:bg-white text-stone-700 hover:text-amber-600 rounded-xl shadow-sm border border-stone-200 text-xs font-bold active:scale-95 transition-all cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Hint</span>
          </button>

          <button
            id="shuffle-button"
            onClick={onShuffleClick}
            title="Shuffle board"
            className="flex items-center gap-1 px-3 py-2 bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 rounded-xl shadow-sm border border-stone-200 text-xs font-bold active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Shuffle</span>
          </button>

          <button
            id="restart-button"
            onClick={onRestartClick}
            title="Restart level"
            className="p-2 bg-white/80 hover:bg-white text-stone-700 hover:text-rose-600 rounded-xl shadow-sm border border-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right audio tools: SFX & Music */}
        <div className="flex items-center gap-1.5">
          <button
            id="sound-toggle-button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
            className="p-2 bg-white/80 hover:bg-white text-stone-700 rounded-xl shadow-sm border border-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          <button
            id="music-toggle-button"
            onClick={onToggleMusic}
            aria-label={musicEnabled ? 'Stop music' : 'Play music'}
            title={musicEnabled ? 'Music ON' : 'Music OFF'}
            className="p-2 bg-white/80 hover:bg-white text-stone-700 rounded-xl shadow-sm border border-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            {musicEnabled ? (
              <Music className="w-4 h-4 text-purple-600" />
            ) : (
              <Music2 className="w-4 h-4 text-stone-400" />
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};
