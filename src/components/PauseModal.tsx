import React from 'react';
import { Play, RotateCcw, Grid, X, Volume2, VolumeX, Music, Music2, Zap, Flame, Sparkles, HelpCircle } from 'lucide-react';
import { LevelConfig } from '../types';

interface PauseModalProps {
  level: LevelConfig;
  onResume: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  level,
  onResume,
  onRestart,
  onLevelSelect,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200">
          <div>
            <h2 className="text-xl font-black text-stone-800">GAME PAUSED</h2>
            <p className="text-xs font-bold text-stone-500">
              Level {level.id}: {level.name}
            </p>
          </div>
          <button
            onClick={onResume}
            aria-label="Resume"
            className="p-2 text-stone-400 hover:text-stone-700 bg-white rounded-full border border-amber-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Toggles Row */}
        <div className="flex items-center justify-around py-3 bg-white/70 rounded-2xl border border-amber-200/80 my-3">
          <button
            onClick={onToggleSound}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs text-stone-700 hover:bg-amber-100/50 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <div className="h-4 w-px bg-amber-200" />

          <button
            onClick={onToggleMusic}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs text-stone-700 hover:bg-amber-100/50 transition-colors cursor-pointer"
          >
            {musicEnabled ? <Music className="w-4 h-4 text-purple-600" /> : <Music2 className="w-4 h-4 text-stone-400" />}
            <span>Music: {musicEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* How to Play Mini Guide */}
        <div className="bg-white/80 rounded-2xl p-3 border border-amber-200 mb-4 flex flex-col gap-2">
          <span className="flex items-center gap-1 text-xs font-black text-amber-800 uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Special Block Rules
          </span>

          <div className="grid grid-cols-1 gap-1.5 text-xs text-stone-700">
            <div className="flex items-center gap-2 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
              <span className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xs shrink-0">
                3
              </span>
              <span><strong>3+ Match:</strong> Connect 3+ same color blocks to pop & score!</span>
            </div>

            <div className="flex items-center gap-2 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
              <span className="w-6 h-6 rounded-lg bg-orange-400 text-white flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </span>
              <span><strong>Match 4:</strong> Creates <em>Line Blast</em> (clears entire row or col)</span>
            </div>

            <div className="flex items-center gap-2 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
              <span className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" />
              </span>
              <span><strong>Match 5:</strong> Creates <em>Bomb</em> (explodes in 3x3 radius)</span>
            </div>

            <div className="flex items-center gap-2 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
              <span className="w-6 h-6 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <span><strong>Match 6+:</strong> Creates <em>Color Blast</em> (destroys all blocks of that color!)</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="resume-game-button"
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-base rounded-2xl shadow-md border-2 border-white active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RESUME GAME</span>
          </button>

          <div className="flex gap-2">
            <button
              id="pause-restart-button"
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm rounded-xl border border-stone-200 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              id="pause-levels-button"
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
