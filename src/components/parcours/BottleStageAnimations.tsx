import React from 'react';

/* ── 1. Captage: Spring source emerging from rocks ── */
export const SourceCaptageAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation captage source minérale">
    {/* Mountain background */}
    <polygon points="0,130 80,30 160,130" fill="hsl(220, 15%, 35%)" />
    <polygon points="100,130 200,20 300,130" fill="hsl(220, 15%, 40%)" />
    {/* Snow caps */}
    <polygon points="65,50 80,30 95,50" fill="hsl(210, 30%, 85%)" />
    <polygon points="185,40 200,20 215,40" fill="hsl(210, 30%, 85%)" />
    
    {/* Rock layers underground */}
    <rect x="0" y="130" width="300" height="20" fill="hsl(142, 35%, 35%)" />
    <rect x="0" y="150" width="300" height="25" fill="hsl(30, 30%, 40%)" />
    <rect x="0" y="175" width="300" height="25" fill="hsl(220, 15%, 30%)" />
    <rect x="0" y="200" width="300" height="20" fill="hsl(220, 15%, 25%)" />
    
    {/* Underground water flow */}
    <path d="M50,185 Q100,180 150,185 Q200,190 250,185" fill="none" stroke="hsl(200, 70%, 55%)" strokeWidth="3" opacity="0.5">
      <animate attributeName="d" values="M50,185 Q100,180 150,185 Q200,190 250,185;M50,185 Q100,190 150,185 Q200,180 250,185;M50,185 Q100,180 150,185 Q200,190 250,185" dur="3s" repeatCount="indefinite" />
    </path>
    
    {/* Spring emergence */}
    <circle cx="140" cy="130" r="8" fill="hsl(200, 60%, 50%)" opacity="0.6">
      <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
    </circle>
    
    {/* Water flowing from spring */}
    {[0, 1, 2, 3, 4].map(i => (
      <circle key={i} cy={128} r="3" fill="hsl(200, 80%, 65%)" opacity="0">
        <animate attributeName="cx" values={`${140};${140 + 60}`} dur="1.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
        <animate attributeName="cy" values="128;135;140" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
        <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
      </circle>
    ))}
    
    {/* Protective perimeter */}
    <rect x="110" y="115" width="80" height="20" rx="3" fill="none" stroke="hsl(45, 80%, 55%)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
    
    <text x="150" y="112" fill="hsl(45, 80%, 65%)" fontSize="8" textAnchor="middle">Périmètre protégé</text>
    <text x="50" y="190" fill="hsl(200, 60%, 65%)" fontSize="8">💧 Nappe profonde</text>
  </svg>
);

/* ── 2. Analyse: Microscope & test tubes ── */
export const AnalyseAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation analyse qualité eau">
    {/* Lab bench */}
    <rect x="20" y="170" width="260" height="12" rx="3" fill="hsl(220, 15%, 50%)" />
    <rect x="40" y="182" width="8" height="30" fill="hsl(220, 15%, 40%)" />
    <rect x="252" y="182" width="8" height="30" fill="hsl(220, 15%, 40%)" />
    
    {/* Microscope body */}
    <rect x="60" y="100" width="20" height="70" rx="3" fill="hsl(220, 15%, 45%)" />
    <rect x="50" y="90" width="40" height="15" rx="5" fill="hsl(220, 15%, 50%)" />
    <rect x="65" y="60" width="10" height="35" rx="2" fill="hsl(220, 15%, 55%)" />
    <circle cx="70" cy="55" r="12" fill="none" stroke="hsl(220, 15%, 60%)" strokeWidth="3" />
    {/* Microscope lens glow */}
    <circle cx="70" cy="55" r="8" fill="hsl(270, 50%, 55%)" opacity="0">
      <animate attributeName="opacity" values="0;0.4;0" dur="2s" repeatCount="indefinite" />
    </circle>
    
    {/* Test tubes rack */}
    <rect x="150" y="120" width="100" height="5" rx="2" fill="hsl(220, 15%, 50%)" />
    {[165, 185, 205, 225].map((x, i) => (
      <g key={i}>
        <rect x={x - 5} y={125} width="10" height="42" rx="5" fill="none" stroke="hsl(200, 20%, 55%)" strokeWidth="1.5" />
        <rect x={x - 3} y={135} width="6" height="30" rx="3" opacity="0.7">
          <animate
            attributeName="fill"
            values={`hsl(${200 + i * 20}, 60%, 50%);hsl(${180 + i * 20}, 70%, 55%);hsl(${200 + i * 20}, 60%, 50%)`}
            dur={`${3 + i * 0.5}s`}
            repeatCount="indefinite"
          />
        </rect>
        {/* Bubbles */}
        <circle cx={x} cy={155} r="1.5" fill="white" opacity="0">
          <animate attributeName="cy" values="155;130" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
          <animate attributeName="opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
        </circle>
      </g>
    ))}
    
    {/* Check marks appearing */}
    {[0, 1, 2].map(i => (
      <g key={`check-${i}`} opacity="0">
        <animate attributeName="opacity" values="0;1;1" dur="3s" repeatCount="indefinite" begin={`${1 + i * 0.8}s`} />
        <circle cx={120 + i * 40} cy={40} r="10" fill="hsl(142, 60%, 45%)" />
        <text x={120 + i * 40} y={44} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">✓</text>
      </g>
    ))}
    
    <text x="150" y="25" fill="hsl(270, 40%, 70%)" fontSize="10" textAnchor="middle" fontWeight="600">Contrôle qualité ARS</text>
  </svg>
);

