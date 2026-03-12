import React from 'react';

/* ── 1. Geological Cross-Section for mineral water ── */
export const GeologicalSourceAnimation = () => (
  <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto" aria-label="Coupe géologique source minérale">
    {/* Surface with vegetation */}
    <rect x="0" y="0" width="300" height="25" fill="hsl(142, 40%, 40%)" />
    {/* Limestone */}
    <rect x="0" y="25" width="300" height="35" fill="hsl(40, 30%, 60%)">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
    </rect>
    {/* Clay */}
    <rect x="0" y="60" width="300" height="30" fill="hsl(20, 35%, 45%)" />
    {/* Sandstone */}
    <rect x="0" y="90" width="300" height="35" fill="hsl(35, 40%, 55%)" />
    {/* Deep granite */}
    <rect x="0" y="125" width="300" height="35" fill="hsl(220, 15%, 35%)" />
    {/* Deep aquifer - shimmering */}
    <rect x="0" y="160" width="300" height="40" fill="hsl(200, 60%, 45%)" opacity="0.6">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
    </rect>
    
    {/* Mineral enrichment particles */}
    {[60, 120, 180, 240].map((x, i) => (
      <circle key={i} cx={x} cy={50} r="2" fill="hsl(45, 70%, 65%)" opacity="0">
        <animate attributeName="cy" values="30;170" dur={`${4 + i}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
        <animate attributeName="opacity" values="0;0.7;0.7;0" dur={`${4 + i}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
      </circle>
    ))}
    
    {/* Labels */}
    <text x="8" y="16" fill="white" fontSize="8" fontWeight="600">Surface</text>
    <text x="8" y="47" fill="white" fontSize="8" fontWeight="600">Calcaire (Ca²⁺)</text>
    <text x="8" y="80" fill="white" fontSize="8" fontWeight="600">Argile</text>
    <text x="8" y="112" fill="white" fontSize="8" fontWeight="600">Grès (Mg²⁺)</text>
    <text x="8" y="145" fill="white" fontSize="8" fontWeight="600">Granite</text>
    <text x="8" y="183" fill="white" fontSize="8" fontWeight="bold">💧 Source profonde</text>
    
    {/* Time indicator */}
    <text x="260" y="100" fill="hsl(200, 50%, 65%)" fontSize="8" textAnchor="end" fontWeight="600">
      Filtration : 50+ ans
    </text>
    <line x1="270" y1="30" x2="270" y2="160" stroke="hsl(200, 50%, 55%)" strokeWidth="1" strokeDasharray="3 3" />
  </svg>
);

/* ── 2. Quality Dashboard with parameters ── */
export const QualityDashboardAnimation = () => (
  <svg viewBox="0 0 280 200" className="w-full max-w-xs mx-auto" aria-label="Tableau de bord contrôle qualité">
    {/* Dashboard frame */}
    <rect x="10" y="10" width="260" height="180" rx="10" fill="hsl(220, 15%, 15%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1.5" />
    
    {/* Title */}
    <text x="140" y="32" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">Paramètres contrôlés</text>
    
    {/* Parameter bars */}
    {[
      { label: 'pH', value: 75, color: 'hsl(142, 60%, 45%)', target: '6.5-8.5' },
      { label: 'Calcium', value: 90, color: 'hsl(200, 70%, 55%)', target: '468 mg/L' },
      { label: 'Magnésium', value: 60, color: 'hsl(270, 50%, 55%)', target: '74 mg/L' },
      { label: 'Sulfates', value: 45, color: 'hsl(45, 80%, 50%)', target: '1187 mg/L' },
      { label: 'Fluorures', value: 30, color: 'hsl(180, 60%, 50%)', target: '0.5 mg/L' },
    ].map((param, i) => (
      <g key={i}>
        <text x="25" y={57 + i * 28} fill="hsl(0, 0%, 65%)" fontSize="8">{param.label}</text>
        <rect x="90" y={48 + i * 28} width="130" height="10" rx="3" fill="hsl(220, 10%, 20%)" />
        <rect x="90" y={48 + i * 28} width="0" height="10" rx="3" fill={param.color}>
          <animate attributeName="width" values={`0;${param.value * 1.3}`} dur="2s" fill="freeze" begin={`${i * 0.3}s`} />
        </rect>
        <text x="230" y={57 + i * 28} fill="hsl(0, 0%, 55%)" fontSize="7">{param.target}</text>
      </g>
    ))}
    
    {/* Status indicator */}
    <circle cx="30" y="175" r="6" fill="hsl(142, 70%, 50%)">
      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <text x="45" y="178" fill="hsl(142, 60%, 60%)" fontSize="9" fontWeight="600">CONFORME</text>
  </svg>
);

/* ── 3. Bottling Speed Meter ── */
export const BottlingSpeedAnimation = () => (
  <svg viewBox="0 0 200 200" className="w-40 mx-auto" aria-label="Cadencemètre embouteillage">
    {/* Gauge body */}
    <circle cx="100" cy="100" r="85" fill="hsl(220, 15%, 20%)" stroke="hsl(220, 15%, 40%)" strokeWidth="3" />
    <circle cx="100" cy="100" r="75" fill="hsl(220, 15%, 12%)" />
    
    {/* Scale arc */}
    <path d="M35,130 A70,70 0 0,1 165,130" fill="none" stroke="hsl(220, 10%, 25%)" strokeWidth="8" strokeLinecap="round" />
    <path d="M35,130 A70,70 0 0,1 100,30" fill="none" stroke="hsl(190, 60%, 45%)" strokeWidth="8" strokeLinecap="round" />
    <path d="M100,30 A70,70 0 0,1 165,130" fill="none" stroke="hsl(190, 80%, 55%)" strokeWidth="8" strokeLinecap="round" />
    
    {/* Scale numbers */}
    {[0, 10, 20, 30, 40].map((val, i) => {
      const angle = -150 + i * 60;
      const rad = (angle * Math.PI) / 180;
      const tx = 100 + Math.cos(rad) * 54;
      const ty = 100 + Math.sin(rad) * 54;
      return (
        <text key={i} x={tx} y={ty + 3} fill="hsl(0, 0%, 55%)" fontSize="9" textAnchor="middle">{val}k</text>
      );
    })}
    
    {/* Needle */}
    <g style={{ transformOrigin: '100px 100px', animation: 'v2-needle-swing 3s ease-in-out infinite' }}>
      <line x1="100" y1="100" x2="55" y2="75" stroke="hsl(190, 80%, 55%)" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    <circle cx="100" cy="100" r="6" fill="hsl(220, 15%, 40%)" />
    <circle cx="100" cy="100" r="3" fill="hsl(0, 0%, 80%)" />
    
    {/* Digital readout */}
    <rect x="65" y="130" width="70" height="22" rx="4" fill="hsl(220, 15%, 10%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1" />
    <text x="100" y="146" fill="hsl(190, 70%, 55%)" fontSize="12" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
      40 000
    </text>
    <text x="100" y="168" fill="hsl(0, 0%, 50%)" fontSize="8" textAnchor="middle">bouteilles/heure</text>
  </svg>
);

/* ── 4. Carbon Footprint Scale ── */
export const CarbonFootprintAnimation = () => (
  <svg viewBox="0 0 260 200" className="w-full max-w-xs mx-auto" aria-label="Balance empreinte carbone">
    {/* Scale base */}
    <rect x="110" y="150" width="40" height="40" rx="3" fill="hsl(220, 15%, 40%)" />
    <polygon points="80,150 180,150 130,60" fill="none" stroke="hsl(220, 15%, 50%)" strokeWidth="2" />
    
    {/* Balance beam */}
    <g style={{ transformOrigin: '130px 60px' }}>
      <animate attributeName="transform" values="rotate(-8,130,60);rotate(8,130,60);rotate(-8,130,60)" dur="4s" repeatCount="indefinite" />
      <line x1="40" y1="80" x2="220" y2="80" stroke="hsl(220, 15%, 55%)" strokeWidth="3" />
      
      {/* Left pan - Tap water (light) */}
      <g>
        <rect x="20" y="85" width="60" height="5" rx="2" fill="hsl(220, 15%, 50%)" />
        <text x="50" y="105" fill="hsl(142, 60%, 55%)" fontSize="9" textAnchor="middle" fontWeight="bold">🚰 Robinet</text>
        <text x="50" y="118" fill="hsl(142, 50%, 60%)" fontSize="8" textAnchor="middle">0,001 kg CO₂</text>
      </g>
      
      {/* Right pan - Bottled water (heavy) */}
      <g>
        <rect x="180" y="85" width="60" height="5" rx="2" fill="hsl(220, 15%, 50%)" />
        <text x="210" y="105" fill="hsl(0, 60%, 55%)" fontSize="9" textAnchor="middle" fontWeight="bold">🧴 Bouteille</text>
        <text x="210" y="118" fill="hsl(0, 50%, 60%)" fontSize="8" textAnchor="middle">0,3 kg CO₂</text>
      </g>
    </g>
    
    {/* Fulcrum */}
    <circle cx="130" cy="60" r="5" fill="hsl(220, 15%, 55%)" />
    
    {/* Multiplier */}
    <text x="130" y="40" fill="hsl(45, 80%, 55%)" fontSize="12" textAnchor="middle" fontWeight="bold" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
      ×300
    </text>
    
    <text x="130" y="195" fill="hsl(0, 0%, 55%)" fontSize="8" textAnchor="middle">Empreinte carbone par litre consommé</text>
  </svg>
);

/* ── 5. France Routes Map ── */
export const FranceRoutesAnimation = () => (
  <svg viewBox="0 0 260 220" className="w-full max-w-xs mx-auto" aria-label="Carte trajets eau en bouteille">
    {/* Simplified France outline */}
    <path d="M100,20 L160,15 L190,40 L200,90 L180,130 L200,170 L160,200 L120,195 L80,180 L50,150 L40,110 L50,70 L70,40 Z" fill="hsl(220, 15%, 20%)" stroke="hsl(220, 15%, 40%)" strokeWidth="1.5" />
    
    {/* Source points (mountains) */}
    {[
      { x: 170, y: 120, label: 'Évian' },
      { x: 140, y: 160, label: 'Volvic' },
      { x: 80, y: 100, label: 'Vittel' },
    ].map((src, i) => (
      <g key={i}>
        <circle cx={src.x} cy={src.y} r="5" fill="hsl(200, 70%, 55%)">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
        </circle>
        <text x={src.x + 8} y={src.y + 3} fill="hsl(200, 60%, 70%)" fontSize="7">{src.label}</text>
      </g>
    ))}
    
    {/* Transport routes (animated dashes) */}
    {[
      { path: 'M170,120 Q150,60 120,50', dest: 'Paris' },
      { path: 'M140,160 Q110,100 90,70', dest: 'Lille' },
      { path: 'M80,100 Q120,120 160,170', dest: 'Marseille' },
    ].map((route, i) => (
      <g key={i}>
        <path d={route.path} fill="none" stroke="hsl(0, 60%, 50%)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.5">
          <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.5s" repeatCount="indefinite" />
        </path>
        {/* Destination */}
        <circle cx={route.path.split(' ').pop()!.split(',')[0] as unknown as number} cy={parseInt(route.path.split(',').pop()!)} r="3" fill="hsl(45, 80%, 55%)" />
      </g>
    ))}
    
    {/* Legend */}
    <circle cx="220" cy="30" r="4" fill="hsl(200, 70%, 55%)" />
    <text x="228" y="33" fill="hsl(0, 0%, 55%)" fontSize="7">Source</text>
    <circle cx="220" cy="45" r="3" fill="hsl(45, 80%, 55%)" />
    <text x="228" y="48" fill="hsl(0, 0%, 55%)" fontSize="7">Destination</text>
    
    <text x="130" y="215" fill="hsl(0, 0%, 50%)" fontSize="8" textAnchor="middle">Trajets moyens : 300 km</text>
  </svg>
);

/* ── 6. Price Comparison by Brand ── */
export const PriceComparisonAnimation = () => (
  <svg viewBox="0 0 260 200" className="w-full max-w-xs mx-auto" aria-label="Comparatif prix au litre par marque">
    <rect x="10" y="10" width="240" height="180" rx="10" fill="hsl(220, 15%, 15%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1.5" />
    
    <text x="130" y="32" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">Prix au litre (€/L)</text>
    
    {/* Brand bars */}
    {[
      { label: 'MDD', price: 0.15, width: 15, color: 'hsl(142, 60%, 45%)' },
      { label: 'Cristaline', price: 0.18, width: 18, color: 'hsl(142, 50%, 50%)' },
      { label: 'Évian', price: 0.45, width: 45, color: 'hsl(200, 70%, 55%)' },
      { label: 'Volvic', price: 0.42, width: 42, color: 'hsl(200, 60%, 50%)' },
      { label: 'Vittel', price: 0.40, width: 40, color: 'hsl(200, 50%, 48%)' },
      { label: 'Hépar', price: 0.65, width: 65, color: 'hsl(45, 80%, 50%)' },
      { label: 'San Pellegrino', price: 1.20, width: 120, color: 'hsl(0, 60%, 50%)' },
    ].map((brand, i) => (
      <g key={i}>
        <text x="25" y={52 + i * 21} fill="hsl(0, 0%, 60%)" fontSize="7">{brand.label}</text>
        <rect x="100" y={44 + i * 21} width="0" height="12" rx="2" fill={brand.color}>
          <animate attributeName="width" values={`0;${brand.width * 1.2}`} dur="1.5s" fill="freeze" begin={`${i * 0.15}s`} />
        </rect>
        <text x={105 + brand.width * 1.2} y={53 + i * 21} fill="hsl(0, 0%, 55%)" fontSize="7" opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" begin={`${0.5 + i * 0.15}s`} />
          {brand.price.toFixed(2)} €
        </text>
      </g>
    ))}
  </svg>
);
