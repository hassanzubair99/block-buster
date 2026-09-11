import React, { memo } from 'react';
import { Block, BlockColor } from '../types';

interface IsometricBlockProps {
  block: Block;
  size: number; // width in pixels of the base isometric tile
  onClick: (block: Block) => void;
  onPointerEnter?: (block: Block) => void;
  isSelectedInMatch?: boolean;
}

// Color palettes with top, front, and side shading for genuine isometric 3D illusion
const COLOR_THEMES: Record<
  BlockColor,
  {
    top: string;
    topHighlight: string;
    front: string;
    side: string;
    accent: string;
    border: string;
    glow: string;
  }
> = {
  yellow: {
    top: '#FFE26A',
    topHighlight: '#FFF3AA',
    front: '#FBBF24',
    side: '#D97706',
    accent: '#B45309',
    border: '#F59E0B',
    glow: 'rgba(251, 191, 36, 0.6)',
  },
  pink: {
    top: '#FDA4AF',
    topHighlight: '#FFE4E6',
    front: '#F43F5E',
    side: '#BE123C',
    accent: '#881337',
    border: '#E11D48',
    glow: 'rgba(244, 63, 94, 0.6)',
  },
  blue: {
    top: '#7DD3FC',
    topHighlight: '#BAE6FD',
    front: '#0EA5E9',
    side: '#0369A1',
    accent: '#075985',
    border: '#0284C7',
    glow: 'rgba(14, 165, 233, 0.6)',
  },
  purple: {
    top: '#D8B4FE',
    topHighlight: '#F3E8FF',
    front: '#A855F7',
    side: '#7E22CE',
    accent: '#581C87',
    border: '#9333EA',
    glow: 'rgba(168, 85, 247, 0.6)',
  },
  orange: {
    top: '#FDBA74',
    topHighlight: '#FFEDD5',
    front: '#F97316',
    side: '#C2410C',
    accent: '#7C2D12',
    border: '#EA580C',
    glow: 'rgba(249, 115, 22, 0.6)',
  },
  green: {
    top: '#86EFAC',
    topHighlight: '#DCFCE7',
    front: '#22C55E',
    side: '#15803D',
    accent: '#14532D',
    border: '#16A34A',
    glow: 'rgba(34, 197, 94, 0.6)',
  },
};

