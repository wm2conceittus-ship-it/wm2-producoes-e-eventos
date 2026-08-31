import React from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

export default function Logo({ className = '', showSubtitle = true, variant = 'color' }: LogoProps) {
  // Define dynamic colors based on the variant
  const isLight = variant === 'light';
  
  // Gradients for WM and 2
  const wmGoldGradientId = `wm-gold-grad-${variant}`;
  const redGradientId = `red-grad-${variant}`;
  
  // Subtitle color
  const subtitleColor = isLight ? '#ffffff' : '#3a3a3a';
  const shadowColor = '#111111';

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 540 185"
        className="w-full h-auto"
        style={{ maxHeight: '100%' }}
        id="wm2-logo-svg"
      >
        <defs>
          {/* Metallic Gold Gradient for "WM" */}
          <linearGradient id={wmGoldGradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8d7a4c" />
            <stop offset="15%" stopColor="#bfae7e" />
            <stop offset="35%" stopColor="#fdf7df" />
            <stop offset="55%" stopColor="#cfc094" />
            <stop offset="80%" stopColor="#a3905d" />
            <stop offset="100%" stopColor="#6e5e35" />
          </linearGradient>

          {/* Deep Glossy Burgundy/Red Gradient for "2" */}
          <linearGradient id={redGradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#300000" />
            <stop offset="30%" stopColor="#5c0601" />
            <stop offset="65%" stopColor="#a11a10" />
            <stop offset="90%" stopColor="#e23c2d" />
            <stop offset="100%" stopColor="#f3594b" />
          </linearGradient>
        </defs>

        <g>
          {/* --- CRISP 3D SHADOWS (Drawn behind) --- */}
          {/* Shadow for WM */}
          <path
            d="M 12 18 L 100 18 L 140 142 L 180 18 L 255 18 L 295 142 L 335 18 L 418 18 L 380 152 L 285 152 L 245 42 L 205 152 L 110 152 Z"
            fill={shadowColor}
            transform="translate(6, -6)"
            opacity="0.9"
          />
          {/* Shadow for 2 */}
          <path
            d="M 410 18 C 450 18, 498 18, 508 52 C 518 85, 448 112, 435 125 L 512 125 L 512 152 L 398 152 C 398 140, 420 115, 455 85 C 478 65, 482 45, 452 45 C 430 45, 412 55, 412 55 Z"
            fill={shadowColor}
            transform="translate(6, -6)"
            opacity="0.9"
          />

          {/* --- MAIN COLORED FOREGROUND PATHS --- */}
          {/* WM Path */}
          <path
            d="M 12 18 L 100 18 L 140 142 L 180 18 L 255 18 L 295 142 L 335 18 L 418 18 L 380 152 L 285 152 L 245 42 L 205 152 L 110 152 Z"
            fill={`url(#${wmGoldGradientId})`}
          />
          {/* 2 Path */}
          <path
            d="M 410 18 C 450 18, 498 18, 508 52 C 518 85, 448 112, 435 125 L 512 125 L 512 152 L 398 152 C 398 140, 420 115, 455 85 C 478 65, 482 45, 452 45 C 430 45, 412 55, 412 55 Z"
            fill={`url(#${redGradientId})`}
          />

          {/* Subtitle "PRODUÇÕES & EVENTOS" at the bottom */}
          {showSubtitle && (
            <text
              x="270"
              y="180"
              fontFamily="'Cinzel', 'Georgia', 'Times New Roman', serif"
              fontSize="24"
              fontWeight="700"
              letterSpacing="6"
              fill={subtitleColor}
              textAnchor="middle"
              className="uppercase select-none"
              style={{ letterSpacing: '0.24em' }}
            >
              PRODUÇÕES &amp; EVENTOS
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}

