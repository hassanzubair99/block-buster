import { Block, BlockColor, LevelConfig, SpecialType } from '../types';

let nextBlockId = 1;
export const getUniqueBlockId = () => `b_${nextBlockId++}_${Math.random().toString(36).substring(2, 6)}`;

// Create initial board for a level
export function initializeBoard(level: LevelConfig): (Block | null)[][] {
  const grid: (Block | null)[][] = [];

  for (let r = 0; r < level.rows; r++) {
    const row: (Block | null)[] = [];
    for (let c = 0; c < level.cols; c++) {
      // Check if this position has an initial obstacle
      const obstacleDef = level.initialObstacles?.find((o) => o.row === r && o.col === c);

      const randomColor = level.colors[Math.floor(Math.random() * level.colors.length)];

      row.push({
        id: getUniqueBlockId(),
        row: r,
        col: c,
        color: randomColor,
        special: 'none',
        obstacle: obstacleDef ? obstacleDef.type : 'none',
        obstacleHp: obstacleDef?.hp ?? (obstacleDef?.type === 'crate' ? 1 : 0),
        isMatched: false,
        isSelected: false,
        isNew: false,
      });
    }
    grid.push(row);
  }

  // Ensure there's at least one valid match to start
  if (!hasValidMoves(grid)) {
    shuffleBoard(grid, level.colors);
  }

  return grid;
}

// Find orthogonally connected blocks of the same color (Flood Fill BFS)
export function findConnectedCluster(
  grid: (Block | null)[][],
  startRow: number,
  startCol: number
): { blocks: Block[]; color: BlockColor } | null {
  const startBlock = grid[startRow]?.[startCol];
  if (!startBlock || startBlock.obstacle === 'crate') return null;

  const targetColor = startBlock.color;
  const visited = new Set<string>();
  const cluster: Block[] = [];
  const queue: [number, number][] = [[startRow, startCol]];

  visited.add(`${startRow},${startCol}`);

  const rows = grid.length;
  const cols = grid[0].length;

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const current = grid[r]?.[c];
    if (!current) continue;

    cluster.push(current);

    // 4 orthogonal directions only (no diagonals)
    const neighbors: [number, number][] = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];

    for (const [nr, nc] of neighbors) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = grid[nr]?.[nc];
        const key = `${nr},${nc}`;
        if (
          neighbor &&
          !visited.has(key) &&
          neighbor.obstacle !== 'crate' &&
          neighbor.color === targetColor
        ) {
          visited.add(key);
          queue.push([nr, nc]);
        }
      }
    }
  }

  return { blocks: cluster, color: targetColor };
}

// Check if any valid 3+ match or clickable special block exists
export function hasValidMoves(grid: (Block | null)[][]): boolean {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const checked = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const block = grid[r][c];
      if (!block || block.obstacle === 'crate') continue;

      // Special blocks are always triggerable
      if (block.special !== 'none') return true;

      const key = `${r},${c}`;
      if (!checked.has(key)) {
        const cluster = findConnectedCluster(grid, r, c);
        if (cluster) {
          cluster.blocks.forEach((b) => checked.add(`${b.row},${b.col}`));
          if (cluster.blocks.length >= 3) return true;
        }
      }
    }
  }
  return false;
}

// Find a valid 3+ match to use as a hint
export function findHintMatch(grid: (Block | null)[][]): Block[] | null {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  // First check if there is a special block
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const block = grid[r][c];
      if (block && block.special !== 'none') return [block];
    }
  }

  // Find largest connected match
  let bestCluster: Block[] | null = null;
  const checked = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const block = grid[r][c];
      if (!block || block.obstacle === 'crate') continue;

      const key = `${r},${c}`;
      if (!checked.has(key)) {
        const cluster = findConnectedCluster(grid, r, c);
        if (cluster) {
          cluster.blocks.forEach((b) => checked.add(`${b.row},${b.col}`));
          if (cluster.blocks.length >= 3) {
            if (!bestCluster || cluster.blocks.length > bestCluster.length) {
              bestCluster = cluster.blocks;
            }
          }
        }
      }
    }
  }

  return bestCluster;
}

// Shuffle board without altering obstacles
export function shuffleBoard(grid: (Block | null)[][], colors: BlockColor[]): void {
  const movableBlocks: Block[] = [];

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const block = grid[r][c];
      if (block && block.obstacle !== 'crate') {
        movableBlocks.push(block);
      }
    }
  }

  let attempts = 0;
  let success = false;

  while (attempts < 50 && !success) {
    attempts++;
    // Shuffle colors
    for (let i = movableBlocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempColor = movableBlocks[i].color;
      movableBlocks[i].color = movableBlocks[j].color;
      movableBlocks[j].color = tempColor;
    }

    if (hasValidMoves(grid)) {
      success = true;
      break;
    }
  }

  // Fallback: force create a 3-match if somehow still no moves
  if (!success && movableBlocks.length >= 3) {
    const forcedColor = colors[0];
    movableBlocks[0].color = forcedColor;
    movableBlocks[1].color = forcedColor;
    movableBlocks[2].color = forcedColor;
  }
}

