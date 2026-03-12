import React from 'react';

/* ── 1. Captage: Water Cycle (evaporation → cloud → rain → infiltration) ── */
export const WaterCycleAnimation = () => (
  <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto" aria-label="Animation cycle de l'eau">
    {/* Sun */}
    <circle cx="250" cy="30" r="20" fill="hsl(45, 90%, 55%)">
      <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite" />
    </circle>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <line
        key={i}
        x1={250 + Math.cos((angle * Math.PI) / 180) * 24}
        y1={30 + Math.sin((angle * Math.PI) / 180) * 24}
        x2={250 + Math.cos((angle * Math.PI) / 180) * 32}
        y2={30 + Math.sin((angle * Math.PI) / 180) * 32}
        stroke="hsl(45, 90%, 55%)"
        strokeWidth="2"
        opacity="0.7"
      >
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin={`${i * 0.15}s`} />
      </line>
    ))}

    {/* Water surface */}
    <rect x="0" y="160" width="300" height="40" fill="hsl(200, 60%, 45%)" opacity="0.5" />
    <path d="M0,160 Q30,155 60,160 Q90,165 120,160 Q150,155 180,160 Q210,165 240,160 Q270,155 300,160" fill="none" stroke="hsl(200, 70%, 60%)" strokeWidth="2">
      <animate attributeName="d" values="M0,160 Q30,155 60,160 Q90,165 120,160 Q150,155 180,160 Q210,165 240,160 Q270,155 300,160;M0,160 Q30,165 60,160 Q90,155 120,160 Q150,165 180,160 Q210,155 240,160 Q270,165 300,160;M0,160 Q30,155 60,160 Q90,165 120,160 Q150,155 180,160 Q210,165 240,160 Q270,155 300,160" dur="3s" repeatCount="indefinite" />
    </path>

    {/* Evaporation arrows */}
    {[60, 120, 180].map((x, i) => (
      <g key={`evap-${i}`}>
        <line x1={x} y1={155} x2={x} y2={90} stroke="hsl(200, 50%, 70%)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0">
          <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
        </line>
        <polygon points={`${x - 3},93 ${x + 3},93 ${x},86`} fill="hsl(200, 50%, 70%)" opacity="0">
          <animate attributeName="opacity" values="0;0.8;0" dur="3s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
        </polygon>
      </g>
    ))}

    {/* Cloud forming */}
    <g>
      <ellipse cx="100" cy="55" rx="45" ry="18" fill="hsl(210, 20%, 75%)" opacity="0.7">
        <animate attributeName="rx" values="42;48;42" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="130" cy="48" rx="30" ry="14" fill="hsl(210, 25%, 80%)" opacity="0.6">
        <animate attributeName="rx" values="28;33;28" dur="4.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="75" cy="50" rx="25" ry="12" fill="hsl(210, 22%, 78%)" opacity="0.5" />
    </g>

    {/* Rain drops from cloud */}
    {[80, 100, 115, 130].map((x, i) => (
      <ellipse
        key={`rain-${i}`}
        cx={x}
        cy={70}
        rx="1.5"
        ry="3"
        fill="hsl(200, 80%, 65%)"
        style={{
          animation: `v2-rain-drop 1.8s ease-in infinite`,
          animationDelay: `${i * 0.35}s`,
        }}
      />
    ))}

    {/* Ground */}
    <rect x="0" y="155" width="300" height="5" fill="hsl(142, 35%, 40%)" />

    {/* Infiltration arrow */}
    <g style={{ animation: 'v2-rain-drop 3s ease-in infinite', animationDelay: '1s' }}>
      <line x1="100" y1="162" x2="100" y2="195" stroke="hsl(200, 60%, 55%)" strokeWidth="1.5" strokeDasharray="3 2" />
      <polygon points="97,193 103,193 100,199" fill="hsl(200, 60%, 55%)" />
    </g>

    {/* Labels */}
    <text x="230" y="95" fill="hsl(200, 50%, 70%)" fontSize="8" fontWeight="600">Évaporation ↑</text>
    <text x="60" y="80" fill="hsl(200, 70%, 70%)" fontSize="8" fontWeight="600">Pluie ↓</text>
    <text x="110" y="195" fill="hsl(200, 60%, 65%)" fontSize="8">Infiltration</text>
  </svg>
);

