export type BlockColor = 'yellow' | 'pink' | 'blue' | 'purple' | 'orange' | 'green';

export type SpecialType = 'none' | 'line_horizontal' | 'line_vertical' | 'bomb' | 'color_blast';

export type ObstacleType = 'none' | 'ice' | 'crate';

export interface Block {
  id: string;
  row: number;
  col: number;
  color: BlockColor;
  special: SpecialType;
  obstacle: ObstacleType;
  obstacleHp?: number; // for crates or multi-hit obstacles
  isMatched?: boolean;
  isSelected?: boolean;
  isNew?: boolean;
  isHinted?: boolean;
}

export type TargetType = 'score' | 'collect_colors' | 'break_ice' | 'clear_crates';

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  rows: number;
  cols: number;
  colors: BlockColor[];
  maxMoves: number;
  targetScore: number;
  targetType: TargetType;
  targetGoals?: Partial<Record<BlockColor | 'ice' | 'crate', number>>;
  starThresholds: [number, number, number];
  initialObstacles?: { row: number; col: number; type: ObstacleType; hp?: number }[];
}

export type GameScreen = 'start' | 'levels' | 'playing' | 'paused' | 'level_complete' | 'game_over';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  shape: 'circle' | 'square' | 'star';
  life: number;
  maxLife: number;
}

export interface FloatingTextItem {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
}

export interface LevelProgress {
  unlocked: boolean;
  highScore: number;
  stars: number;
}