/* ── 3. Embouteillage: Bottling line with conveyor ── */
export const EmbouteillageAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation ligne d'embouteillage">
    {/* Conveyor belt */}
    <rect x="10" y="150" width="280" height="12" rx="3" fill="hsl(220, 15%, 40%)" />
    <rect x="10" y="162" width="280" height="4" fill="hsl(220, 15%, 35%)" />
    {/* Conveyor rollers */}
    {[30, 80, 130, 180, 230, 270].map((x, i) => (
      <circle key={i} cx={x} cy={166} r="4" fill="hsl(220, 15%, 50%)" stroke="hsl(220, 15%, 60%)" strokeWidth="1">
        <animateTransform attributeName="transform" type="rotate" values={`0 ${x} 166;360 ${x} 166`} dur="1s" repeatCount="indefinite" />
      </circle>
    ))}
    
    {/* Water filling station */}
    <rect x="100" y="40" width="40" height="80" rx="4" fill="hsl(220, 15%, 45%)" />
    <rect x="115" y="30" width="10" height="15" fill="hsl(200, 50%, 50%)" />
    {/* Water stream from filler */}
    <rect x="117" y="120" width="6" height="30" rx="2" fill="hsl(200, 70%, 60%)" opacity="0.6">
      <animate attributeName="height" values="0;30;0" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;0.7;0" dur="2s" repeatCount="indefinite" />
    </rect>
    
    {/* Bottles on conveyor - moving right */}
    {[0, 1, 2, 3, 4].map(i => (
      <g key={i} opacity="0">
        <animateTransform attributeName="transform" type="translate" values={`${-50 + i * 60},0;${200 + i * 60},0`} dur="5s" repeatCount="indefinite" begin={`${i * 1}s`} />
        <animate attributeName="opacity" values="0;1;1;0" dur="5s" repeatCount="indefinite" begin={`${i * 1}s`} />
        {/* Bottle shape */}
        <rect x="0" y="115" width="16" height="35" rx="3" fill="none" stroke="hsl(200, 20%, 70%)" strokeWidth="1.5" />
        <rect x="5" y="108" width="6" height="10" rx="2" fill="hsl(200, 20%, 65%)" />
        {/* Water inside bottle */}
        <rect x="2" y="125" width="12" height="23" rx="2" fill="hsl(200, 70%, 55%)" opacity="0.5">
          <animate attributeName="height" values="0;23" dur="1s" fill="freeze" begin={`${i * 1 + 1}s`} />
        </rect>
      </g>
    ))}
    
    {/* Machine label */}
    <text x="120" y="85" fill="white" fontSize="8" textAnchor="middle" fontWeight="600">Remplisseuse</text>
    <text x="150" y="210" fill="hsl(190, 50%, 60%)" fontSize="9" textAnchor="middle" fontWeight="600">Cadence : 40 000 bouteilles/h</text>
  </svg>
);