/* ── 2. Pompage: Energy Meter with oscillating needle ── */
export const EnergyMeterAnimation = () => (
  <svg viewBox="0 0 280 220" className="w-full max-w-xs mx-auto" aria-label="Compteur d'énergie animé">
    {/* Meter body */}
    <rect x="40" y="10" width="200" height="160" rx="14" fill="hsl(220, 15%, 22%)" stroke="hsl(220, 15%, 38%)" strokeWidth="2" />
    <rect x="55" y="25" width="170" height="110" rx="10" fill="hsl(220, 15%, 12%)" />

    {/* Gauge arc background */}
    <path d="M85,120 A55,55 0 0,1 195,120" fill="none" stroke="hsl(220, 10%, 25%)" strokeWidth="10" strokeLinecap="round" />
    {/* Green zone */}
    <path d="M85,120 A55,55 0 0,1 112,72" fill="none" stroke="hsl(142, 60%, 45%)" strokeWidth="10" strokeLinecap="round" />
    {/* Yellow zone */}
    <path d="M112,72 A55,55 0 0,1 168,72" fill="none" stroke="hsl(45, 80%, 50%)" strokeWidth="10" strokeLinecap="round" />
    {/* Red zone */}
    <path d="M168,72 A55,55 0 0,1 195,120" fill="none" stroke="hsl(0, 70%, 50%)" strokeWidth="10" strokeLinecap="round" />

    {/* Scale tick marks */}
    {[0, 1, 2, 3, 4, 5, 6].map(i => {
      const angle = -150 + i * 42.8;
      const rad = (angle * Math.PI) / 180;
      const cx = 140, cy = 120;
      const x1 = cx + Math.cos(rad) * 63;
      const y1 = cy + Math.sin(rad) * 63;
      const x2 = cx + Math.cos(rad) * 72;
      const y2 = cy + Math.sin(rad) * 72;
      const tx = cx + Math.cos(rad) * 52;
      const ty = cy + Math.sin(rad) * 52;
      return (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(0, 0%, 55%)" strokeWidth="2" />
          <text x={tx} y={ty + 3} fill="hsl(0, 0%, 55%)" fontSize="9" textAnchor="middle" fontWeight="600">{i}</text>
        </g>
      );
    })}

    {/* Needle */}
    <g style={{ transformOrigin: '140px 120px', animation: 'v2-needle-swing 3.5s ease-in-out infinite' }}>
      <line x1="140" y1="120" x2="95" y2="85" stroke="hsl(0, 80%, 55%)" strokeWidth="3" strokeLinecap="round" />
      {/* Needle glow */}
      <line x1="140" y1="120" x2="95" y2="85" stroke="hsl(0, 80%, 55%)" strokeWidth="5" strokeLinecap="round" opacity="0.3">
        <animate attributeName="opacity" values="0.15;0.4;0.15" dur="1.5s" repeatCount="indefinite" />
      </line>
    </g>
    <circle cx="140" cy="120" r="6" fill="hsl(220, 15%, 40%)" />
    <circle cx="140" cy="120" r="3" fill="hsl(0, 0%, 80%)" />

    {/* Zone labels */}
    <text x="80" y="135" fill="hsl(142, 50%, 55%)" fontSize="8" fontWeight="bold">ECO</text>
    <text x="183" y="135" fill="hsl(0, 60%, 55%)" fontSize="8" fontWeight="bold">MAX</text>

    {/* Digital readout panel */}
    <rect x="100" y="140" width="80" height="24" rx="5" fill="hsl(220, 20%, 8%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1" />
    <text x="140" y="157" fill="hsl(142, 70%, 55%)" fontSize="13" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
      2.7 kW
    </text>
    {/* Blinking dot */}
    <circle cx="173" cy="148" r="2.5" fill="hsl(142, 70%, 50%)">
      <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
    </circle>

    {/* Energy consumption bars */}
    <g>
      <text x="60" y="188" fill="hsl(0, 0%, 50%)" fontSize="7">Consommation</text>
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <rect
          key={i}
          x={60 + i * 24}
          y={195}
          width="16"
          height="0"
          rx="2"
          fill={i < 3 ? 'hsl(142, 60%, 45%)' : i < 5 ? 'hsl(45, 80%, 50%)' : 'hsl(0, 70%, 50%)'}
        >
          <animate
            attributeName="height"
            values={`0;${6 + i * 3};${3 + i * 2};${6 + i * 3}`}
            dur="2.5s"
            repeatCount="indefinite"
            begin={`${i * 0.15}s`}
          />
          <animate
            attributeName="y"
            values={`195;${195 - (6 + i * 3)};${195 - (3 + i * 2)};${195 - (6 + i * 3)}`}
            dur="2.5s"
            repeatCount="indefinite"
            begin={`${i * 0.15}s`}
          />
        </rect>
      ))}
    </g>

    {/* Efficiency indicator */}
    <rect x="55" y="205" width="170" height="5" rx="2" fill="hsl(220, 10%, 20%)" />
    <rect x="55" y="205" width="0" height="5" rx="2" fill="hsl(142, 60%, 45%)">
      <animate attributeName="width" values="0;110;90;110" dur="3.5s" repeatCount="indefinite" />
    </rect>
    <text x="140" y="218" fill="hsl(0, 0%, 50%)" fontSize="7" textAnchor="middle">Rendement énergétique</text>
  </svg>
);

