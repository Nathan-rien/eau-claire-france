import React from 'react';

const STAGES = [
  { x: 50, label: 'Captage', icon: '🏔️' },
  { x: 150, label: 'Analyse', icon: '🔬' },
  { x: 250, label: 'Embouteillage', icon: '🏭' },
  { x: 350, label: 'Étiquetage', icon: '🏷️' },
  { x: 450, label: 'Transport', icon: '🚛' },
  { x: 550, label: 'Achat', icon: '🛒' },
];

const FLOW_PATH = 'M50,100 C100,100 100,70 150,70 C200,70 200,100 250,100 C300,100 300,65 350,65 C400,65 400,100 450,100 C500,100 500,75 550,75';

export const BottleJourneyAnimation = () => (
  <svg viewBox="0 0 600 200" className="w-full max-w-2xl mx-auto" aria-label="Parcours complet de l'eau en bouteille, du captage à l'achat">
    <defs>
      <linearGradient id="bottle-pipe" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(200, 60%, 35%)" />
        <stop offset="50%" stopColor="hsl(180, 65%, 40%)" />
        <stop offset="100%" stopColor="hsl(160, 50%, 40%)" />
      </linearGradient>
      <linearGradient id="bottle-glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(200, 80%, 60%)" />
        <stop offset="100%" stopColor="hsl(160, 70%, 55%)" />
      </linearGradient>
      <filter id="bottle-stage-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Pipe background */}
    <path d={FLOW_PATH} fill="none" stroke="hsl(220, 15%, 25%)" strokeWidth="8" strokeLinecap="round" />
    <path d={FLOW_PATH} fill="none" stroke="url(#bottle-pipe)" strokeWidth="5" strokeLinecap="round" opacity="0.6" />

    {/* Animated water particles */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
      <circle key={`particle-${i}`} r="3.5" fill="hsl(190, 80%, 65%)" opacity="0">
        <animateMotion path={FLOW_PATH} dur="6s" repeatCount="indefinite" begin={`${i * 0.75}s`} />
        <animate attributeName="opacity" values="0;0.9;0.9;0" dur="6s" repeatCount="indefinite" begin={`${i * 0.75}s`} />
        <animate attributeName="r" values="2.5;4;2.5" dur="6s" repeatCount="indefinite" begin={`${i * 0.75}s`} />
      </circle>
    ))}

    {/* Glow trail */}
    {[0, 1, 2, 3].map(i => (
      <circle key={`glow-${i}`} r="6" fill="hsl(190, 70%, 60%)" opacity="0">
        <animateMotion path={FLOW_PATH} dur="6s" repeatCount="indefinite" begin={`${i * 1.5}s`} />
        <animate attributeName="opacity" values="0;0.15;0.15;0" dur="6s" repeatCount="indefinite" begin={`${i * 1.5}s`} />
      </circle>
    ))}

    {/* Stage nodes */}
    {STAGES.map((stage, i) => {
      const cy = i % 2 === 0 ? 100 : (i === 1 ? 70 : i === 3 ? 65 : 75);
      const delayBase = i * 0.8;
      return (
        <g key={stage.label}>
          <circle cx={stage.x} cy={cy} r="18" fill="none" stroke="url(#bottle-glow)" strokeWidth="1.5" opacity="0">
            <animate attributeName="r" values="18;24;18" dur="3s" repeatCount="indefinite" begin={`${delayBase}s`} />
            <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" begin={`${delayBase}s`} />
          </circle>
          <circle cx={stage.x} cy={cy} r="16" fill="hsl(220, 20%, 18%)" stroke="hsl(190, 50%, 45%)" strokeWidth="2">
            <animate attributeName="stroke" values="hsl(220, 15%, 35%);hsl(190, 70%, 55%);hsl(220, 15%, 35%)" dur="4s" repeatCount="indefinite" begin={`${delayBase}s`} />
          </circle>
          <text x={stage.x} y={cy + 5} fontSize="14" textAnchor="middle" dominantBaseline="middle">{stage.icon}</text>
          <text x={stage.x} y={cy + 35} fill="hsl(210, 20%, 75%)" fontSize="9" textAnchor="middle" fontWeight="600">{stage.label}</text>
          <circle cx={stage.x + 12} cy={cy - 14} r="6" fill="hsl(190, 60%, 45%)" opacity="0.8" />
          <text x={stage.x + 12} y={cy - 11} fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">{i + 1}</text>
        </g>
      );
    })}

    {/* Directional arrows */}
    {[100, 200, 300, 400, 500].map((x, i) => (
      <g key={`arrow-${i}`} opacity="0.4">
        <polygon points={`${x - 3},85 ${x + 5},88 ${x - 3},91`} fill="hsl(190, 60%, 55%)">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
        </polygon>
      </g>
    ))}

    {/* Progress line */}
    <line x1="50" y1="175" x2="550" y2="175" stroke="hsl(220, 15%, 25%)" strokeWidth="1" />
    <rect x="50" y="174" width="0" height="3" rx="1" fill="url(#bottle-glow)">
      <animate attributeName="width" values="0;500;500" dur="4s" repeatCount="indefinite" />
    </rect>
    <text x="300" y="192" fill="hsl(210, 20%, 55%)" fontSize="8" textAnchor="middle">
      158 sources · 9,3 Mds litres/an · 300 km en moyenne
    </text>
  </svg>
);

export default BottleJourneyAnimation;
