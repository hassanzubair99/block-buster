import React from 'react';
import { Play, Grid, Volume2, VolumeX, Music, Music2, Trophy, HelpCircle } from 'lucide-react';
import { IsometricBlock } from './IsometricBlock';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenLevels: () => void;
  onOpenHelp: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  totalStars: number;
  highestLevelUnlocked: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenLevels,
  onOpenHelp,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  totalStars,
  highestLevelUnlocked,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-6 select-none bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-100/60 overflow-hidden">
      {/* Background playful pastel blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Progress and Audio */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-amber-200 shadow-sm">
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-xs font-black text-stone-700">
            {totalStars} Stars • Level {highestLevelUnlocked}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            aria-label="Toggle sound"
            className="p-2 bg-white/80 hover:bg-white text-stone-700 rounded-full border border-amber-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>
          <button
            onClick={onToggleMusic}
            aria-label="Toggle music"
            className="p-2 bg-white/80 hover:bg-white text-stone-700 rounded-full border border-amber-200 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            {musicEnabled ? <Music className="w-4 h-4 text-purple-600" /> : <Music2 className="w-4 h-4 text-stone-400" />}
          </button>
        </div>
      </div>

      {/* Hero Section: Game Logo & 3D Character Cubes */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center">
        {/* Animated 3D Showcase Cubes */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6">
          <div className="animate-bounce" style={{ animationDelay: '0ms' }}>
            <IsometricBlock
              block={{
                id: 'preview-yellow',
                row: 0,
                col: 0,
                color: 'yellow',
                special: 'none',
                obstacle: 'none',
              }}
              size={56}
              onClick={() => {}}
            />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '150ms' }}>
            <IsometricBlock
              block={{
                id: 'preview-pink',
                row: 0,
                col: 1,
                color: 'pink',
                special: 'none',
                obstacle: 'none',
              }}
              size={56}
              onClick={() => {}}
            />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '300ms' }}>
            <IsometricBlock
              block={{
                id: 'preview-blue',
                row: 0,
                col: 2,
                color: 'blue',
                special: 'none',
                obstacle: 'none',
              }}
              size={56}
              onClick={() => {}}
            />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '450ms' }}>
            <IsometricBlock
              block={{
                id: 'preview-purple',
                row: 0,
                col: 3,
                color: 'purple',
                special: 'none',
                obstacle: 'none',
              }}
              size={56}
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Title Badge */}
        <div className="inline-block bg-white/95 backdrop-blur-sm px-6 py-4 rounded-3xl border-4 border-amber-300 shadow-xl mb-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
            BLOCK MATCH 3D
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 shadow-sm">
              120 LEVELS
            </span>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-700 shadow-sm">
              DARK BOX ARENA
            </span>
          </div>
          <p className="text-xs font-bold text-stone-500 tracking-wider uppercase mt-1">
            Dynamic 3D Arenas • 6x6 to 10x10 Grids
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-64 max-w-xs mt-4">
          <button
            id="start-play-button"
            onClick={onStartGame}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-lg rounded-2xl shadow-lg border-2 border-white active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>PLAY NOW</span>
          </button>

          <button
            id="open-levels-button"
            onClick={onOpenLevels}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-white hover:bg-stone-50 text-stone-800 font-bold text-base rounded-2xl shadow-md border-2 border-amber-200 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-amber-600" />
            <span>LEVEL SELECT</span>
          </button>

          <button
            id="open-help-button"
            onClick={onOpenHelp}
            className="flex items-center justify-center gap-1.5 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs tracking-wide cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] font-bold text-stone-500 tracking-wider uppercase z-10">
        Casual 3D Block Puzzle • Match 3+ Connected Blocks
      </div>
    </div>
  );
};