/* ── 3. Traitement: Lab Test Tubes with color shift ── */
export const LabTestAnimation = () => (
  <svg viewBox="0 0 280 200" className="w-full max-w-xs mx-auto" aria-label="Animation éprouvettes de laboratoire">
    {/* Rack */}
    <rect x="30" y="30" width="220" height="8" rx="3" fill="hsl(220, 15%, 50%)" />
    <rect x="50" y="38" width="4" height="130" fill="hsl(220, 15%, 45%)" />
    <rect x="226" y="38" width="4" height="130" fill="hsl(220, 15%, 45%)" />
    <rect x="30" y="165" width="220" height="6" rx="2" fill="hsl(220, 15%, 50%)" />

    {/* Test tubes */}
    {[
      { x: 75, delay: 0, from: 'hsl(30, 50%, 35%)', to: 'hsl(200, 70%, 55%)' },
      { x: 120, delay: 0.5, from: 'hsl(30, 45%, 40%)', to: 'hsl(200, 65%, 50%)' },
      { x: 165, delay: 1, from: 'hsl(25, 40%, 38%)', to: 'hsl(195, 75%, 52%)' },
      { x: 210, delay: 1.5, from: 'hsl(35, 35%, 42%)', to: 'hsl(205, 70%, 58%)' },
    ].map((tube, i) => (
      <g key={i}>
        {/* Tube outline */}
        <rect x={tube.x - 8} y={35} width="16" height="120" rx="8" fill="none" stroke="hsl(200, 20%, 60%)" strokeWidth="1.5" opacity="0.6" />
        {/* Liquid fill with color transition */}
        <rect x={tube.x - 6} y={70} width="12" height="82" rx="6" opacity="0.8">
          <animate
            attributeName="fill"
            values={`${tube.from};${tube.to};${tube.from}`}
            dur="4s"
            repeatCount="indefinite"
            begin={`${tube.delay}s`}
          />
          <animate attributeName="y" values="75;65;75" dur="3s" repeatCount="indefinite" begin={`${tube.delay}s`} />
          <animate attributeName="height" values="77;87;77" dur="3s" repeatCount="indefinite" begin={`${tube.delay}s`} />
        </rect>
        {/* Bubbles inside */}
        <circle cx={tube.x} cy={120} r="2" fill="white" opacity="0">
          <animate attributeName="cy" values="140;70" dur="2s" repeatCount="indefinite" begin={`${tube.delay + 0.3}s`} />
          <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" begin={`${tube.delay + 0.3}s`} />
        </circle>
      </g>
    ))}

    {/* Pipette */}
    <g style={{ animation: 'v2-color-shift 4s ease-in-out infinite' }}>
      <rect x="115" y="5" width="6" height="35" rx="2" fill="hsl(220, 15%, 55%)" />
      <rect x="113" y="3" width="10" height="8" rx="2" fill="hsl(220, 15%, 60%)" />
      {/* Drop from pipette */}
      <ellipse cx="118" cy="42" rx="2" ry="3" fill="hsl(270, 50%, 60%)" opacity="0">
        <animate attributeName="cy" values="42;65" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
      </ellipse>
    </g>

    {/* Labels */}
    <text x="75" y="185" fill="hsl(30, 50%, 60%)" fontSize="7" textAnchor="middle">Brute</text>
    <text x="210" y="185" fill="hsl(200, 70%, 65%)" fontSize="7" textAnchor="middle">Traitée</text>
    <text x="140" y="198" fill="hsl(270, 40%, 65%)" fontSize="8" textAnchor="middle" fontWeight="600">Analyse en cours…</text>
  </svg>
);

