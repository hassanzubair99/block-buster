import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Block, FloatingTextItem, Particle } from '../types';
import { IsometricBlock } from './IsometricBlock';

interface GameBoard3DProps {
  grid: (Block | null)[][];
  selectedCluster: Block[];
  hoveredCluster?: Block[];
  onBlockClick: (block: Block) => void;
  onBlockHover?: (block: Block | null) => void;
  floatingTexts: FloatingTextItem[];
  particles: Particle[];
  screenShake: boolean;
  hintBlocks: Block[];
  isDarkBox?: boolean;
}

export const GameBoard3D: React.FC<GameBoard3DProps> = ({
  grid,
  selectedCluster,
  hoveredCluster = [],
  onBlockClick,
  onBlockHover,
  floatingTexts,
  particles,
  screenShake,
  hintBlocks,
  isDarkBox = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(440);

  const rows = grid.length;
  const cols = grid[0]?.length || 7;

  // Responsive block size based on container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setContainerWidth(Math.max(300, Math.min(w, 640)));
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute optimal block size so entire isometric diamond fits comfortably (supports up to 10x10 grids)
  const blockSize = useMemo(() => {
    const maxSpans = (rows + cols) * 0.52;
    const targetSize = Math.floor((containerWidth - 36) / maxSpans);
    return Math.max(26, Math.min(62, targetSize));
  }, [containerWidth, rows, cols]);

  const tileW = blockSize;
  const tileH = Math.round(blockSize * 0.58);
  const depth = Math.round(blockSize * 0.44);

  // Isometric coordinate calculator:
  // Center of the diamond is (0, 0)
  const getIsoCoords = (r: number, c: number) => {
    const x = (c - r) * (tileW / 2);
    const y = (c + r) * (tileH / 2);
    return { x, y };
  };

  // Dimensions of the isometric board bounding box
  const totalBoardWidth = (cols + rows) * (tileW / 2) + tileW + 40;
  const totalBoardHeight = (cols + rows) * (tileH / 2) + depth + 100;
  const boardCenterX = totalBoardWidth / 2;
  const boardTopY = 48; // padding at top

  // Active cluster is either explicitly selected or currently hovered
  const activeCluster = selectedCluster.length > 0 ? selectedCluster : hoveredCluster;

  // Set of active cluster block keys for quick lookup
  const selectedKeys = useMemo(() => {
    return new Set(activeCluster.map((b) => `${b.row},${b.col}`));
  }, [activeCluster]);

  const hintKeys = useMemo(() => {
    return new Set(hintBlocks.map((b) => `${b.row},${b.col}`));
  }, [hintBlocks]);

  // Compute glowing connection line segments between adjacent blocks in active cluster
  const connectionLines = useMemo(() => {
    if (activeCluster.length < 2) return [];

    const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
    const clusterMap = new Map<string, Block>();
    activeCluster.forEach((b) => clusterMap.set(`${b.row},${b.col}`, b));

    activeCluster.forEach((b) => {
      const { x: x1, y: y1 } = getIsoCoords(b.row, b.col);
      const px1 = boardCenterX + x1;
      const py1 = boardTopY + y1 + tileH / 2 - 6;

      // Check right neighbor
      const right = clusterMap.get(`${b.row},${b.col + 1}`);
      if (right) {
        const { x: x2, y: y2 } = getIsoCoords(right.row, right.col);
        lines.push({
          x1: px1,
          y1: py1,
          x2: boardCenterX + x2,
          y2: boardTopY + y2 + tileH / 2 - 6,
          key: `${b.id}-${right.id}`,
        });
      }

      // Check bottom neighbor
      const down = clusterMap.get(`${b.row + 1},${b.col}`);
      if (down) {
        const { x: x2, y: y2 } = getIsoCoords(down.row, down.col);
        lines.push({
          x1: px1,
          y1: py1,
          x2: boardCenterX + x2,
          y2: boardTopY + y2 + tileH / 2 - 6,
          key: `${b.id}-${down.id}`,
        });
      }
    });

    return lines;
  }, [activeCluster, boardCenterX, boardTopY, tileH, tileW]);

  // Flatten and sort blocks for correct isometric painter's algorithm
  // In isometric view, blocks with smaller (row + col) are in the back and must render first
  const sortedBlocks = useMemo(() => {
    const list: Block[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const b = grid[r][c];
        if (b) list.push(b);
      }
    }
    return list.sort((a, b) => {
      const depthA = a.row + a.col;
      const depthB = b.row + b.col;
      if (depthA !== depthB) return depthA - depthB;
      return a.col - b.col;
    });
  }, [grid, rows, cols]);

  // Points for the 3D isometric platform base
  const platformPoints = useMemo(() => {
    const margin = tileW * 0.44;
    const pTop = { x: boardCenterX, y: boardTopY - margin * 0.45 };
    const pRight = { x: boardCenterX + cols * (tileW / 2) + margin, y: boardTopY + cols * (tileH / 2) };
    const pBottom = { x: boardCenterX + (cols - rows) * (tileW / 2), y: boardTopY + (cols + rows) * (tileH / 2) + margin * 0.5 + 8 };
    const pLeft = { x: boardCenterX - rows * (tileW / 2) - margin, y: boardTopY + rows * (tileH / 2) };

    const topFace = `${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`;
    const leftSide = `${pLeft.x},${pLeft.y} ${pBottom.x},${pBottom.y} ${pBottom.x},${pBottom.y + 26} ${pLeft.x},${pLeft.y + 26}`;
    const rightSide = `${pBottom.x},${pBottom.y} ${pRight.x},${pRight.y} ${pRight.x},${pRight.y + 26} ${pBottom.x},${pBottom.y + 26}`;

    return { topFace, leftSide, rightSide, pBottom };
  }, [boardCenterX, boardTopY, rows, cols, tileW, tileH]);

  return (
    <div
      ref={containerRef}
      id="game-board-container"
      onPointerLeave={() => onBlockHover && onBlockHover(null)}
      className={`relative w-full flex justify-center items-center py-2 transition-transform duration-100 select-none ${
        screenShake ? 'animate-shake' : ''
      }`}
      style={{ minHeight: `${totalBoardHeight}px` }}
    >
      <div
        className="relative overflow-visible"
        style={{
          width: `${totalBoardWidth}px`,
          height: `${totalBoardHeight}px`,
        }}
      >
        {/* 3D Isometric Pedestal / Floating Platform */}
        <svg
          className="absolute inset-0 pointer-events-none filter drop-shadow-2xl"
          width={totalBoardWidth}
          height={totalBoardHeight}
          viewBox={`0 0 ${totalBoardWidth} ${totalBoardHeight}`}
        >
          <defs>
            {/* Dark Color Box Gradients for high contrast */}
            <linearGradient id="pedestal-top-dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E2536" />
              <stop offset="50%" stopColor="#151B27" />
              <stop offset="100%" stopColor="#0E121B" />
            </linearGradient>
            <linearGradient id="pedestal-side-left-dark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#111622" />
              <stop offset="100%" stopColor="#080B10" />
            </linearGradient>
            <linearGradient id="pedestal-side-right-dark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0C1019" />
              <stop offset="100%" stopColor="#05070B" />
            </linearGradient>

            {/* Light Theme Fallback Gradients */}
            <linearGradient id="pedestal-top-light" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="50%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="pedestal-side-left-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="pedestal-side-right-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>

          {/* Bottom Ambient Drop Shadow on the table */}
          <ellipse
            cx={platformPoints.pBottom.x}
            cy={platformPoints.pBottom.y + 36}
            rx={totalBoardWidth * 0.44}
            ry={totalBoardHeight * 0.16}
            fill={isDarkBox ? "rgba(0, 0, 0, 0.45)" : "rgba(60, 45, 20, 0.14)"}
            filter="blur(14px)"
          />

          {/* Pedestal Left Extruded Face */}
          <polygon
            points={platformPoints.leftSide}
            fill={isDarkBox ? "url(#pedestal-side-left-dark)" : "url(#pedestal-side-left-light)"}
          />

          {/* Pedestal Right Extruded Face */}
          <polygon
            points={platformPoints.rightSide}
            fill={isDarkBox ? "url(#pedestal-side-right-dark)" : "url(#pedestal-side-right-light)"}
          />

          {/* Pedestal Top Face */}
          <polygon
            points={platformPoints.topFace}
            fill={isDarkBox ? "url(#pedestal-top-dark)" : "url(#pedestal-top-light)"}
            stroke={isDarkBox ? "#38BDF8" : "#FBBF24"}
            strokeWidth={isDarkBox ? "1.8" : "3"}
            strokeOpacity={isDarkBox ? "0.6" : "1"}
            strokeLinejoin="round"
          />

          {/* Recessed Isometric Diamond Sockets on pedestal floor for high contrast */}
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const { x, y } = getIsoCoords(r, c);
              const cx = boardCenterX + x;
              const cy = boardTopY + y + tileH / 2;
              const dTop = `${cx},${cy - tileH * 0.45}`;
              const dRight = `${cx + tileW * 0.45},${cy}`;
              const dBottom = `${cx},${cy + tileH * 0.45}`;
              const dLeft = `${cx - tileW * 0.45},${cy}`;

              return (
                <g key={`floor-socket-${r}-${c}`}>
                  <polygon
                    points={`${dTop} ${dRight} ${dBottom} ${dLeft}`}
                    fill={isDarkBox ? "rgba(10, 14, 23, 0.8)" : "rgba(245, 158, 11, 0.1)"}
                    stroke={isDarkBox ? "rgba(255, 255, 255, 0.08)" : "rgba(245, 158, 11, 0.25)"}
                    strokeWidth="1.2"
                  />
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={tileW * 0.08}
                    ry={tileH * 0.08}
                    fill={isDarkBox ? "#38BDF8" : "#F59E0B"}
                    opacity={isDarkBox ? "0.3" : "0.35"}
                  />
                </g>
              );
            })
          )}

          {/* Neon Connection Energy Lines between connected matched blocks */}
          {connectionLines.map((line) => (
            <g key={line.key}>
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#FBBF24"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.6"
                filter="drop-shadow(0 0 8px #F59E0B)"
              />
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>
          ))}
        </svg>

        {/* Isometric 3D Blocks */}
        {sortedBlocks.map((b) => {
          const { x, y } = getIsoCoords(b.row, b.col);
          const px = boardCenterX + x - tileW / 2;
          const py = boardTopY + y;

          const isSelectedInMatch = selectedKeys.has(`${b.row},${b.col}`);
          const isHint = hintKeys.has(`${b.row},${b.col}`);

          return (
            <div
              key={b.id}
              className="absolute will-change-[left,top]"
              style={{
                left: `${px}px`,
                top: `${py}px`,
                transition: 'left 320ms cubic-bezier(0.34, 1.25, 0.64, 1), top 320ms cubic-bezier(0.34, 1.25, 0.64, 1)',
                zIndex: isSelectedInMatch ? 50 : 10 + b.row + b.col,
              }}
            >
              <IsometricBlock
                block={{ ...b, isHinted: isHint }}
                size={tileW}
                onClick={onBlockClick}
                onPointerEnter={(block) => onBlockHover && onBlockHover(block)}
                isSelectedInMatch={isSelectedInMatch}
              />
            </div>
          );
        })}

        {/* Floating Text Overlay (e.g. +300 PTS, COMBO x2!) */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute pointer-events-none font-bold font-display animate-float-fade"
            style={{
              left: `${boardCenterX + ft.x}px`,
              top: `${boardTopY + ft.y}px`,
              color: ft.color,
              transform: `translate(-50%, -50%) scale(${ft.scale})`,
              textShadow: '0 2px 8px rgba(0,0,0,0.35), 0 0 12px rgba(255,255,255,0.8)',
              zIndex: 100,
              fontSize: '1.25rem',
            }}
          >
            {ft.text}
          </div>
        ))}

        {/* Canvas / SVG for Dynamic Burst Particles */}
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          width={totalBoardWidth}
          height={totalBoardHeight}
          viewBox={`0 0 ${totalBoardWidth} ${totalBoardHeight}`}
          style={{ zIndex: 90 }}
        >
          {particles.map((p) => {
            const px = boardCenterX + p.x;
            const py = boardTopY + p.y;
            return (
              <g key={p.id} opacity={p.opacity}>
                {p.shape === 'star' ? (
                  <polygon
                    points={`${px},${py - p.size} ${px + p.size * 0.35},${py - p.size * 0.35} ${px + p.size},${py} ${px + p.size * 0.35},${py + p.size * 0.35} ${px},${py + p.size} ${px - p.size * 0.35},${py + p.size * 0.35} ${px - p.size},${py} ${px - p.size * 0.35},${py - p.size * 0.35}`}
                    fill={p.color}
                  />
                ) : p.shape === 'square' ? (
                  <rect
                    x={px - p.size / 2}
                    y={py - p.size / 2}
                    width={p.size}
                    height={p.size}
                    fill={p.color}
                    rx="1.5"
                  />
                ) : (
                  <circle cx={px} cy={py} r={p.size} fill={p.color} />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