/* ── 4. Étiquetage: Label with mineral composition ── */
export const EtiquetageAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation étiquetage bouteille">
    {/* Large bottle */}
    <rect x="100" y="30" width="60" height="150" rx="8" fill="none" stroke="hsl(200, 20%, 65%)" strokeWidth="2" />
    <rect x="115" y="15" width="30" height="20" rx="5" fill="hsl(200, 20%, 60%)" />
    {/* Water */}
    <rect x="104" y="50" width="52" height="126" rx="6" fill="hsl(200, 70%, 55%)" opacity="0.3" />
    
    {/* Label sliding on */}
    <g>
      <rect x="90" y="80" width="80" height="60" rx="4" fill="hsl(210, 30%, 95%)" stroke="hsl(200, 40%, 70%)" strokeWidth="1" opacity="0">
        <animate attributeName="opacity" values="0;1;1" dur="2s" fill="freeze" />
      </rect>
      {/* Label content appearing */}
      <text x="130" y="97" fill="hsl(200, 60%, 35%)" fontSize="7" textAnchor="middle" fontWeight="bold" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1" dur="3s" repeatCount="indefinite" />
        EAU MINÉRALE NATURELLE
      </text>
      {/* Mineral lines */}
      {['Ca: 468 mg/L', 'Mg: 74 mg/L', 'Na: 9 mg/L', 'HCO₃: 1172 mg/L'].map((text, i) => (
        <text key={i} x={100} y={108 + i * 8} fill="hsl(220, 15%, 40%)" fontSize="6" opacity="0">
          <animate attributeName="opacity" values="0;0;1;1" dur="3s" repeatCount="indefinite" begin={`${0.5 + i * 0.3}s`} />
          {text}
        </text>
      ))}
    </g>
    
    {/* Barcode */}
    <g opacity="0">
      <animate attributeName="opacity" values="0;0;1;1" dur="3s" repeatCount="indefinite" begin="1.5s" />
      {[0,2,4,5,7,8,10,12,13,15].map((x, i) => (
        <rect key={i} x={108 + x * 2.5} y={148} width={i % 2 === 0 ? 2 : 1.5} height="15" fill="hsl(220, 15%, 25%)" />
      ))}
    </g>
    
    {/* Pack visualization on right */}
    <g opacity="0.6">
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={210 + (i % 3) * 18} y={80 + Math.floor(i / 3) * 50} width="14" height="40" rx="3" fill="none" stroke="hsl(200, 30%, 60%)" strokeWidth="1" />
      ))}
      <text x="237" y="185" fill="hsl(200, 40%, 60%)" fontSize="8" textAnchor="middle">Pack x6</text>
    </g>
  </svg>
);

/* ── 5. Transport: Truck with route ── */
export const TransportAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation transport eau en bouteille">
    {/* Road */}
    <rect x="0" y="150" width="300" height="30" fill="hsl(220, 15%, 30%)" />
    <line x1="0" y1="165" x2="300" y2="165" stroke="hsl(45, 80%, 60%)" strokeWidth="2" strokeDasharray="15 10">
      <animate attributeName="stroke-dashoffset" values="0;-50" dur="1s" repeatCount="indefinite" />
    </line>
    
    {/* Truck body */}
    <g>
      <animateTransform attributeName="transform" type="translate" values="-100,0;350,0" dur="6s" repeatCount="indefinite" />
      {/* Trailer */}
      <rect x="30" y="100" width="100" height="50" rx="3" fill="hsl(200, 50%, 45%)" />
      <text x="80" y="130" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">EAU</text>
      {/* Cab */}
      <rect x="130" y="110" width="40" height="40" rx="3" fill="hsl(200, 40%, 35%)" />
      <rect x="140" y="115" width="25" height="15" rx="2" fill="hsl(200, 30%, 70%)" opacity="0.6" />
      {/* Wheels */}
      <circle cx="60" cy="155" r="10" fill="hsl(220, 15%, 25%)" stroke="hsl(220, 15%, 50%)" strokeWidth="3">
        <animateTransform attributeName="transform" type="rotate" values="0 60 155;360 60 155" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="110" cy="155" r="10" fill="hsl(220, 15%, 25%)" stroke="hsl(220, 15%, 50%)" strokeWidth="3">
        <animateTransform attributeName="transform" type="rotate" values="0 110 155;360 110 155" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="155" cy="155" r="10" fill="hsl(220, 15%, 25%)" stroke="hsl(220, 15%, 50%)" strokeWidth="3">
        <animateTransform attributeName="transform" type="rotate" values="0 155 155;360 155 155" dur="0.5s" repeatCount="indefinite" />
      </circle>
      {/* Exhaust */}
      {[0, 1, 2].map(i => (
        <circle key={i} cx="25" cy={145} r="3" fill="hsl(220, 10%, 60%)" opacity="0">
          <animate attributeName="cx" values="25;-10" dur="1s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
          <animate attributeName="cy" values="145;135" dur="1s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
          <animate attributeName="opacity" values="0;0.4;0" dur="1s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
          <animate attributeName="r" values="3;6" dur="1s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
        </circle>
      ))}
    </g>
    
    {/* CO2 indicator */}
    <text x="150" y="40" fill="hsl(0, 60%, 60%)" fontSize="10" textAnchor="middle" fontWeight="bold">
      CO₂ : 0,3 kg/bouteille
    </text>
    <text x="150" y="60" fill="hsl(210, 20%, 55%)" fontSize="8" textAnchor="middle">300 km en moyenne source → magasin</text>
    
    {/* Distance markers */}
    {[50, 150, 250].map((x, i) => (
      <g key={i}>
        <line x1={x} y1="180" x2={x} y2="190" stroke="hsl(220, 15%, 50%)" strokeWidth="1" />
        <text x={x} y="200" fill="hsl(220, 15%, 55%)" fontSize="7" textAnchor="middle">{i * 150} km</text>
      </g>
    ))}
  </svg>
);