/* ── 4. Stockage: Pressure Gauge Animation ── */
export const PressureGaugeAnimation = () => (
  <svg viewBox="0 0 200 200" className="w-40 mx-auto" aria-label="Manomètre de pression">
    {/* Gauge body */}
    <circle cx="100" cy="100" r="85" fill="hsl(220, 15%, 20%)" stroke="hsl(220, 15%, 40%)" strokeWidth="3" />
    <circle cx="100" cy="100" r="75" fill="hsl(220, 15%, 12%)" />

    {/* Scale markings */}
    {[0, 1, 2, 3, 4, 5, 6].map(i => {
      const angle = -135 + i * 45;
      const rad = (angle * Math.PI) / 180;
      const x1 = 100 + Math.cos(rad) * 62;
      const y1 = 100 + Math.sin(rad) * 62;
      const x2 = 100 + Math.cos(rad) * 70;
      const y2 = 100 + Math.sin(rad) * 70;
      const tx = 100 + Math.cos(rad) * 54;
      const ty = 100 + Math.sin(rad) * 54;
      return (
        <g key={i}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(0, 0%, 60%)" strokeWidth="2" />
          <text x={tx} y={ty + 3} fill="hsl(0, 0%, 60%)" fontSize="8" textAnchor="middle">{i}</text>
        </g>
      );
    })}

    {/* Color arc: green 0-3, yellow 3-4, red 4-6 */}
    <path d="M38,138 A70,70 0 0,1 100,30" fill="none" stroke="hsl(142, 60%, 45%)" strokeWidth="4" opacity="0.6" />
    <path d="M100,30 A70,70 0 0,1 137,55" fill="none" stroke="hsl(45, 80%, 50%)" strokeWidth="4" opacity="0.6" />
    <path d="M137,55 A70,70 0 0,1 162,138" fill="none" stroke="hsl(0, 70%, 50%)" strokeWidth="4" opacity="0.6" />

    {/* Needle oscillating between 3 and 5 bar */}
    <g style={{ transformOrigin: '100px 100px', animation: 'v2-needle-swing 4s ease-in-out infinite' }}>
      <line x1="100" y1="100" x2="50" y2="75" stroke="hsl(0, 80%, 55%)" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    <circle cx="100" cy="100" r="6" fill="hsl(220, 15%, 40%)" />
    <circle cx="100" cy="100" r="3" fill="hsl(0, 0%, 70%)" />

    {/* Digital readout */}
    <rect x="70" y="130" width="60" height="22" rx="4" fill="hsl(220, 15%, 10%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1" />
    <text x="100" y="146" fill="hsl(142, 70%, 55%)" fontSize="12" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
      <animate attributeName="textContent" values="3.2;3.8;4.2;4.5;4.2;3.8;3.2" dur="4s" repeatCount="indefinite" />
      3.8
    </text>
    <text x="100" y="146" fill="hsl(142, 70%, 55%)" fontSize="12" textAnchor="middle" fontWeight="bold" fontFamily="monospace" opacity="0">
      <animate attributeName="opacity" values="1;1;1" dur="4s" repeatCount="indefinite" />
    </text>

    {/* Unit label */}
    <text x="100" y="170" fill="hsl(0, 0%, 55%)" fontSize="10" textAnchor="middle" fontWeight="600">bar</text>
  </svg>
);

