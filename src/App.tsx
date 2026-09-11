/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Block,
  BlockColor,
  GameScreen,
  LevelProgress,
  Particle,
  FloatingTextItem,
} from './types';
import { LEVELS } from './utils/levels';
import {
  initializeBoard,
  findConnectedCluster,
  hasValidMoves,
  findHintMatch,
  shuffleBoard,
  getSpecialCreatedForMatch,
  getSpecialBlastTargets,
  findAdjacentDamagedObstacles,
  applyGravityAndRefill,
  getUniqueBlockId,
} from './utils/gameLogic';
import { sound } from './audio/soundManager';
import { GameBoard3D } from './components/GameBoard3D';
import { TopHUD } from './components/TopHUD';
import { BottomHUD } from './components/BottomHUD';
import { StartScreen } from './components/StartScreen';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<GameScreen>('start');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Audio settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.getSoundEnabled());
  const [musicEnabled, setMusicEnabled] = useState<boolean>(sound.getMusicEnabled());

  // Game Board & Play State
  const currentLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  const [grid, setGrid] = useState<(Block | null)[][]>(() => initializeBoard(currentLevel));
  const [score, setScore] = useState<number>(0);
  const [movesRemaining, setMovesRemaining] = useState<number>(currentLevel.maxMoves);
  const [selectedCluster, setSelectedCluster] = useState<Block[]>([]);
  const [hoveredCluster, setHoveredCluster] = useState<Block[]>([]);
  const [combo, setCombo] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [hintBlocks, setHintBlocks] = useState<Block[]>([]);

  // Goal tracking (e.g. for color collections or ice)
  const [goalItemsRemaining, setGoalItemsRemaining] = useState<
    Partial<Record<BlockColor | 'ice' | 'crate', number>>
  >({});

  // Visual FX: Particles & Floating Texts
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);

  // Level Progression Storage
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem('bm3d_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initial: Record<number, LevelProgress> = {};
    LEVELS.forEach((l) => {
      initial[l.id] = { unlocked: l.id === 1, highScore: 0, stars: 0 };
    });
    return initial;
  });

  // Combo timer ref
  const comboTimerRef = useRef<number | null>(null);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem('bm3d_progress', JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Audio toggle handlers
  const handleToggleSound = useCallback(() => {
    const newState = sound.toggleSound();
    setSoundEnabled(newState);
  }, []);

  const handleToggleMusic = useCallback(() => {
    const newState = sound.toggleMusic();
    setMusicEnabled(newState);
  }, []);

  // Compute stars earned so far for current level
  const starsEarned = currentLevel
    ? score >= currentLevel.starThresholds[2]
      ? 3
      : score >= currentLevel.starThresholds[1]
      ? 2
      : score >= currentLevel.starThresholds[0]
      ? 1
      : 0
    : 0;

  // Calculate target progress percentage for HUD
  const targetProgressPercent = currentLevel
    ? currentLevel.targetType === 'score'
      ? Math.min(100, Math.round((score / currentLevel.targetScore) * 100))
      : currentLevel.targetType === 'collect_colors' && currentLevel.targetGoals
      ? (() => {
          let totalNeeded = 0;
          let totalRemaining = 0;
          Object.entries(currentLevel.targetGoals).forEach(([k, needed]) => {
            if (needed) {
              totalNeeded += needed;
              totalRemaining += goalItemsRemaining[k as BlockColor] ?? needed;
            }
          });
          const collected = Math.max(0, totalNeeded - totalRemaining);
          return Math.min(100, Math.round((collected / (totalNeeded || 1)) * 100));
        })()
      : currentLevel.targetType === 'break_ice' && currentLevel.targetGoals
      ? (() => {
          const needed = currentLevel.targetGoals.ice || 1;
          const left = goalItemsRemaining.ice ?? needed;
          return Math.min(100, Math.round(((needed - left) / needed) * 100));
        })()
      : Math.min(100, Math.round((score / currentLevel.targetScore) * 100))
    : 0;

  // Start / Load a Level
  const startLevel = useCallback((levelId: number) => {
    const lvl = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    setCurrentLevelId(lvl.id);
    const newGrid = initializeBoard(lvl);
    setGrid(newGrid);
    setScore(0);
    setMovesRemaining(lvl.maxMoves);
    setSelectedCluster([]);
    setHoveredCluster([]);
    setCombo(1);
    setIsProcessing(false);
    setHintBlocks([]);
    setFloatingTexts([]);
    setParticles([]);

    // Initialize goals
    if (lvl.targetGoals) {
      setGoalItemsRemaining({ ...lvl.targetGoals });
    } else {
      setGoalItemsRemaining({});
    }

    setScreen('playing');
  }, []);

  // Add floating text
  const addFloatingText = useCallback(
    (text: string, x: number, y: number, color: string, scale: number = 1) => {
      const id = Date.now() + Math.random();
      setFloatingTexts((prev) => [...prev, { id, text, x, y, color, scale, opacity: 1 }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((ft) => ft.id !== id));
      }, 1200);
    },
    []
  );

  // Spawn particle explosions at isometric position
  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number = 12) => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        newParticles.push({
          id: Math.random() * 1000000,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color,
          size: 4 + Math.random() * 5,
          opacity: 1,
          shape: Math.random() > 0.6 ? 'star' : Math.random() > 0.3 ? 'circle' : 'square',
          life: 0,
          maxLife: 30 + Math.random() * 15,
        });
      }
      setParticles((prev) => [...prev.slice(-40), ...newParticles]);
    },
    []
  );

  // Particles animation tick
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.18, // gravity
            life: p.life + 1,
            opacity: Math.max(0, 1 - p.life / p.maxLife),
          }))
          .filter((p) => p.life < p.maxLife)
      );
    });
    return () => cancelAnimationFrame(interval);
  }, [particles]);

  // Screen shake timer
  const triggerScreenShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 380);
  }, []);

  // Execute Match / Blast of selected blocks
  const executeBlast = useCallback(
    (initialBlocksToClear: Block[], tappedBlock: Block) => {
      if (initialBlocksToClear.length === 0) return;
      setIsProcessing(true);
      setHintBlocks([]);

      const isSpecialActivation = tappedBlock.special !== 'none';
      const matchCount = initialBlocksToClear.length;

      // Check special block creation (earned if normal match >= 4)
      const createdSpecial = isSpecialActivation ? 'none' : getSpecialCreatedForMatch(matchCount);

      // Decrement move counter
      setMovesRemaining((prev) => Math.max(0, prev - 1));

      // Resolve chain reaction if any special blocks are in the match
      const resolvedBlocksMap = new Map<string, Block>();
      initialBlocksToClear.forEach((b) => resolvedBlocksMap.set(b.id, b));

      let triggeredBomb = tappedBlock.special === 'bomb';
      let triggeredColorBlast = tappedBlock.special === 'color_blast';
      let triggeredLine = tappedBlock.special === 'line_horizontal' || tappedBlock.special === 'line_vertical';

      initialBlocksToClear.forEach((b) => {
        if (b.special !== 'none') {
          if (b.special === 'bomb') triggeredBomb = true;
          if (b.special === 'color_blast') triggeredColorBlast = true;
          if (b.special === 'line_horizontal' || b.special === 'line_vertical') triggeredLine = true;
          const { targets } = getSpecialBlastTargets(grid, b);
          targets.forEach((t) => resolvedBlocksMap.set(t.id, t));
        }
      });

      const blocksToClear = Array.from(resolvedBlocksMap.values());
      const totalClearedCount = blocksToClear.length;

      // Scoring calculation
      let basePoints = totalClearedCount * 100;
      if (matchCount === 4) basePoints += 150;
      else if (matchCount === 5) basePoints += 350;
      else if (matchCount >= 6) basePoints += 750;

      const comboMultiplier = 1 + (combo - 1) * 0.25;
      const earnedScore = Math.round(basePoints * comboMultiplier);
      const newScore = score + earnedScore;
      setScore(newScore);

      // Audio feedback & screen shake
      if (triggeredBomb) {
        sound.playBomb();
        triggerScreenShake();
      } else if (triggeredColorBlast) {
        sound.playColorBlast();
        triggerScreenShake();
      } else if (triggeredLine) {
        sound.playLineBlast();
      } else {
        sound.playPop(matchCount, combo);
      }

      // Combo handling
      if (comboTimerRef.current !== null) {
        clearTimeout(comboTimerRef.current);
      }
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > 2) {
        sound.playCombo(nextCombo);
      }
      comboTimerRef.current = window.setTimeout(() => {
        setCombo(1);
      }, 3500);

      // Visual feedback: floating score text
      const tileW = 54;
      const tileH = 31;
      const isoX = (tappedBlock.col - tappedBlock.row) * (tileW / 2);
      const isoY = (tappedBlock.col + tappedBlock.row) * (tileH / 2);

      addFloatingText(
        `+${earnedScore.toLocaleString()}${combo > 1 ? ` (x${combo})` : ''}`,
        isoX,
        isoY - 20,
        '#FBBF24',
        1.1
      );

      // Check for special badges created
      if (createdSpecial !== 'none') {
        setTimeout(() => {
          const badgeName =
            createdSpecial === 'line_horizontal' || createdSpecial === 'line_vertical'
              ? '⚡ LINE BLAST!'
              : createdSpecial === 'bomb'
              ? '💣 BOMB CREATED!'
              : '⭐ RAINBOW BLAST!';
          addFloatingText(badgeName, isoX, isoY - 45, '#A855F7', 1.2);
        }, 220);
      }

      // Spawn burst particles for cleared blocks
      blocksToClear.forEach((b) => {
        const bx = (b.col - b.row) * (tileW / 2);
        const by = (b.col + b.row) * (tileH / 2);
        spawnParticles(bx, by, b.color === 'yellow' ? '#FBBF24' : b.color === 'pink' ? '#F43F5E' : b.color === 'blue' ? '#0EA5E9' : b.color === 'purple' ? '#A855F7' : b.color === 'orange' ? '#F97316' : '#22C55E', 8);
      });

      // Adjacent Obstacle destruction (Ice / Crates)
      const { iceCleared, cratesDamaged } = findAdjacentDamagedObstacles(grid, blocksToClear);
      if (iceCleared.length > 0) {
        sound.playIceBreak();
      }
      if (cratesDamaged.length > 0) {
        sound.playCrateBreak();
      }

      // Update goal items remaining
      setGoalItemsRemaining((prev) => {
        const updated = { ...prev };
        // If collecting colors
        if (currentLevel.targetType === 'collect_colors') {
          blocksToClear.forEach((b) => {
            if (updated[b.color] && updated[b.color]! > 0) {
              updated[b.color] = updated[b.color]! - 1;
            }
          });
        }
        // If breaking ice
        if (currentLevel.targetType === 'break_ice' && iceCleared.length > 0) {
          if (updated.ice !== undefined) {
            updated.ice = Math.max(0, updated.ice - iceCleared.length);
          }
        }
        // If clearing crates
        if (currentLevel.targetType === 'clear_crates' && cratesDamaged.length > 0) {
          if (updated.crate !== undefined) {
            updated.crate = Math.max(0, updated.crate - cratesDamaged.length);
          }
        }
        return updated;
      });

      // Mark matched blocks for pop animation
      const clearIds = new Set(blocksToClear.map((b) => b.id));
      setGrid((prevGrid) =>
        prevGrid.map((row) =>
          row.map((cell) => {
            if (cell && clearIds.has(cell.id)) {
              return { ...cell, isMatched: true };
            }
            return cell;
          })
        )
      );

      // Clear selection & hover
      setSelectedCluster([]);
      setHoveredCluster([]);

      // After pop animation finishes, apply physical gravity & refill
      setTimeout(() => {
        setGrid((prevGrid) => {
          const tempGrid = prevGrid.map((row) =>
            row.map((cell) => {
              if (cell && clearIds.has(cell.id)) {
                // If this is the tapped position and a special was created, leave it!
                if (createdSpecial !== 'none' && cell.row === tappedBlock.row && cell.col === tappedBlock.col) {
                  return {
                    ...cell,
                    id: getUniqueBlockId(),
                    special: createdSpecial,
                    isMatched: false,
                    isSelected: false,
                  };
                }
                return null;
              }
              // If this block had ice and got cleared
              if (cell && iceCleared.some((ice) => ice.id === cell.id)) {
                return { ...cell, obstacle: 'none' };
              }
              // If this block is a crate and got damaged
              if (cell && cratesDamaged.some((crate) => crate.id === cell.id)) {
                return null;
              }
              return cell;
            })
          );

          const { newGrid } = applyGravityAndRefill(tempGrid, currentLevel.colors);
          sound.playLanding();
          return newGrid;
        });

        // Settle time before unlocking input and evaluating game state
        setTimeout(() => {
          setIsProcessing(false);

          // Evaluate Win Condition
          let isLevelWon = false;
          if (currentLevel.targetType === 'score') {
            isLevelWon = newScore >= currentLevel.targetScore;
          } else if (currentLevel.targetType === 'collect_colors') {
            // Check if all goals are 0
            isLevelWon =
              currentLevel.targetGoals !== undefined &&
              Object.keys(currentLevel.targetGoals).every(
                (k) => (goalItemsRemaining[k as BlockColor] ?? 0) <= 0
              );
          } else if (currentLevel.targetType === 'break_ice') {
            isLevelWon = (goalItemsRemaining.ice ?? 1) <= 0;
          } else if (currentLevel.targetType === 'clear_crates') {
            isLevelWon = (goalItemsRemaining.crate ?? 1) <= 0;
          }

          if (isLevelWon) {
            // Calculate Stars
            const remainingMoves = Math.max(0, movesRemaining - 1);
            const finalScore = newScore + remainingMoves * 150;
            const earnedStars =
              finalScore >= currentLevel.starThresholds[2]
                ? 3
                : finalScore >= currentLevel.starThresholds[1]
                ? 2
                : 1;

            sound.playWin();

            // Update Progression
            setProgress((prev) => {
              const currentP = prev[currentLevel.id] || { unlocked: true, highScore: 0, stars: 0 };
              const nextLevelId = currentLevel.id + 1;
              const nextP = prev[nextLevelId] || { unlocked: true, highScore: 0, stars: 0 };

              return {
                ...prev,
                [currentLevel.id]: {
                  unlocked: true,
                  stars: Math.max(currentP.stars, earnedStars),
                  highScore: Math.max(currentP.highScore, finalScore),
                },
                ...(LEVELS.some((l) => l.id === nextLevelId)
                  ? { [nextLevelId]: { ...nextP, unlocked: true } }
                  : {}),
              };
            });

            setScreen('level_complete');
          } else if (movesRemaining - 1 <= 0) {
            sound.playLose();
            setScreen('game_over');
          } else {
            // Check if board has valid moves, auto-shuffle if none
            setGrid((current) => {
              if (!hasValidMoves(current)) {
                addFloatingText('NO MOVES • SHUFFLING! ✨', 0, 0, '#A855F7', 1.3);
                shuffleBoard(current, currentLevel.colors);
                return [...current];
              }
              return current;
            });
          }
        }, 260);
      }, 280);
    },
    [
      combo,
      currentLevel,
      goalItemsRemaining,
      grid,
      movesRemaining,
      score,
      spawnParticles,
      addFloatingText,
      triggerScreenShake,
    ]
  );

  // Handle Block Hover to preview matching cluster and laser connections
  const handleBlockHover = useCallback(
    (block: Block | null) => {
      if (isProcessing) {
        setHoveredCluster([]);
        return;
      }
      if (!block || block.obstacle === 'crate') {
        setHoveredCluster([]);
        return;
      }

      // If special block hovered
      if (block.special !== 'none') {
        const { targets } = getSpecialBlastTargets(grid, block);
        setHoveredCluster(targets);
        return;
      }

      // Regular cluster preview
      const clusterResult = findConnectedCluster(grid, block.row, block.col);
      if (clusterResult && clusterResult.blocks.length >= 3) {
        setHoveredCluster(clusterResult.blocks);
      } else {
        setHoveredCluster([]);
      }
    },
    [grid, isProcessing]
  );

  // Handle Block Click / Tap - Automatically pops same colors with 1 click!
  const handleBlockClick = useCallback(
    (block: Block) => {
      if (isProcessing) return;
      if (block.obstacle === 'crate') return;

      // Special Block Clicked Directly -> Pop special immediately!
      if (block.special !== 'none') {
        const { targets } = getSpecialBlastTargets(grid, block);
        setHoveredCluster([]);
        setSelectedCluster([]);
        executeBlast(targets, block);
        return;
      }

      // Regular Match Selection
      const clusterResult = findConnectedCluster(grid, block.row, block.col);
      if (!clusterResult) return;

      const cluster = clusterResult.blocks;

      // If cluster has at least 3 connected blocks -> AUTOMATIC POP!
      if (cluster.length >= 3) {
        setHoveredCluster([]);
        setSelectedCluster([]);
        setHintBlocks([]);
        executeBlast(cluster, block);
      } else {
        // Less than 3 blocks: clear selection & gentle feedback
        sound.playLanding();
        setSelectedCluster([]);
        setHoveredCluster([]);
        const tileW = 54;
        const tileH = 31;
        const isoX = (block.col - block.row) * (tileW / 2);
        const isoY = (block.col + block.row) * (tileH / 2);
        addFloatingText('Need 3+ to pop!', isoX, isoY - 25, '#EF4444', 0.95);
      }
    },
    [grid, isProcessing, executeBlast, addFloatingText]
  );

  // Confirm Blast from Bottom HUD button
  const handleConfirmBlast = useCallback(() => {
    const active = hoveredCluster.length >= 3 ? hoveredCluster : selectedCluster;
    if (active.length >= 3 && !isProcessing) {
      executeBlast(active, active[0]);
    }
  }, [hoveredCluster, selectedCluster, isProcessing, executeBlast]);

  // Hint Button: highlight an available 3+ cluster
  const handleHintClick = useCallback(() => {
    if (isProcessing) return;
    const match = findHintMatch(grid);
    if (match && match.length > 0) {
      sound.playClick();
      setHintBlocks(match);
      addFloatingText('HINT READY! 💡', 0, -30, '#F59E0B', 1.1);
    } else {
      addFloatingText('NO MATCHES • AUTO SHUFFLE!', 0, -30, '#EF4444', 1.1);
      setGrid((prev) => {
        shuffleBoard(prev, currentLevel.colors);
        return [...prev];
      });
    }
  }, [grid, isProcessing, currentLevel, addFloatingText]);

  // Manual Shuffle
  const handleShuffleClick = useCallback(() => {
    if (isProcessing) return;
    sound.playClick();
    addFloatingText('BOARD SHUFFLED! ✨', 0, -30, '#A855F7', 1.2);
    setGrid((prev) => {
      shuffleBoard(prev, currentLevel.colors);
      return [...prev];
    });
    setSelectedCluster([]);
    setHintBlocks([]);
  }, [isProcessing, currentLevel, addFloatingText]);

  // Navigation handlers
  const handleNextLevel = useCallback(() => {
    const nextId = currentLevelId + 1;
    if (LEVELS.some((l) => l.id === nextId)) {
      startLevel(nextId);
    } else {
      setScreen('levels');
    }
  }, [currentLevelId, startLevel]);

  const handleRestartLevel = useCallback(() => {
    startLevel(currentLevelId);
  }, [currentLevelId, startLevel]);

  // Total stars calculated for Start Screen
  const totalStars = Object.values(progress).reduce(
    (acc: number, p: LevelProgress) => acc + (p?.stars || 0),
    0
  );
  const highestLevelUnlocked = Math.max(
    1,
    ...Object.entries(progress)
      .filter(([, p]) => (p as LevelProgress)?.unlocked)
      .map(([id]) => Number(id))
  );

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#FFFDF5] via-[#FFF9EA] to-[#FEF3C7]/40 flex flex-col justify-between overflow-x-hidden relative">
      {/* Background soft ambient decor */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-amber-100/40 to-transparent pointer-events-none" />

      {/* Screen 1: Start Screen */}
      {screen === 'start' && (
        <StartScreen
          onStartGame={() => startLevel(highestLevelUnlocked)}
          onOpenLevels={() => setScreen('levels')}
          onOpenHelp={() => setScreen('paused')}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
          totalStars={totalStars}
          highestLevelUnlocked={highestLevelUnlocked}
        />
      )}

      {/* Screen 2: Gameplay */}
      {(screen === 'playing' || screen === 'paused' || screen === 'level_complete' || screen === 'game_over') && (
        <div className="w-full flex-1 flex flex-col justify-between max-w-2xl mx-auto relative z-10">
          <TopHUD
            level={currentLevel}
            score={score}
            movesRemaining={movesRemaining}
            onPauseClick={() => setScreen('paused')}
            targetProgressPercent={targetProgressPercent}
            starsEarned={starsEarned}
          />

          {/* 3D Isometric Game Board */}
          <div className="flex-1 flex items-center justify-center py-2 overflow-visible">
            <GameBoard3D
              grid={grid}
              selectedCluster={selectedCluster}
              hoveredCluster={hoveredCluster}
              onBlockClick={handleBlockClick}
              onBlockHover={handleBlockHover}
              floatingTexts={floatingTexts}
              particles={particles}
              screenShake={screenShake}
              hintBlocks={hintBlocks}
            />
          </div>

          <BottomHUD
            level={currentLevel}
            selectedCluster={hoveredCluster.length > 0 ? hoveredCluster : selectedCluster}
            onConfirmBlast={handleConfirmBlast}
            onRestartClick={handleRestartLevel}
            onHintClick={handleHintClick}
            onShuffleClick={handleShuffleClick}
            soundEnabled={soundEnabled}
            musicEnabled={musicEnabled}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            currentCombo={combo}
            remainingGoalItems={goalItemsRemaining}
          />
        </div>
      )}

      {/* Modals */}
      {screen === 'levels' && (
        <LevelSelectModal
          levels={LEVELS}
          progress={progress}
          currentLevelId={currentLevelId}
          onSelectLevel={(lvlId) => startLevel(lvlId)}
          onClose={() => setScreen('playing')}
        />
      )}

      {screen === 'paused' && (
        <PauseModal
          level={currentLevel}
          onResume={() => setScreen('playing')}
          onRestart={handleRestartLevel}
          onLevelSelect={() => setScreen('levels')}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {screen === 'level_complete' && (
        <LevelCompleteModal
          level={currentLevel}
          score={score}
          movesRemaining={movesRemaining}
          stars={starsEarned}
          onNextLevel={handleNextLevel}
          onReplay={handleRestartLevel}
          onLevelSelect={() => setScreen('levels')}
          hasNextLevel={LEVELS.some((l) => l.id === currentLevelId + 1)}
        />
      )}

      {screen === 'game_over' && (
        <GameOverModal
          level={currentLevel}
          score={score}
          onRetry={handleRestartLevel}
          onLevelSelect={() => setScreen('levels')}
        />
      )}
    </main>
  );
}