// Expressive cute face SVG paths tailored to each block type
const renderFace = (color: BlockColor, isSelected: boolean) => {
  switch (color) {
    case 'yellow': // Cheerful Star Smile
      return (
        <g className="transition-transform duration-200" transform={isSelected ? 'scale(1.1) translate(-2, -2)' : ''}>
          {/* Eyes: Shiny curved happy eyes */}
          <path d="M12 15 Q16 11 20 15" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M30 15 Q34 11 38 15" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Star twinkle sparkle in corner of eye */}
          <circle cx="21" cy="12" r="1.4" fill="#FFF" />
          <circle cx="39" cy="12" r="1.4" fill="#FFF" />
          {/* Cute pink rosy cheeks */}
          <ellipse cx="11" cy="20" rx="3.5" ry="2" fill="#F43F5E" opacity="0.65" />
          <ellipse cx="39" cy="20" rx="3.5" ry="2" fill="#F43F5E" opacity="0.65" />
          {/* Mouth: open happy smile */}
          <path d="M20 20 Q25 28 30 20 Z" fill="#92400E" />
          <path d="M22 23 Q25 27 28 23" fill="#F43F5E" />
        </g>
      );
    case 'pink': // Heart Eyes / Loving Wink
      return (
        <g className="transition-transform duration-200" transform={isSelected ? 'scale(1.1) translate(-2, -2)' : ''}>
          {/* Heart shaped eyes */}
          <path
            d="M13 14 C13 12 15 10 17 12 C19 10 21 12 21 14 C21 16 17 19 17 19 C17 19 13 16 13 14 Z"
            fill="#FFF"
            stroke="#9F1239"
            strokeWidth="1.2"
          />
          <path
            d="M29 14 C29 12 31 10 33 12 C35 10 37 12 37 14 C37 16 33 19 33 19 C33 19 29 16 29 14 Z"
            fill="#FFF"
            stroke="#9F1239"
            strokeWidth="1.2"
          />
          {/* Rosy blush */}
          <circle cx="12" cy="20" r="3" fill="#FB7185" opacity="0.75" />
          <circle cx="38" cy="20" r="3" fill="#FB7185" opacity="0.75" />
          {/* Cute kissy mouth */}
          <path d="M23 21 Q25 24 27 21" stroke="#9F1239" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'blue': // Chill / Cool Winking Face
      return (
        <g className="transition-transform duration-200" transform={isSelected ? 'scale(1.1) translate(-2, -2)' : ''}>
          {/* Left eye wink */}
          <path d="M13 16 Q17 12 21 16" stroke="#0C4A6E" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          {/* Right eye open with sparkle */}
          <circle cx="34" cy="15" r="4.2" fill="#0C4A6E" />
          <circle cx="35.5" cy="13.5" r="1.8" fill="#FFF" />
          <circle cx="32.5" cy="16.5" r="0.9" fill="#FFF" />
          {/* Cheeks */}
          <ellipse cx="12" cy="20" rx="3.2" ry="1.8" fill="#38BDF8" opacity="0.6" />
          <ellipse cx="38" cy="20" rx="3.2" ry="1.8" fill="#38BDF8" opacity="0.6" />
          {/* Smug playful grin */}
          <path d="M22 21 Q27 26 31 20" stroke="#0C4A6E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      );
    case 'purple': // Playful Joy / Kawaii Squint
      return (
        <g className="transition-transform duration-200" transform={isSelected ? 'scale(1.1) translate(-2, -2)' : ''}>
          {/* Eyes: > < Kawaii squint */}
          <path d="M13 14 L18 17 L13 20" stroke="#581C87" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M37 14 L32 17 L37 20" stroke="#581C87" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Blushing cheek dots */}
          <circle cx="11" cy="22" r="2.8" fill="#E879F9" opacity="0.8" />
          <circle cx="39" cy="22" r="2.8" fill="#E879F9" opacity="0.8" />
          {/* Tongue out cute mouth */}
          <path d="M21 21 Q25 24 29 21" stroke="#581C87" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M23 22 Q25 28 27 22 Z" fill="#F43F5E" />
        </g>
      );
    case 'orange': // Energetic Determined Face
      return (
        <g className="transition-transform duration-200" transform={isSelected ? 'scale(1.1) translate(-2, -2)' : ''}>
          {/* Eyebrows angled */}
          <path d="M12 11 L19 14" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 11 L31 14" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />
          {/* Big round excited eyes */}
          <circle cx="16" cy="17" r="3.8" fill="#7C2D12" />
          <circle cx="17.2" cy="15.8" r="1.6" fill="#FFF" />
          <circle cx="34" cy="17" r="3.8" fill="#7C2D12" />
          <circle cx="35.2" cy="15.8" r="1.6" fill="#FFF" />
          {/* Cheeks */}
          <ellipse cx="10" cy="21" rx="3.5" ry="2" fill="#FDBA74" opacity="0.7" />
          <ellipse cx="40" cy="21" rx="3.5" ry="2" fill="#FDBA74" opacity="0.7" />
          {/* Open excited 'D' mouth */}
          <path d="M21 21 Q25 28 29 21 Z" fill="#7C2D12" />
          <circle cx="25" cy="24" r="1.5" fill="#FCA5A5" />
        </g>
      );
    case 'green': // Zen Happy Smile
      return (
        <g className="transition-transform duration-200" transform={isSelected ? 'scale(1.1) translate(-2, -2)' : ''}>
          {/* Peaceful curved eyes */}
          <path d="M13 17 Q17 12 21 17" stroke="#14532D" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M29 17 Q33 12 37 17" stroke="#14532D" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {/* Little green leaf sprout on top forehead */}
          <path d="M25 10 Q28 6 31 8 Q30 11 25 11 Z" fill="#4ADE80" stroke="#166534" strokeWidth="1" />
          {/* Rosy gentle blush */}
          <circle cx="11" cy="20" r="3" fill="#BBF7D0" opacity="0.8" />
          <circle cx="39" cy="20" r="3" fill="#BBF7D0" opacity="0.8" />
          {/* Gentle happy curve mouth */}
          <path d="M22 22 Q25 25 28 22" stroke="#14532D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      );
  }
};

export const IsometricBlock: React.FC<IsometricBlockProps> = memo(
  ({ block, size, onClick, onPointerEnter, isSelectedInMatch }) => {
    const theme = COLOR_THEMES[block.color];

    // True Isometric 3D dimensions
    const width = size;
    const height = Math.round(size * 0.58);
    const depth = Math.round(size * 0.44); // 3D thickness / extrusion downwards
    const totalSvgHeight = height + depth + 14;

    const isElevated = isSelectedInMatch || block.isSelected;

    // Diamond polygon points for top isometric face
    const topPoints = `${width / 2},2 ${width - 2},${height / 2} ${width / 2},${height - 2} 2,${height / 2}`;

    // Front-Left Face points (drops down from left edge to bottom front)
    const frontLeftPoints = `2,${height / 2} ${width / 2},${height - 2} ${width / 2},${height + depth - 2} 2,${height / 2 + depth}`;

    // Front-Right Face points (drops down from front to right edge)
    const frontRightPoints = `${width / 2},${height - 2} ${width - 2},${height / 2} ${width - 2},${height / 2 + depth} ${width / 2},${height + depth - 2}`;

    return (
      <div
        id={`block-${block.row}-${block.col}`}
        role="button"
        tabIndex={0}
        onClick={() => onClick(block)}
        onPointerEnter={() => onPointerEnter && onPointerEnter(block)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(block);
          }
        }}
        className={`relative cursor-pointer select-none outline-none ${
          block.isMatched
            ? 'animate-pop-burst'
            : 'transition-transform duration-250 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
        } ${block.isNew ? 'animate-bounce-in' : ''}`}
        style={{
          width: `${width}px`,
          height: `${totalSvgHeight}px`,
          transform: isElevated ? 'translateY(-14px) scale(1.08)' : 'translateY(0px)',
          zIndex: isElevated ? 40 : 10 + block.row + block.col,
        }}
        title={`${block.color} block (${block.row}, ${block.col})`}
      >
        {/* Ground Drop Shadow */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-250 ease-out"
          style={{
            left: `${width * 0.1}px`,
            bottom: '2px',
            width: `${width * 0.8}px`,
            height: `${height * 0.7}px`,
            backgroundColor: 'rgba(55, 40, 20, 0.2)',
            filter: isElevated ? 'blur(8px)' : 'blur(3.5px)',
            transform: isElevated ? 'scale(1.28) translateY(8px)' : 'scale(1)',
            opacity: isElevated ? 0.32 : 0.65,
          }}
        />

        {/* Isometric 3D SVG Cube */}
        <svg
          viewBox={`0 0 ${width} ${totalSvgHeight}`}
          width={width}
          height={totalSvgHeight}
          className="overflow-visible filter drop-shadow-sm"
        >
          <defs>
            {/* Top Glossy Gradient */}
            <linearGradient id={`grad-top-${block.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.topHighlight} />
              <stop offset="60%" stopColor={theme.top} />
              <stop offset="100%" stopColor={theme.front} />
            </linearGradient>

            {/* Front-Left Face Gradient */}
            <linearGradient id={`grad-front-${block.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.front} />
              <stop offset="100%" stopColor={theme.side} />
            </linearGradient>

            {/* Front-Right Shaded Face Gradient */}
            <linearGradient id={`grad-side-${block.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.side} />
              <stop offset="100%" stopColor={theme.accent} />
            </linearGradient>

            {/* Ice Overlay Gradient */}
            <linearGradient id={`grad-ice-${block.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="50%" stopColor="rgba(186, 230, 253, 0.65)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0.45)" />
            </linearGradient>

            {/* Crate Wood Texture Gradient */}
            <linearGradient id={`grad-crate-${block.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>

          {/* If block is a Crate Obstacle, render Wooden Crate Box */}
          {block.obstacle === 'crate' ? (
            <g>
              {/* Crate Top Face */}
              <polygon
                points={topPoints}
                fill="#FBBF24"
                stroke="#B45309"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <line x1={width / 2} y1="2" x2={width / 2} y2={height - 2} stroke="#B45309" strokeWidth="1.5" />
              {/* Crate Front Left Face */}
              <polygon
                points={frontLeftPoints}
                fill={`url(#grad-crate-${block.id})`}
                stroke="#78350F"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <line x1="2" y1={height / 2} x2={width / 2} y2={height + depth - 2} stroke="#78350F" strokeWidth="1.5" />
              {/* Crate Front Right Face */}
              <polygon
                points={frontRightPoints}
                fill="#78350F"
                stroke="#451A03"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Crate X metal reinforcement */}
              <line x1={width / 2} y1={height - 2} x2={width - 2} y2={height / 2 + depth} stroke="#451A03" strokeWidth="1.5" />
            </g>
          ) : (
            /* Regular Cute Toy Block Cube */
            <g>
              {/* 1. FRONT-RIGHT FACE (Deep Shaded Side) */}
              <polygon
                points={frontRightPoints}
                fill={`url(#grad-side-${block.id})`}
                stroke={theme.accent}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* 2. FRONT-LEFT FACE (Main Face with Cute Expression) */}
              <polygon
                points={frontLeftPoints}
                fill={`url(#grad-front-${block.id})`}
                stroke={theme.border}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Front Face Expressive Cute Emoji Features */}
              <g
                transform={`translate(${width * 0.08}, ${height * 0.6}) skewY(14) scale(${size / 64})`}
                className="pointer-events-none"
              >
                {renderFace(block.color, isElevated)}
              </g>

              {/* 3. TOP FACE (Glossy Beveled Diamond Face) */}
              <polygon
                points={topPoints}
                fill={`url(#grad-top-${block.id})`}
                stroke="#FFFFFF"
                strokeWidth={isElevated ? '2.5' : '1.2'}
                strokeLinejoin="round"
                className="transition-all duration-200"
              />

              {/* Glossy Curved Light Sheen on Top Edge */}
              <path
                d={`M${width / 2},4 L${width - 6},${height / 2} L${width / 2},${height * 0.45} Z`}
                fill="rgba(255, 255, 255, 0.45)"
                className="pointer-events-none"
              />

              {/* Soft specular white dot */}
              <ellipse
                cx={width / 2}
                cy={height * 0.35}
                rx={width * 0.12}
                ry={height * 0.14}
                fill="rgba(255, 255, 255, 0.7)"
                className="pointer-events-none"
              />

              {/* Special Block Badge Overlays */}
              {block.special === 'line_horizontal' && (
                <g transform={`translate(${width * 0.25}, ${height * 0.15}) scale(${size / 64})`} className="pointer-events-none animate-pulse">
                  <circle cx="16" cy="12" r="9" fill="rgba(255, 255, 255, 0.9)" stroke="#F59E0B" strokeWidth="1.5" />
                  <path d="M10 12 L22 12 M10 12 L13 9 M10 12 L13 15 M22 12 L19 9 M22 12 L19 15" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}

              {block.special === 'line_vertical' && (
                <g transform={`translate(${width * 0.25}, ${height * 0.15}) scale(${size / 64})`} className="pointer-events-none animate-pulse">
                  <circle cx="16" cy="12" r="9" fill="rgba(255, 255, 255, 0.9)" stroke="#F59E0B" strokeWidth="1.5" />
                  <path d="M16 6 L16 18 M16 6 L13 9 M16 6 L19 9 M16 18 L13 15 M16 18 L19 15" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}

              {block.special === 'bomb' && (
                <g transform={`translate(${width * 0.22}, ${height * 0.05}) scale(${size / 64})`} className="pointer-events-none animate-bounce">
                  <circle cx="18" cy="14" r="9.5" fill="#1F2937" stroke="#EF4444" strokeWidth="1.8" />
                  {/* Glowing fuse */}
                  <path d="M18 5 Q22 2 24 4" stroke="#F59E0B" strokeWidth="2" fill="none" />
                  <circle cx="25" cy="4" r="2.2" fill="#FBBF24" className="animate-ping" />
                  {/* Bomb eye shine */}
                  <circle cx="15" cy="12" r="1.5" fill="#FFF" />
                  {/* Skull / explosion comic icon */}
                  <path d="M15 15 Q18 18 21 15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}

              {block.special === 'color_blast' && (
                <g transform={`translate(${width * 0.22}, ${height * 0.05}) scale(${size / 64})`} className="pointer-events-none">
                  {/* Rainbow star disco disc */}
                  <circle cx="18" cy="14" r="10" fill="url(#rainbow-grad)" stroke="#FFFFFF" strokeWidth="2" />
                  <polygon
                    points="18,6 20.5,11.5 26,12 22,16 23,21.5 18,18.5 13,21.5 14,16 10,12 15.5,11.5"
                    fill="#FFD700"
                    stroke="#B45309"
                    strokeWidth="1"
                    className="animate-spin-slow origin-center"
                  />
                </g>
              )}

              {/* Ice Layer Overlay (if block is frozen) */}
              {block.obstacle === 'ice' && (
                <g className="pointer-events-none">
                  {/* Frosted ice top cap */}
                  <polygon
                    points={topPoints}
                    fill={`url(#grad-ice-${block.id})`}
                    stroke="#BAE6FD"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    opacity="0.88"
                  />
                  {/* Frosted ice front faces */}
                  <polygon
                    points={frontLeftPoints}
                    fill={`url(#grad-ice-${block.id})`}
                    stroke="#7DD3FC"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    opacity="0.75"
                  />
                  <polygon
                    points={frontRightPoints}
                    fill={`url(#grad-ice-${block.id})`}
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    opacity="0.65"
                  />
                  {/* Ice crack lines */}
                  <path d={`M${width * 0.3},${height * 0.3} L${width * 0.5},${height * 0.6} L${width * 0.6},${height * 0.4}`} stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.9" />
                  <path d={`M${width * 0.4},${height * 0.7} L${width * 0.5},${height + depth * 0.4}`} stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.9" />
                </g>
              )}

              {/* Selection Golden Neon Pulse Contour */}
              {isElevated && (
                <polygon
                  points={topPoints}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 0 6px #FDE047)"
                  className="animate-pulse"
                />
              )}

              {/* Hint Gentle Pulse */}
              {block.isHinted && !isElevated && (
                <polygon
                  points={topPoints}
                  fill="rgba(255, 255, 255, 0.4)"
                  stroke="#FDE047"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  className="animate-ping origin-center"
                />
              )}
            </g>
          )}
        </svg>

        {/* Rainbow Linear Gradient Definition once in document */}
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <linearGradient id="rainbow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="20%" stopColor="#F97316" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="60%" stopColor="#22C55E" />
              <stop offset="80%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }
);

IsometricBlock.displayName = 'IsometricBlock';
