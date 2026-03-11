import React from 'react';

/* ── 1. Captage: Rain infiltrating geological layers ── */
export const CaptageAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation captage eau souterraine">
    {/* Sky */}
    <rect x="0" y="0" width="300" height="50" fill="hsl(210, 50%, 30%)" />
    {/* Cloud */}
    <ellipse cx="100" cy="25" rx="40" ry="15" fill="hsl(210, 20%, 60%)" opacity="0.7" />
    <ellipse cx="130" cy="20" rx="30" ry="12" fill="hsl(210, 20%, 65%)" opacity="0.6" />
    
    {/* Rain drops with staggered animation */}
    {[60, 90, 120, 140, 80, 110].map((x, i) => (
      <ellipse
        key={i}
        cx={x}
        cy={40}
        rx="2"
        ry="4"
        fill="hsl(200, 80%, 70%)"
        style={{
          animation: `v2-rain-drop ${1.5 + i * 0.2}s ease-in infinite`,
          animationDelay: `${i * 0.3}s`,
        }}
      />
    ))}
    
    {/* Ground surface */}
    <rect x="0" y="50" width="300" height="20" fill="hsl(142, 40%, 40%)" />
    {/* Soil */}
    <rect x="0" y="70" width="300" height="35" fill="hsl(30, 40%, 45%)" />
    {/* Sand */}
    <rect x="0" y="105" width="300" height="30" fill="hsl(45, 45%, 60%)" />
    {/* Aquifer - animated shimmer */}
    <rect x="0" y="135" width="300" height="40" fill="hsl(200, 60%, 50%)">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
    </rect>
    {/* Rock */}
    <rect x="0" y="175" width="300" height="45" fill="hsl(220, 15%, 35%)" />
    
    {/* Infiltration arrows */}
    {[80, 150, 220].map((x, i) => (
      <g key={i} style={{ animation: `v2-rain-drop ${2.5}s ease-in infinite`, animationDelay: `${0.5 + i * 0.6}s` }}>
        <line x1={x} y1={55} x2={x} y2={75} stroke="hsl(200, 70%, 65%)" strokeWidth="2" strokeDasharray="4 3" />
        <polygon points={`${x - 4},75 ${x + 4},75 ${x},82`} fill="hsl(200, 70%, 65%)" />
      </g>
    ))}
    
    {/* Labels */}
    <text x="8" y="65" fill="white" fontSize="8" fontWeight="600">Surface</text>
    <text x="8" y="90" fill="white" fontSize="8" fontWeight="600">Sol</text>
    <text x="8" y="120" fill="white" fontSize="8" fontWeight="600">Sable</text>
    <text x="8" y="158" fill="white" fontSize="8" fontWeight="bold">💧 Nappe</text>
    <text x="8" y="195" fill="white" fontSize="8" fontWeight="600">Roche</text>
  </svg>
);

/* ── 2. Pompage: Pump with piston ── */
export const PompageAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation pompage">
    {/* Underground */}
    <rect x="0" y="120" width="300" height="100" fill="hsl(220, 15%, 25%)" />
    <rect x="0" y="100" width="300" height="20" fill="hsl(142, 35%, 35%)" />
    
    {/* Water table */}
    <rect x="0" y="160" width="300" height="40" fill="hsl(200, 60%, 45%)" opacity="0.5" />
    
    {/* Pump housing */}
    <rect x="120" y="50" width="60" height="50" rx="4" fill="hsl(220, 15%, 45%)" stroke="hsl(220, 15%, 55%)" strokeWidth="2" />
    
    {/* Piston - animated */}
    <g style={{ animation: 'v2-pump-piston 1.5s ease-in-out infinite' }}>
      <rect x="135" y="25" width="30" height="35" rx="3" fill="hsl(0, 0%, 55%)" />
      <rect x="145" y="10" width="10" height="20" rx="2" fill="hsl(0, 0%, 45%)" />
    </g>
    
    {/* Pipe going down */}
    <rect x="145" y="100" width="10" height="100" fill="hsl(220, 15%, 40%)" />
    
    {/* Water rising in pipe - animated */}
    <rect x="147" y="130" width="6" height="70" fill="hsl(200, 70%, 55%)" rx="1">
      <animate attributeName="y" values="180;130;180" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="height" values="20;70;20" dur="1.5s" repeatCount="indefinite" />
    </rect>
    
    {/* Output pipe */}
    <rect x="180" y="65" width="80" height="10" fill="hsl(220, 15%, 40%)" />
    
    {/* Water flowing out */}
    {[0, 1, 2, 3].map(i => (
      <circle
        key={i}
        cx={200 + i * 18}
        cy={70}
        r="3"
        fill="hsl(200, 70%, 60%)"
        style={{
          animation: `v2-flow-particle 1.2s linear infinite`,
          animationDelay: `${i * 0.3}s`,
          opacity: 0,
        }}
      >
        <animate attributeName="cx" values={`${190};${270}`} dur="1.2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
      </circle>
    ))}
    
    {/* Motor label */}
    <text x="130" y="80" fill="white" fontSize="9" fontWeight="600">Pompe</text>
    <text x="147" y="210" fill="hsl(200, 70%, 70%)" fontSize="8">Forage</text>
  </svg>
);