// Calculate special blast targets
export function getSpecialBlastTargets(
  grid: (Block | null)[][],
  block: Block
): { targets: Block[]; iceDamaged: Block[]; cratesDamaged: Block[] } {
  const rows = grid.length;
  const cols = grid[0].length;
  const targetSet = new Set<Block>();
  const iceSet = new Set<Block>();
  const crateSet = new Set<Block>();

  if (block.special === 'line_horizontal') {
    for (let c = 0; c < cols; c++) {
      const target = grid[block.row][c];
      if (target) {
        if (target.obstacle === 'crate') crateSet.add(target);
        else targetSet.add(target);
      }
    }
  } else if (block.special === 'line_vertical') {
    for (let r = 0; r < rows; r++) {
      const target = grid[r][block.col];
      if (target) {
        if (target.obstacle === 'crate') crateSet.add(target);
        else targetSet.add(target);
      }
    }
  } else if (block.special === 'bomb') {
    // 3x3 explosion
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = block.row + dr;
        const nc = block.col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const target = grid[nr][nc];
          if (target) {
            if (target.obstacle === 'crate') crateSet.add(target);
            else targetSet.add(target);
          }
        }
      }
    }
  } else if (block.special === 'color_blast') {
    // Blast all blocks of the target's color!
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const target = grid[r][c];
        if (target && target.color === block.color && target.obstacle !== 'crate') {
          targetSet.add(target);
        }
      }
    }
  }

  return {
    targets: Array.from(targetSet),
    iceDamaged: Array.from(iceSet),
    cratesDamaged: Array.from(crateSet),
  };
}

// Find adjacent obstacles damaged by cleared blocks
export function findAdjacentDamagedObstacles(
  grid: (Block | null)[][],
  clearedBlocks: Block[]
): { iceCleared: Block[]; cratesDamaged: Block[] } {
  const rows = grid.length;
  const cols = grid[0].length;
  const iceSet = new Set<Block>();
  const crateSet = new Set<Block>();

  clearedBlocks.forEach((b) => {
    // If the cleared block had ice on it, it's also cleared
    if (b.obstacle === 'ice') {
      iceSet.add(b);
    }

    const neighbors: [number, number][] = [
      [b.row - 1, b.col],
      [b.row + 1, b.col],
      [b.row, b.col - 1],
      [b.row, b.col + 1],
    ];

    for (const [nr, nc] of neighbors) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = grid[nr][nc];
        if (neighbor) {
          if (neighbor.obstacle === 'ice') {
            iceSet.add(neighbor);
          } else if (neighbor.obstacle === 'crate') {
            crateSet.add(neighbor);
          }
        }
      }
    }
  });

  return {
    iceCleared: Array.from(iceSet),
    cratesDamaged: Array.from(crateSet),
  };
}

// Apply gravity and spawn new blocks at top
export function applyGravityAndRefill(
  grid: (Block | null)[][],
  levelColors: BlockColor[]
): {
  newGrid: (Block | null)[][];
  movedBlocksCount: number;
  newBlocksCount: number;
} {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid: (Block | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  let movedBlocksCount = 0;
  let newBlocksCount = 0;

  // Process column by column
  for (let c = 0; c < cols; c++) {
    // Collect non-cleared blocks in this column from bottom to top
    const remainingInCol: Block[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const block = grid[r][c];
      if (block !== null) {
        remainingInCol.push(block);
      }
    }

    // Place remaining blocks starting from bottom of the new column
    let targetRow = rows - 1;
    for (const block of remainingInCol) {
      if (block.row !== targetRow) {
        movedBlocksCount++;
      }
      newGrid[targetRow][c] = {
        ...block,
        row: targetRow,
        col: c,
        isNew: false,
        isMatched: false,
        isSelected: false,
      };
      targetRow--;
    }

    // Fill the empty top spots with new random blocks
    while (targetRow >= 0) {
      newBlocksCount++;
      const randomColor = levelColors[Math.floor(Math.random() * levelColors.length)];
      newGrid[targetRow][c] = {
        id: getUniqueBlockId(),
        row: targetRow,
        col: c,
        color: randomColor,
        special: 'none',
        obstacle: 'none',
        isMatched: false,
        isSelected: false,
        isNew: true,
      };
      targetRow--;
    }
  }

  return { newGrid, movedBlocksCount, newBlocksCount };
}

// Determine special block created by match size
export function getSpecialCreatedForMatch(matchCount: number): SpecialType {
  if (matchCount >= 6) return 'color_blast';
  if (matchCount === 5) return 'bomb';
  if (matchCount === 4) {
    return Math.random() > 0.5 ? 'line_horizontal' : 'line_vertical';
  }
  return 'none';
}