/* ── 5. Distribution: Leak Detector Animation ── */
export const LeakDetectorAnimation = () => (
  <svg viewBox="0 0 300 180" className="w-full max-w-sm mx-auto" aria-label="Animation détection de fuite">
    {/* Underground background */}
    <rect x="0" y="30" width="300" height="150" fill="hsl(30, 25%, 25%)" rx="4" />
    <rect x="0" y="0" width="300" height="30" fill="hsl(142, 30%, 35%)" rx="4" />

    {/* Main pipe */}
    <rect x="10" y="70" width="280" height="20" rx="4" fill="hsl(220, 15%, 45%)" />
    <rect x="12" y="72" width="276" height="16" rx="3" fill="hsl(220, 15%, 35%)" />

    {/* Water flowing inside pipe */}
    {[0, 1, 2, 3, 4].map(i => (
      <circle key={`flow-${i}`} cy={80} r="3" fill="hsl(200, 70%, 60%)" opacity="0">
        <animate attributeName="cx" values="15;285" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
        <animate attributeName="opacity" values="0;0.8;0.8;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
      </circle>
    ))}

    {/* Leak point - crack */}
    <path d="M155,90 L160,92 L153,95 L162,98" stroke="hsl(220, 15%, 55%)" strokeWidth="1.5" fill="none" />

    {/* Leak drops */}
    {[0, 1, 2].map(i => (
      <ellipse
        key={`leak-${i}`}
        cx={157 + i * 3}
        cy={92}
        rx="2"
        ry="2.5"
        fill="hsl(200, 70%, 60%)"
        style={{
          animation: `v2-leak-drip 1.5s ease-in infinite`,
          animationDelay: `${i * 0.4}s`,
        }}
      />
    ))}

    {/* Puddle forming */}
    <ellipse cx="160" cy="150" rx="25" ry="5" fill="hsl(200, 60%, 50%)" opacity="0.4">
      <animate attributeName="rx" values="20;30;20" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* Sensor device above ground */}
    <rect x="140" y="5" width="40" height="20" rx="4" fill="hsl(220, 20%, 30%)" stroke="hsl(220, 20%, 50%)" strokeWidth="1.5" />
    <rect x="155" y="25" width="10" height="50" fill="hsl(220, 15%, 40%)" />

    {/* Sensor signal - blinks red then green */}
    <circle cx="160" cy="15" r="5" style={{ animation: 'v2-blink-alert 3s ease-in-out infinite' }}>
      <animate attributeName="fill" values="hsl(0, 80%, 55%);hsl(0, 80%, 55%);hsl(142, 70%, 50%);hsl(142, 70%, 50%)" dur="3s" repeatCount="indefinite" />
    </circle>

    {/* Signal waves from sensor */}
    {[0, 1, 2].map(i => (
      <circle
        key={`wave-${i}`}
        cx="160"
        cy="15"
        r={8 + i * 6}
        fill="none"
        stroke="hsl(200, 60%, 60%)"
        strokeWidth="1"
        opacity="0"
      >
        <animate attributeName="r" values={`${8};${20 + i * 8}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
        <animate attributeName="opacity" values="0.6;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.5}s`} />
      </circle>
    ))}

    {/* Labels */}
    <text x="220" y="18" fill="white" fontSize="8" fontWeight="600">Capteur IoT</text>
    <text x="160" y="175" fill="hsl(200, 50%, 65%)" fontSize="9" textAnchor="middle" fontWeight="600">Fuite détectée : 2,3 L/h</text>
  </svg>
);