/* ── 3. Traitement: Purification bubbles ── */
export const TraitementAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation traitement eau">
    {/* Tank outline */}
    <rect x="40" y="20" width="220" height="180" rx="10" fill="none" stroke="hsl(270, 30%, 50%)" strokeWidth="2" />
    
    {/* Dirty water (left) */}
    <rect x="42" y="22" width="73" height="176" rx="8" fill="hsl(30, 40%, 35%)" opacity="0.6" />
    
    {/* Middle transition */}
    <defs>
      <linearGradient id="purify-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(30, 40%, 35%)" stopOpacity="0.6" />
        <stop offset="100%" stopColor="hsl(200, 70%, 55%)" stopOpacity="0.6" />
      </linearGradient>
    </defs>
    <rect x="115" y="22" width="73" height="176" fill="url(#purify-grad)" />
    
    {/* Clean water (right) */}
    <rect x="188" y="22" width="70" height="176" rx="8" fill="hsl(200, 70%, 55%)" opacity="0.6" />
    
    {/* Bubbles - brown to blue transition */}
    {[
      { cx: 70, delay: 0, color: 'hsl(30, 40%, 50%)' },
      { cx: 90, delay: 0.5, color: 'hsl(30, 35%, 55%)' },
      { cx: 120, delay: 1, color: 'hsl(200, 30%, 55%)' },
      { cx: 150, delay: 0.3, color: 'hsl(200, 50%, 55%)' },
      { cx: 180, delay: 0.8, color: 'hsl(200, 60%, 60%)' },
      { cx: 210, delay: 0.6, color: 'hsl(200, 70%, 65%)' },
      { cx: 230, delay: 1.2, color: 'hsl(200, 80%, 70%)' },
    ].map((b, i) => (
      <circle
        key={i}
        cx={b.cx}
        cy={190}
        r={4 + Math.random() * 3}
        fill={b.color}
        opacity="0.8"
        style={{
          animation: `v2-bubble-rise ${2 + i * 0.3}s ease-out infinite`,
          animationDelay: `${b.delay}s`,
        }}
      />
    ))}
    
    {/* Filter barriers */}
    {[115, 188].map((x, i) => (
      <line key={i} x1={x} y1={25} x2={x} y2={195} stroke="hsl(270, 40%, 60%)" strokeWidth="2" strokeDasharray="6 4" />
    ))}
    
    {/* Arrow showing flow direction */}
    <polygon points="135,110 155,100 155,120" fill="hsl(270, 40%, 70%)" opacity="0.8">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
    </polygon>
    
    {/* Labels */}
    <text x="55" y="15" fill="hsl(30, 50%, 70%)" fontSize="9" textAnchor="middle">Eau brute</text>
    <text x="225" y="15" fill="hsl(200, 70%, 70%)" fontSize="9" textAnchor="middle">Eau traitée</text>
  </svg>
);

