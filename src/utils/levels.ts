import { BlockColor, LevelConfig, ObstacleType, TargetType } from '../types';

export interface ChapterInfo {
  id: number;
  name: string;
  theme: string;
  startLevel: number;
  endLevel: number;
  icon: string;
  accentColor: string;
  gridDescription: string;
}

export const CHAPTERS: ChapterInfo[] = [
  {
    id: 1,
    name: 'Sunny Meadow',
    theme: 'Warm & Cheerful',
    startLevel: 1,
    endLevel: 10,
    icon: '🌻',
    accentColor: '#F59E0B',
    gridDescription: '6x6 & 7x7 Grid (36-49 Blocks)',
  },
  {
    id: 2,
    name: 'Coral Springs',
    theme: 'Ocean & Pearls',
    startLevel: 11,
    endLevel: 25,
    icon: '🪸',
    accentColor: '#0EA5E9',
    gridDescription: 'Expanded 8x8 Grid (64 Blocks!)',
  },
  {
    id: 3,
    name: 'Emerald Canopy',
    theme: 'Lush Jungle & Crates',
    startLevel: 26,
    endLevel: 50,
    icon: '🌿',
    accentColor: '#10B981',
    gridDescription: '8x8 & 9x9 Grid (64-81 Blocks)',
  },
  {
    id: 4,
    name: 'Frostpeak Glacier',
    theme: 'Deep Frozen Glaciers',
    startLevel: 51,
    endLevel: 75,
    icon: '❄️',
    accentColor: '#06B6D4',
    gridDescription: '9x9 Grid (81 Blocks)',
  },
  {
    id: 5,
    name: 'Twilight Nebula',
    theme: 'Cosmic & Explosive',
    startLevel: 76,
    endLevel: 100,
    icon: '✨',
    accentColor: '#8B5CF6',
    gridDescription: '9x9 & 10x10 Grid (81-100 Blocks)',
  },
  {
    id: 6,
    name: 'Cosmic Zenith',
    theme: 'Grandmaster Infinity',
    startLevel: 101,
    endLevel: 120,
    icon: '👑',
    accentColor: '#EC4899',
    gridDescription: 'Mega 10x10 Grid (100 Blocks!)',
  },
];

export function getChapterForLevel(levelId: number): ChapterInfo {
  const ch = CHAPTERS.find((c) => levelId >= c.startLevel && levelId <= c.endLevel);
  return ch || CHAPTERS[0];
}

// Helper to generate symmetrical obstacle patterns
function createSymmetricObstacles(
  rows: number,
  cols: number,
  pattern: 'cross' | 'corners' | 'diamond' | 'ring' | 'columns' | 'checker' | 'frame',
  type: ObstacleType,
  hp = 1
): { row: number; col: number; type: ObstacleType; hp?: number }[] {
  const obstacles: { row: number; col: number; type: ObstacleType; hp?: number }[] = [];
  const set = new Set<string>();

  const add = (r: number, c: number) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      const key = `${r},${c}`;
      if (!set.has(key)) {
        set.add(key);
        obstacles.push({ row: r, col: c, type, hp });
      }
    }
  };

  const midR = Math.floor(rows / 2);
  const midC = Math.floor(cols / 2);

  switch (pattern) {
    case 'cross':
      for (let r = 1; r < rows - 1; r++) add(r, midC);
      for (let c = 1; c < cols - 1; c++) add(midR, c);
      break;

    case 'corners':
      add(1, 1);
      add(1, 2);
      add(2, 1);
      add(1, cols - 2);
      add(1, cols - 3);
      add(2, cols - 2);
      add(rows - 2, 1);
      add(rows - 2, 2);
      add(rows - 3, 1);
      add(rows - 2, cols - 2);
      add(rows - 2, cols - 3);
      add(rows - 3, cols - 2);
      break;

    case 'diamond':
      for (let i = 0; i <= 2; i++) {
        add(midR - 2 + i, midC - i);
        add(midR - 2 + i, midC + i);
        add(midR + 2 - i, midC - i);
        add(midR + 2 - i, midC + i);
      }
      break;

    case 'ring':
      const rMin = Math.max(1, midR - 2);
      const rMax = Math.min(rows - 2, midR + 2);
      const cMin = Math.max(1, midC - 2);
      const cMax = Math.min(cols - 2, midC + 2);
      for (let r = rMin; r <= rMax; r++) {
        add(r, cMin);
        add(r, cMax);
      }
      for (let c = cMin; c <= cMax; c++) {
        add(rMin, c);
        add(rMax, c);
      }
      break;

    case 'columns':
      const colA = Math.max(1, midC - 2);
      const colB = Math.min(cols - 2, midC + 2);
      for (let r = 1; r < rows - 1; r++) {
        if (r % 2 === 0) {
          add(r, colA);
          add(r, colB);
        }
      }
      break;

    case 'checker':
      for (let r = 2; r < rows - 2; r++) {
        for (let c = 2; c < cols - 2; c++) {
          if ((r + c) % 2 === 0) {
            add(r, c);
          }
        }
      }
      break;

    case 'frame':
      add(2, 2);
      add(2, cols - 3);
      add(rows - 3, 2);
      add(rows - 3, cols - 3);
      add(midR, 2);
      add(midR, cols - 3);
      add(2, midC);
      add(rows - 3, midC);
      break;
  }

  return obstacles;
}