/* ── 6. Achat & Consommation: Supermarket shelf ── */
export const AchatAnimation = () => (
  <svg viewBox="0 0 300 220" className="w-full max-w-sm mx-auto" aria-label="Animation achat eau en supermarché">
    {/* Shelf structure */}
    <rect x="30" y="60" width="240" height="6" rx="2" fill="hsl(220, 15%, 50%)" />
    <rect x="30" y="120" width="240" height="6" rx="2" fill="hsl(220, 15%, 50%)" />
    <rect x="30" y="180" width="240" height="6" rx="2" fill="hsl(220, 15%, 50%)" />
    {/* Shelf supports */}
    <rect x="30" y="60" width="4" height="126" fill="hsl(220, 15%, 45%)" />
    <rect x="266" y="60" width="4" height="126" fill="hsl(220, 15%, 45%)" />
    
    {/* Top shelf bottles - premium */}
    {[50, 80, 110, 140, 170, 200, 230].map((x, i) => (
      <g key={`top-${i}`}>
        <rect x={x} y={20} width="12" height="38" rx="3" fill="none" stroke="hsl(200, 30%, 65%)" strokeWidth="1" />
        <rect x={x + 2} y={30} width="8" height="26" rx="2" fill={`hsl(${190 + i * 10}, 60%, ${50 + i * 3}%)`} opacity="0.5" />
        <rect x={x + 3} y={15} width="6" height="8" rx="2" fill="hsl(200, 20%, 60%)" />
      </g>
    ))}
    
    {/* Middle shelf - standard */}
    {[50, 80, 110, 140, 170, 200, 230].map((x, i) => (
      <g key={`mid-${i}`}>
        <rect x={x} y={75} width="14" height="42" rx="3" fill="none" stroke="hsl(200, 20%, 60%)" strokeWidth="1" />
        <rect x={x + 2} y={88} width="10" height="27" rx="2" fill={`hsl(${200 + i * 8}, 50%, 50%)`} opacity="0.4" />
      </g>
    ))}
    
    {/* Bottom shelf - big formats */}
    {[50, 90, 130, 170, 210].map((x, i) => (
      <g key={`bot-${i}`}>
        <rect x={x} y={130} width="20" height="48" rx="4" fill="none" stroke="hsl(200, 20%, 55%)" strokeWidth="1.5" />
        <rect x={x + 3} y={145} width="14" height="31" rx="3" fill={`hsl(${180 + i * 15}, 55%, 48%)`} opacity="0.4" />
      </g>
    ))}
    
    {/* Shopping hand grabbing a bottle */}
    <g opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0" dur="4s" repeatCount="indefinite" />
      <animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,-10;20,-10;20,-40" dur="4s" repeatCount="indefinite" />
      <rect x="135" y="80" width="18" height="10" rx="4" fill="hsl(30, 40%, 65%)" />
    </g>
    
    {/* Price tags */}
    <text x="75" y="210" fill="hsl(142, 60%, 55%)" fontSize="8" textAnchor="middle" fontWeight="bold">0,20 €/L</text>
    <text x="150" y="210" fill="hsl(45, 80%, 55%)" fontSize="8" textAnchor="middle" fontWeight="bold">0,50 €/L</text>
    <text x="225" y="210" fill="hsl(0, 60%, 55%)" fontSize="8" textAnchor="middle" fontWeight="bold">1,50 €/L</text>
    
    {/* Recycling symbol */}
    <text x="265" y="210" fontSize="14">♻️</text>
  </svg>
);