/* ── 4. Stockage: Water tower with oscillating level ── */
export const StockageAnimation = () => (
  <svg viewBox="0 0 200 250" className="w-32 mx-auto" aria-label="Château d'eau animé">
    {/* Legs */}
    <line x1="60" y1="250" x2="80" y2="140" stroke="hsl(220, 15%, 45%)" strokeWidth="6" />
    <line x1="140" y1="250" x2="120" y2="140" stroke="hsl(220, 15%, 45%)" strokeWidth="6" />
    {/* Cross brace */}
    <line x1="70" y1="200" x2="130" y2="180" stroke="hsl(220, 15%, 45%)" strokeWidth="2" />
    
    {/* Tank */}
    <rect x="50" y="50" width="100" height="95" rx="8" fill="hsl(220, 15%, 55%)" />
    
    {/* Water fill with animated level */}
    <clipPath id="tank-clip">
      <rect x="54" y="50" width="92" height="91" rx="6" />
    </clipPath>
    <g clipPath="url(#tank-clip)">
      <rect x="54" y="60" width="92" height="81" fill="hsl(200, 70%, 50%)" opacity="0.8">
        <animate attributeName="y" values="65;60;65" dur="3s" repeatCount="indefinite" />
        <animate attributeName="height" values="76;81;76" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Wave surface */}
      <path d="M54,65 Q77,60 100,65 Q123,70 146,65" fill="hsl(200, 80%, 60%)" opacity="0.6">
        <animate attributeName="d" values="M54,65 Q77,60 100,65 Q123,70 146,65;M54,65 Q77,70 100,65 Q123,60 146,65;M54,65 Q77,60 100,65 Q123,70 146,65" dur="2s" repeatCount="indefinite" />
      </path>
    </g>
    
    {/* Roof */}
    <polygon points="40,55 100,15 160,55" fill="hsl(220, 15%, 40%)" />
    
    {/* Level indicator */}
    <rect x="155" y="60" width="6" height="80" rx="2" fill="hsl(220, 15%, 35%)" />
    <rect x="156" y="65" width="4" height="30" rx="1" fill="hsl(120, 60%, 50%)">
      <animate attributeName="y" values="70;65;70" dur="3s" repeatCount="indefinite" />
      <animate attributeName="height" values="25;30;25" dur="3s" repeatCount="indefinite" />
    </rect>
  </svg>
);

