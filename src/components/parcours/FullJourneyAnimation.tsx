import React from 'react';

const STAGES = [
  { x: 50, label: 'Captage', icon: '🏔️' },
  { x: 150, label: 'Pompage', icon: '⚡' },
  { x: 250, label: 'Traitement', icon: '🧪' },
  { x: 350, label: 'Stockage', icon: '🏗️' },
  { x: 450, label: 'Distribution', icon: '🔧' },
  { x: 550, label: 'Robinet', icon: '🚰' },
];

const FLOW_PATH = 'M50,100 C100,100 100,70 150,70 C200,70 200,100 250,100 C300,100 300,65 350,65 C400,65 400,100 450,100 C500,100 500,75 550,75';

export const FullJourneyAnimation = () => (
  <svg viewBox="0 0 600 200" className="w-full max-w-2xl mx-auto" aria-label="Parcours complet de l'eau du captage au robinet">
    {/* Background gradient */}
    <defs>
      <linearGradient id="journey-pipe" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(210, 60%, 35%)" />
        <stop offset="50%" stopColor="hsl(200, 65%, 40%)" />
        <stop offset="100%" stopColor="hsl(142, 50%, 40%)" />
      </linearGradient>
      <linearGradient id="journey-glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(210, 80%, 60%)" />
        <stop offset="100%" stopColor="hsl(142, 70%, 55%)" />
      </linearGradient>
      <filter id="stage-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Pipe background */}
    <path d={FLOW_PATH} fill="none" stroke="hsl(220, 15%, 25%)" strokeWidth="8" strokeLinecap="round" />
    {/* Pipe highlight */}
    <path d={FLOW_PATH} fill="none" stroke="url(#journey-pipe)" strokeWidth="5" strokeLinecap="round" opacity="0.6" />

    {/* Animated water particles along the path */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
      <circle key={`particle-${i}`} r="3.5" fill="hsl(200, 80%, 65%)" opacity="0">
        <animateMotion
          path={FLOW_PATH}
          dur="6s"
          repeatCount="indefinite"
          begin={`${i * 0.75}s`}
        />
        <animate attributeName="opacity" values="0;0.9;0.9;0" dur="6s" repeatCount="indefinite" begin={`${i * 0.75}s`} />
        <animate attributeName="r" values="2.5;4;2.5" dur="6s" repeatCount="indefinite" begin={`${i * 0.75}s`} />
      </circle>
    ))}

    {/* Particle glow trail */}
    {[0, 1, 2, 3].map(i => (
      <circle key={`glow-${i}`} r="6" fill="hsl(200, 70%, 60%)" opacity="0">
        <animateMotion
          path={FLOW_PATH}
          dur="6s"
          repeatCount="indefinite"
          begin={`${i * 1.5}s`}
        />
        <animate attributeName="opacity" values="0;0.15;0.15;0" dur="6s" repeatCount="indefinite" begin={`${i * 1.5}s`} />
      </circle>
    ))}

    {/* Stage nodes */}
    {STAGES.map((stage, i) => {
      const cy = i % 2 === 0 ? 100 : (i === 1 ? 70 : i === 3 ? 65 : 75);
      const delayBase = i * 0.8;
      return (
        <g key={stage.label}>
          {/* Pulsing ring */}
          <circle cx={stage.x} cy={cy} r="18" fill="none" stroke="url(#journey-glow)" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" values="18;24;18" dur="3s" repeatCount="indefinite" begin={`${delayBase}s`} />
            <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" begin={`${delayBase}s`} />
          </circle>

          {/* Node background */}
          <circle cx={stage.x} cy={cy} r="16" fill="hsl(220, 20%, 18%)" stroke="hsl(200, 50%, 45%)" strokeWidth="2">
            <animate attributeName="stroke" values="hsl(220, 15%, 35%);hsl(200, 70%, 55%);hsl(220, 15%, 35%)" dur="4s" repeatCount="indefinite" begin={`${delayBase}s`} />
          </circle>

          {/* Icon */}
          <text x={stage.x} y={cy + 5} fontSize="14" textAnchor="middle" dominantBaseline="middle">{stage.icon}</text>

          {/* Label */}
          <text
            x={stage.x}
            y={cy + 35}
            fill="hsl(210, 20%, 75%)"
            fontSize="9"
            textAnchor="middle"
            fontWeight="600"
          >
            {stage.label}
          </text>

          {/* Step number */}
          <circle cx={stage.x + 12} cy={cy - 14} r="6" fill="hsl(200, 60%, 45%)" opacity="0.8" />
          <text x={stage.x + 12} y={cy - 11} fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">{i + 1}</text>
        </g>
      );
    })}

    {/* Directional arrows between stages */}
    {[100, 200, 300, 400, 500].map((x, i) => (
      <g key={`arrow-${i}`} opacity="0.4">
        <polygon points={`${x - 3},85 ${x + 5},88 ${x - 3},91`} fill="hsl(200, 60%, 55%)">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
        </polygon>
      </g>
    ))}

    {/* Journey distance line at bottom */}
    <line x1="50" y1="175" x2="550" y2="175" stroke="hsl(220, 15%, 25%)" strokeWidth="1" />
    <rect x="50" y="174" width="0" height="3" rx="1" fill="url(#journey-glow)">
      <animate attributeName="width" values="0;500;500" dur="4s" repeatCount="indefinite" />
    </rect>
    <text x="300" y="192" fill="hsl(210, 20%, 55%)" fontSize="8" textAnchor="middle">
      906 000 km de réseau · 24 à 48h de voyage · 63 paramètres contrôlés
    </text>
  </svg>
);

export default FullJourneyAnimation;