const ALL_COLORS: BlockColor[] = ['yellow', 'pink', 'blue', 'purple', 'orange', 'green'];

const LEVEL_NAMES: Record<number, { name: string; subtitle: string }> = {
  1: { name: 'Sunny Meadow', subtitle: 'Tap matching colors to pop! Create combos!' },
  2: { name: 'Honey Breeze', subtitle: 'Connect 4+ blocks for explosive Line Blasts!' },
  3: { name: 'Sweet Berries', subtitle: 'Collect 10 Pink Hearts & 10 Blue Drops!' },
  4: { name: 'Daisy Trail', subtitle: 'Clear clusters to score 3,000 points!' },
  5: { name: 'Buttercup Hill', subtitle: 'Collect 12 Yellow Stars & 12 Orange Smiles!' },
  6: { name: 'Pastel Garden', subtitle: 'Expanded 7x7 garden! Green Clover arrives!' },
  7: { name: 'Frosty Dew', subtitle: 'Break frozen ice blocks with adjacent matches!' },
  8: { name: 'Timber Pickets', subtitle: 'Smash through sturdy toy crates!' },
  9: { name: 'Rainbow Meadow', subtitle: 'Assemble 5+ blocks to create Bombs!' },
  10: { name: 'Meadow Crown', subtitle: 'Boss Trial! Shatter ice and crates together!' },

  // Chapter 2: Coral Springs (8x8 Grid, 64 Blocks)
  11: { name: 'Coral Reef', subtitle: 'Welcome to the huge 8x8 arena! 64 blocks of fun!' },
  12: { name: 'Tidal Lagoon', subtitle: 'Collect 16 Blue Chills & 16 Pink Hearts!' },
  13: { name: 'Shell Harbor', subtitle: 'Break 10 frozen ice blocks along the shore!' },
  14: { name: 'Driftwood Cove', subtitle: 'Smash through 10 wooden shipwreck crates!' },
  15: { name: 'Sea Glass Bay', subtitle: 'Score 7,500 points in the sparkling water!' },
  16: { name: 'Pearl Atoll', subtitle: 'Collect 18 Yellow Stars & 18 Green Clovers!' },
  17: { name: 'Frozen Tide', subtitle: 'Break through the ice ring barricade!' },
  18: { name: 'Sunken Chests', subtitle: 'Clear 12 durable crates guarding the deep!' },
  19: { name: 'Aqua Current', subtitle: 'Unleash Color Blasts to score 9,000 points!' },
  20: { name: 'Siren Trial', subtitle: 'Mini-Boss: Break ice and smash crates in 26 moves!' },
  21: { name: 'Sapphire Depths', subtitle: 'Collect 20 Blue Chills & 20 Purple Joys!' },
  22: { name: 'Nautical Maze', subtitle: 'Navigate through a dense checkerboard of ice!' },
  23: { name: 'Starfish Shoal', subtitle: 'Blast 14 crates to free the coral seabed!' },
  24: { name: 'Crystal Trench', subtitle: 'Score 11,000 points with massive cascades!' },
  25: { name: 'Abyssal Sovereign', subtitle: 'Chapter Boss! Break 16 ice and 8 crates!' },

  // Chapter 3: Emerald Canopy (8x8 to 9x9 Grid, 64-81 Blocks)
  26: { name: 'Emerald Canopy', subtitle: 'Enter the lush jungle with 5 rich colors!' },
  27: { name: 'Mossy Grove', subtitle: 'Collect 22 Green Clovers & 22 Yellow Stars!' },
  28: { name: 'Vine Bridge', subtitle: 'Break through frozen vine formations!' },
  29: { name: 'Jade Shrines', subtitle: 'Smash crates guarding the ancient shrine!' },
  30: { name: 'Canopy Falls', subtitle: 'High score cascade challenge: 13,000 PTS!' },
  31: { name: 'Bamboo Ridge', subtitle: 'Collect 24 Pink Hearts & 24 Blue Chills!' },
  32: { name: 'Jungle Depot', subtitle: 'Clear double crate walls with Bomb combos!' },
  33: { name: 'Rainforest Mist', subtitle: 'Break 14 ice blocks concealed in the mist!' },
  34: { name: 'Orchid Basin', subtitle: 'Score 15,000 PTS with consecutive combos!' },
  35: { name: 'Temple Ruins', subtitle: 'Smash 14 crates in the lost temple courtyard!' },
  36: { name: 'Giant Redwood', subtitle: 'Board expands to 9x9! 81 blocks on screen!' },
  37: { name: 'Timber Fortress', subtitle: '9x9 crate fortress! Blast through 16 crates!' },
  38: { name: 'Emerald Geode', subtitle: 'Break 16 deep ice crystals in the 9x9 arena!' },
  39: { name: 'Serpent Pass', subtitle: 'Collect 26 Green Clovers & 26 Purple Joys!' },
  40: { name: 'Canopy Colossus', subtitle: 'Boss Battle! 9x9 grid with 18 ice & 10 crates!' },
  41: { name: 'Whispering Ferns', subtitle: 'Precision moves: High score in 22 moves!' },
  42: { name: 'Monsoon Crossing', subtitle: 'Break cross-pattern ice in heavy weather!' },
  43: { name: 'Amber Hollow', subtitle: 'Clear 16 amber crates with Line Blasts!' },
  44: { name: 'Wildwood Cache', subtitle: 'Collect 28 Orange Smiles & 28 Blue Chills!' },
  45: { name: 'Canopy Summit', subtitle: 'Score 18,000 PTS on the jungle peak!' },
  46: { name: 'Ancient Grove', subtitle: 'Break 18 ancient ice blocks!' },
  47: { name: 'Lost Quarry', subtitle: 'Smash 18 reinforced stone crates!' },
  48: { name: 'Verdant Valley', subtitle: 'Collect 30 Green Clovers & 30 Pink Hearts!' },
  49: { name: 'Totem Sanctuary', subtitle: 'High score trial: 20,000 PTS!' },
  50: { name: 'Jungle Sovereign', subtitle: 'World 3 Finale: 20 ice + 12 crates on 9x9!' },

  // Chapter 4: Frostpeak Glacier (9x9 Grid, 81 Blocks)
  51: { name: 'Frostpeak Ascent', subtitle: 'The frozen mountain tests your matching skills!' },
  52: { name: 'Glacial Shards', subtitle: 'Break 18 frozen ice shards!' },
  53: { name: 'Snowdrift Peak', subtitle: 'Collect 30 Blue Chills & 30 Purple Joys!' },
  54: { name: 'Frozen Labyrinth', subtitle: 'Break maze ice with strategic special blocks!' },
  55: { name: 'Crystal Spire', subtitle: 'Smash 18 crates surrounding the spire!' },
  56: { name: 'Blizzard Pass', subtitle: 'Score 22,000 PTS during a raging blizzard!' },
  57: { name: 'Icebox Caverns', subtitle: 'Break 20 deep subzero ice blocks!' },
  58: { name: 'Frostbound Fort', subtitle: 'Clear 20 reinforced wooden crates!' },
  59: { name: 'Polar Aurora', subtitle: 'Collect 32 Pink Hearts & 32 Green Clovers!' },
  60: { name: 'Avalanche Ridge', subtitle: 'Boss Battle: 22 ice & 12 crates in 30 moves!' },
  61: { name: 'Glacial Crevasse', subtitle: 'Break cross-split ice blocks across the chasm!' },
  62: { name: 'Icebound Vault', subtitle: 'Clear 22 crates locked inside the glacier!' },
  63: { name: 'Subzero Grotto', subtitle: 'Score 25,000 PTS with multi-color blasts!' },
  64: { name: 'Frozen Cascade', subtitle: 'Break 22 cascading ice blocks!' },
  65: { name: 'Diamond Frost', subtitle: 'Collect 34 Yellow Stars & 34 Blue Chills!' },
  66: { name: 'Permafrost Plateau', subtitle: 'Smash 22 sturdy permafrost crates!' },
  67: { name: 'Blizzard Bastion', subtitle: 'Break 24 fortified ice blocks!' },
  68: { name: 'Winter Wyrm', subtitle: 'Score 28,000 PTS in the dragon cavern!' },
  69: { name: 'Crystal Glacier', subtitle: 'Collect 36 Purple Joys & 36 Pink Hearts!' },
  70: { name: 'Frozen Citadel', subtitle: 'Mini-Boss: Break 24 ice & 14 crates!' },
  71: { name: 'Frostbite Chasm', subtitle: 'Break 24 deep ice blocks across the chasm!' },
  72: { name: 'Ice Crown', subtitle: 'Clear 24 crates protecting the frozen throne!' },
  73: { name: 'Absolute Zero', subtitle: 'Score 30,000 PTS in extreme freezing cold!' },
  74: { name: 'Glacial Fortress', subtitle: 'Collect 38 Green Clovers & 38 Yellow Stars!' },
  75: { name: 'Frostpeak Sovereign', subtitle: 'Chapter Boss! 26 ice + 16 crates in 32 moves!' },

  // Chapter 5: Twilight Nebula (9x9 to 10x10 Grid, 81-100 Blocks)
  76: { name: 'Twilight Gateway', subtitle: 'Venture into the cosmic realm with all 6 colors!' },
  77: { name: 'Starlight Orbit', subtitle: 'Collect 36 Yellow Stars & 36 Blue Chills!' },
  78: { name: 'Asteroid Belt', subtitle: 'Break 22 space ice blocks in asteroid orbit!' },
  79: { name: 'Meteor Shower', subtitle: 'Smash 22 space crates before impact!' },
  80: { name: 'Supernova Flare', subtitle: 'Score 32,000 PTS with cosmic chain reactions!' },
  81: { name: 'Galactic Nexus', subtitle: 'Collect 38 Purple Joys & 38 Orange Smiles!' },
  82: { name: 'Cosmic Nebula', subtitle: 'Break 24 colorful nebular ice blocks!' },
  83: { name: 'Pulsar Beacons', subtitle: 'Clear 24 cosmic crates with Line Blasts!' },
  84: { name: 'Void Anomaly', subtitle: 'Score 35,000 PTS inside the gravitational void!' },
  85: { name: 'Astral Sanctuary', subtitle: 'Boss Battle: 26 ice & 14 crates in 32 moves!' },
  86: { name: 'Solar Flare', subtitle: 'Max Grid: 10x10! 100 blocks across the board!' },
  87: { name: 'Quantum Rift', subtitle: '100 blocks! Break 26 quantum ice blocks!' },
  88: { name: 'Eclipse Horizon', subtitle: 'Smash 26 crates on the giant 10x10 stage!' },
  89: { name: 'Gravity Well', subtitle: 'Score 38,000 PTS with colossal 100-block cascades!' },
  90: { name: 'Nebula Citadel', subtitle: 'Collect 40 Pink Hearts & 40 Blue Chills!' },
  91: { name: 'Celestial Spire', subtitle: 'Break 28 starlight ice blocks!' },
  92: { name: 'Starfall Basin', subtitle: 'Clear 28 space crates across the basin!' },
  93: { name: 'Deep Cosmos', subtitle: 'Score 42,000 PTS with epic Color Blasts!' },
  94: { name: 'Dark Matter Core', subtitle: 'Collect 42 Purple Joys & 42 Green Clovers!' },
  95: { name: 'Orion Gate', subtitle: 'Break 30 ice blocks forming the constellation!' },
  96: { name: 'Warp Horizon', subtitle: 'Smash 30 warp crates in deep hyperspace!' },
  97: { name: 'Nova Cataclysm', subtitle: 'Score 45,000 PTS in the heart of the nova!' },
  98: { name: 'Andromeda Edge', subtitle: 'Collect 44 Yellow Stars & 44 Pink Hearts!' },
  99: { name: 'Cosmic Zenith', subtitle: 'Penultimate trial: 30 ice & 16 crates!' },
  100: { name: 'Grandmaster Apex', subtitle: '100th Milestone! 10x10 Grid, 50,000 PTS, 32 ice & 18 crates!' },

  // Chapter 6: Cosmic Zenith (Levels 101 - 120, Mega 10x10 Grids)
  101: { name: 'Infinity Meadow', subtitle: 'Bonus Master World! 100 blocks of pure joy!' },
  102: { name: 'Chrono Shards', subtitle: 'Break 28 temporal ice blocks!' },
  103: { name: 'Prismatic Core', subtitle: 'Collect 45 of three different colors!' },
  104: { name: 'Quantum Bloom', subtitle: 'Smash 30 quantum crates with Bomb combos!' },
  105: { name: 'Hypercube Maze', subtitle: 'Score 48,000 PTS in the 4D puzzle arena!' },
  106: { name: 'Aurora Matrix', subtitle: 'Break 30 shimmering aurora ice blocks!' },
  107: { name: 'Nova Crucible', subtitle: 'Clear 32 molten crates with explosive cascades!' },
  108: { name: 'Ether Chamber', subtitle: 'Collect 48 Pink Hearts & 48 Blue Chills!' },
  109: { name: 'Singularity Rift', subtitle: 'Score 52,000 PTS near the event horizon!' },
  110: { name: "Titan's Forge", subtitle: 'Grandmaster Boss: 32 ice & 20 crates on 10x10!' },
  111: { name: 'Radiant Apex', subtitle: 'Collect 50 Yellow Stars & 50 Green Clovers!' },
  112: { name: 'Lumina Vault', subtitle: 'Break 32 crystal ice blocks in the vault!' },
  113: { name: 'Vortex Horizon', subtitle: 'Smash 34 crates sucked into the cosmic vortex!' },
  114: { name: 'Celestial Core', subtitle: 'Score 55,000 PTS with legendary 8+ matches!' },
  115: { name: 'Dimension Gate', subtitle: 'Collect 52 Purple Joys & 52 Orange Smiles!' },
  116: { name: 'Astral Colosseum', subtitle: 'Break 34 gladiator ice barriers!' },
  117: { name: 'Eternity Spire', subtitle: 'Clear 36 crates on the spire of infinity!' },
  118: { name: 'Omega Nebula', subtitle: 'Score 60,000 PTS with non-stop combo chains!' },
  119: { name: 'Primordial Light', subtitle: 'Break 36 ice & 24 crates in the origin realm!' },
  120: { name: 'Cosmic Singularity', subtitle: 'The Ultimate Triumph: 100 Blocks, Master Victory!' },
};

function generateAllLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];

  for (let id = 1; id <= 120; id++) {
    // 1. Grid Sizing:
    // Levels 1-5: 6x6 (36 blocks)
    // Levels 6-10: 7x7 (49 blocks)
    // Levels 11-35: 8x8 (64 blocks) - "after 10 level increase the blocks area and increase blocks"
    // Levels 36-85: 9x9 (81 blocks)
    // Levels 86-120: 10x10 (100 blocks)
    let rows = 6;
    let cols = 6;
    if (id >= 6 && id <= 10) {
      rows = 7;
      cols = 7;
    } else if (id >= 11 && id <= 35) {
      rows = 8;
      cols = 8;
    } else if (id >= 36 && id <= 85) {
      rows = 9;
      cols = 9;
    } else if (id >= 86) {
      rows = 10;
      cols = 10;
    }

    // 2. Colors:
    let colors: BlockColor[] = ['yellow', 'pink', 'blue'];
    if (id >= 2 && id <= 5) colors = ['yellow', 'pink', 'blue', 'orange'];
    else if (id >= 6 && id <= 15) colors = ['yellow', 'pink', 'blue', 'green', 'orange'];
    else if (id >= 16 && id <= 75) colors = ['yellow', 'pink', 'blue', 'purple', 'green'];
    else colors = ALL_COLORS;

    // 3. Target Type & Difficulty:
    const isBoss = id % 25 === 0 || id === 10 || id === 20 || id === 40 || id === 60 || id === 85 || id === 100 || id === 110 || id === 120;
    let difficulty: 'easy' | 'medium' | 'hard' | 'boss' = 'easy';
    if (isBoss) {
      difficulty = 'boss';
    } else if (id <= 15) {
      difficulty = 'easy';
    } else if (id <= 50) {
      difficulty = 'medium';
    } else {
      difficulty = 'hard';
    }

    let targetType: TargetType = 'score';
    const cycle = id % 4;
    if (isBoss) {
      targetType = 'score'; // Bosses have score target + both obstacles!
    } else if (cycle === 1) {
      targetType = 'score';
    } else if (cycle === 2) {
      targetType = 'collect_colors';
    } else if (cycle === 3) {
      targetType = 'break_ice';
    } else {
      targetType = 'clear_crates';
    }

    // 4. Moves:
    let maxMoves = 18;
    if (id <= 5) maxMoves = 18;
    else if (id <= 10) maxMoves = 22;
    else if (id <= 25) maxMoves = 24;
    else if (id <= 50) maxMoves = 26;
    else if (id <= 75) maxMoves = 28;
    else if (id <= 100) maxMoves = 32;
    else maxMoves = 34;

    // 5. Score Targets:
    const baseScore = Math.floor(1500 + id * 420);
    const targetScore = Math.round(baseScore / 100) * 100;
    const star1 = targetScore;
    const star2 = Math.round(targetScore * 1.35 / 100) * 100;
    const star3 = Math.round(targetScore * 1.8 / 100) * 100;

    // 6. Obstacles:
    let obstacles: { row: number; col: number; type: ObstacleType; hp?: number }[] = [];
    const patterns: Array<'cross' | 'corners' | 'diamond' | 'ring' | 'columns' | 'checker' | 'frame'> = [
      'cross',
      'diamond',
      'corners',
      'ring',
      'columns',
      'checker',
      'frame',
    ];
    const pattern = patterns[id % patterns.length];

    if (isBoss) {
      // Dual obstacles for Boss levels!
      const iceObs = createSymmetricObstacles(rows, cols, 'diamond', 'ice');
      const crateObs = createSymmetricObstacles(rows, cols, 'corners', 'crate', 1);
      obstacles = [...iceObs, ...crateObs];
    } else if (targetType === 'break_ice') {
      obstacles = createSymmetricObstacles(rows, cols, pattern, 'ice');
    } else if (targetType === 'clear_crates') {
      obstacles = createSymmetricObstacles(rows, cols, pattern, 'crate', 1);
    } else if (id > 8 && targetType === 'score') {
      // Add light obstacles to score levels after level 8
      obstacles = createSymmetricObstacles(rows, cols, 'frame', 'ice');
    }

    // 7. Goals:
    let targetGoals: Partial<Record<BlockColor | 'ice' | 'crate', number>> | undefined;
    if (targetType === 'break_ice') {
      targetGoals = { ice: obstacles.length };
    } else if (targetType === 'clear_crates') {
      targetGoals = { crate: obstacles.length };
    } else if (targetType === 'collect_colors') {
      const colA = colors[0];
      const colB = colors[1] || colors[0];
      const count = Math.min(50, Math.floor(8 + (id * 0.35) * (rows / 6)));
      targetGoals = { [colA]: count, [colB]: count };
    }

    const named = LEVEL_NAMES[id] || {
      name: `Level ${id}`,
      subtitle: `Master the 3D block arena! Reach ${targetScore.toLocaleString()} points!`,
    };

    levels.push({
      id,
      name: named.name,
      subtitle: named.subtitle,
      rows,
      cols,
      colors,
      maxMoves,
      targetScore,
      targetType,
      difficulty,
      targetGoals,
      starThresholds: [star1, star2, star3],
      initialObstacles: obstacles.length > 0 ? obstacles : undefined,
    });
  }

  return levels;
}

export const LEVELS: LevelConfig[] = generateAllLevels();