/* ── 5. Distribution: Pipe network with flowing particles ── */
export const DistributionAnimation = () => (
  <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto" aria-label="Animation réseau distribution">
    {/* Main pipe horizontal */}
    <rect x="20" y="40" width="260" height="14" rx="3" fill="hsl(220, 15%, 40%)" />
    <rect x="22" y="42" width="256" height="10" rx="2" fill="hsl(220, 15%, 30%)" />
    
    {/* Branch pipes */}
    <rect x="80" y="54" width="10" height="60" rx="2" fill="hsl(220, 15%, 40%)" />
    <rect x="150" y="54" width="10" height="80" rx="2" fill="hsl(220, 15%, 40%)" />
    <rect x="220" y="54" width="10" height="50" rx="2" fill="hsl(220, 15%, 40%)" />
    
    {/* Sub-branches */}
    <rect x="60" y="110" width="50" height="8" rx="2" fill="hsl(220, 15%, 38%)" />
    <rect x="130" y="130" width="50" height="8" rx="2" fill="hsl(220, 15%, 38%)" />
    <rect x="200" y="100" width="50" height="8" rx="2" fill="hsl(220, 15%, 38%)" />
    
    {/* House icons at endpoints */}
    {[85, 155, 225].map((x, i) => (
      <g key={i}>
        <polygon
          points={`${x - 8},${110 + i * 20} ${x},${100 + i * 20} ${x + 8},${110 + i * 20}`}
          fill="hsl(30, 40%, 55%)"
        />
        <rect x={x - 5} y={110 + i * 20} width="10" height="10" fill="hsl(30, 40%, 50%)" />
      </g>
    ))}
    
    {/* Flowing water particles in main pipe */}
    {[0, 1, 2, 3, 4, 5].map(i => (
      <circle
        key={`main-${i}`}
        cy={47}
        r="3"
        fill="hsl(200, 80%, 65%)"
        opacity="0"
      >
        <animate attributeName="cx" values="25;275" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
        <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
      </circle>
    ))}
    
    {/* Flowing particles in branch pipes */}
    {[85, 155, 225].map((x, i) => (
      <circle
        key={`branch-${i}`}
        cx={x + 5}
        r="2.5"
        fill="hsl(200, 80%, 65%)"
        opacity="0"
      >
        <animate attributeName="cy" values={`55;${110 + i * 15}`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" begin={`${0.5 + i * 0.4}s`} />
        <animate attributeName="opacity" values="0;1;1;0" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" begin={`${0.5 + i * 0.4}s`} />
      </circle>
    ))}
    
    {/* Pressure indicators */}
    {[50, 150, 240].map((x, i) => (
      <g key={`pressure-${i}`}>
        <circle cx={x} cy={35} r="8" fill="hsl(220, 15%, 50%)" stroke="hsl(220, 15%, 60%)" strokeWidth="1" />
        <text x={x} y={38} fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">{5 - i}</text>
      </g>
    ))}
    
    <text x="150" y="190" fill="hsl(180, 40%, 60%)" fontSize="10" textAnchor="middle" fontWeight="600">906 000 km de réseau</text>
  </svg>
);

/* ── 6. Robinet: Faucet dripping into glass ── */
export const RobinetAnimation = () => (
  <svg viewBox="0 0 200 220" className="w-48 mx-auto" aria-label="Animation robinet">
    {/* Wall */}
    <rect x="0" y="0" width="200" height="50" fill="hsl(220, 15%, 85%)" rx="4" />
    
    {/* Pipe from wall */}
    <rect x="70" y="40" width="16" height="30" rx="2" fill="hsl(220, 10%, 55%)" />
    
    {/* Faucet body */}
    <rect x="55" y="65" width="45" height="18" rx="6" fill="hsl(220, 10%, 50%)" />
    <rect x="50" y="60" width="10" height="25" rx="3" fill="hsl(220, 10%, 55%)" />
    
    {/* Faucet spout */}
    <path d="M100,74 L120,74 L120,80 Q120,88 112,88 L108,88" fill="hsl(220, 10%, 48%)" />
    
    {/* Handle */}
    <rect x="68" y="52" width="20" height="8" rx="3" fill="hsl(220, 10%, 60%)" />
    <circle cx="78" cy="56" r="4" fill="hsl(220, 10%, 65%)" />
    
    {/* Water stream */}
    <rect x="108" y="88" width="4" height="60" rx="2" fill="hsl(200, 70%, 60%)" opacity="0.7">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1s" repeatCount="indefinite" />
      <animate attributeName="width" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
    </rect>
    
    {/* Dripping drops */}
    {[0, 1, 2].map(i => (
      <ellipse
        key={i}
        cx={110}
        cy={88}
        rx="2"
        ry="3"
        fill="hsl(200, 80%, 65%)"
        style={{
          animation: `v2-faucet-drip 1.2s ease-in infinite`,
          animationDelay: `${i * 0.4}s`,
        }}
      />
    ))}
    
    {/* Glass */}
    <path d="M90,155 L92,205 L128,205 L130,155 Z" fill="none" stroke="hsl(200, 20%, 70%)" strokeWidth="2" />
    <path d="M88,155 L132,155" stroke="hsl(200, 20%, 70%)" strokeWidth="2" />
    
    {/* Water filling the glass */}
    <clipPath id="glass-clip">
      <path d="M92,160 L93,203 L127,203 L128,160 Z" />
    </clipPath>
    <g clipPath="url(#glass-clip)">
      <rect x="92" y="203" width="36" height="0" fill="hsl(200, 70%, 60%)" opacity="0.5">
        <animate attributeName="y" values="203;160;203" dur="6s" repeatCount="indefinite" />
        <animate attributeName="height" values="0;43;0" dur="6s" repeatCount="indefinite" />
      </rect>
      {/* Mini waves */}
      <path d="M92,170 Q102,167 110,170 Q118,173 128,170" fill="hsl(200, 80%, 65%)" opacity="0.4">
        <animate attributeName="d" values="M92,170 Q102,167 110,170 Q118,173 128,170;M92,170 Q102,173 110,170 Q118,167 128,170;M92,170 Q102,167 110,170 Q118,173 128,170" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="transform" values="translate(0,33);translate(0,0);translate(0,33)" dur="6s" repeatCount="indefinite" type="translate" />
      </path>
    </g>
    
    <text x="100" y="218" fill="hsl(142, 50%, 55%)" fontSize="9" textAnchor="middle" fontWeight="600">✅ Eau potable</text>
  </svg>
);