/* ── 6. Robinet: Cost Comparison (tap vs bottle) ── */
export const CostComparisonAnimation = () => (
  <svg viewBox="0 0 260 200" className="w-full max-w-xs mx-auto" aria-label="Comparaison coût robinet vs bouteille">
    {/* Background panel */}
    <rect x="10" y="10" width="240" height="180" rx="10" fill="hsl(220, 15%, 15%)" stroke="hsl(220, 15%, 30%)" strokeWidth="1.5" />

    {/* Title */}
    <text x="130" y="35" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">Coût pour 1 000 L</text>

    {/* Tap water bar */}
    <rect x="50" y="140" width="50" height="0" rx="4" fill="hsl(200, 70%, 55%)">
      <animate attributeName="height" values="0;8;8" dur="3s" repeatCount="indefinite" />
      <animate attributeName="y" values="140;132;132" dur="3s" repeatCount="indefinite" />
    </rect>
    {/* Tap icon */}
    <text x="75" y="155" fill="hsl(200, 70%, 70%)" fontSize="16" textAnchor="middle">🚰</text>
    <text x="75" y="172" fill="hsl(200, 60%, 65%)" fontSize="9" textAnchor="middle" fontWeight="600">Robinet</text>
    <text x="75" y="122" fill="hsl(142, 70%, 55%)" fontSize="11" textAnchor="middle" fontWeight="bold">4 €</text>

    {/* Bottle water bar */}
    <rect x="160" y="140" width="50" height="0" rx="4" fill="hsl(0, 60%, 50%)">
      <animate attributeName="height" values="0;90;90" dur="3s" repeatCount="indefinite" />
      <animate attributeName="y" values="140;50;50" dur="3s" repeatCount="indefinite" />
    </rect>
    {/* Bottle icon */}
    <text x="185" y="155" fill="hsl(0, 50%, 65%)" fontSize="16" textAnchor="middle">🧴</text>
    <text x="185" y="172" fill="hsl(0, 50%, 65%)" fontSize="9" textAnchor="middle" fontWeight="600">Bouteille</text>
    <text x="185" y="46" fill="hsl(0, 70%, 60%)" fontSize="11" textAnchor="middle" fontWeight="bold" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1" dur="3s" repeatCount="indefinite" />
      400 €
    </text>

    {/* Multiplier indicator */}
    <text x="130" y="95" fill="hsl(45, 90%, 60%)" fontSize="14" textAnchor="middle" fontWeight="bold" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1" dur="3s" repeatCount="indefinite" />
      ×100
    </text>

    {/* Euro symbols floating */}
    {[0, 1, 2].map(i => (
      <text
        key={i}
        x={170 + i * 15}
        fill="hsl(45, 80%, 55%)"
        fontSize="10"
        opacity="0"
        textAnchor="middle"
      >
        <animate attributeName="y" values="140;60" dur="2.5s" repeatCount="indefinite" begin={`${1.5 + i * 0.4}s`} />
        <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" repeatCount="indefinite" begin={`${1.5 + i * 0.4}s`} />
        €
      </text>
    ))}
  </svg>
);
