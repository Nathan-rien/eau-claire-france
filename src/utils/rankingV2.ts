export type Profile = "purity"|"daily"|"baby"|"sport"|"low_sodium"|"tea"|"grossesse"|"constipation"|"osteoporose"|"senior"|"digestion";

export type Composition = {
  NO3_mg_L?: number;             // Nitrates
  residu_sec_180_mg_L?: number;  // Résidu sec
  Ca_mg_L?: number;              // Calcium
  Mg_mg_L?: number;              // Magnésium
  Na_mg_L?: number;              // Sodium
  // Nouveaux critères
  pH?: number;
  HCO3_mg_L?: number;            // Bicarbonates
  SO4_mg_L?: number;             // Sulfates
  F_mg_L?: number;               // Fluorure
  K_mg_L?: number;               // Potassium
  Cl_mg_L?: number;              // Chlorures
};

type Rule =
  | { type:"low-better"; fullAt:number; zeroAt:number }
  | { type:"window"; min:number; optLow:number; optHigh:number; max:number };

type Criterion = "nitrates"|"residu"|"calcium"|"magnesium"|"sodium"|"pH"|"bicarbonates"|"sulfates"|"fluorure"|"potassium"|"chlorures";

type ProfileConfig = {
  label: string;
  description: string;
  icon: string;
  weights: Record<Criterion, number>;
  rules: Record<Criterion, Rule>;
  exclusions?: { criterion: Criterion; maxValue: number; reason: string }[];
};

const lowBetter = (v:number|undefined, fullAt:number, zeroAt:number) => {
  if (v == null || !Number.isFinite(v)) return 5; // Valeur neutre si donnée manquante
  if (v <= fullAt) return 10;
  if (v >= zeroAt) return 0;
  return ((zeroAt - v) / (zeroAt - fullAt)) * 10;
};

const windowed = (v:number|undefined, min:number, optLow:number, optHigh:number, max:number) => {
  if (v == null || !Number.isFinite(v)) return 5; // Valeur neutre si donnée manquante
  if (v <= min || v >= max) return 0;
  if (v >= optLow && v <= optHigh) return 10;
  if (v < optLow) return ((v - min) / (optLow - min)) * 10;
  return ((max - v) / (max - optHigh)) * 10;
};

// Total des poids = 80 points
export const PROFILES: Record<Profile, ProfileConfig> = {
  daily: {
    label: "Quotidien",
    description: "Usage quotidien équilibré",
    icon: "☀️",
    weights: { nitrates:10, residu:12, calcium:8, magnesium:6, sodium:8, pH:6, bicarbonates:8, sulfates:6, fluorure:6, potassium:4, chlorures:6 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:45 },
      residu:      { type:"window",     min:50,      optLow:150, optHigh:500, max:1500 },
      calcium:     { type:"window",     min:0,       optLow:50,  optHigh:150, max:500 },
      magnesium:   { type:"window",     min:0,       optLow:10,  optHigh:50,  max:150 },
      sodium:      { type:"low-better", fullAt:10,   zeroAt:200 },
      pH:          { type:"window",     min:5.5,     optLow:6.5, optHigh:7.8, max:9.0 },
      bicarbonates:{ type:"window",     min:0,       optLow:100, optHigh:500, max:2000 },
      sulfates:    { type:"low-better", fullAt:50,   zeroAt:400 },
      fluorure:    { type:"window",     min:0,       optLow:0.2, optHigh:0.8, max:1.5 },
      potassium:   { type:"window",     min:0,       optLow:2,   optHigh:15,  max:50 },
      chlorures:   { type:"low-better", fullAt:20,   zeroAt:150 },
    },
  },
  baby: {
    label: "Bébé",
    description: "Préparation des biberons",
    icon: "👶",
    weights: { nitrates:14, residu:12, calcium:6, magnesium:6, sodium:8, pH:6, bicarbonates:6, sulfates:8, fluorure:10, potassium:2, chlorures:2 },
    rules: {
      nitrates:    { type:"low-better", fullAt:2,    zeroAt:15 },
      residu:      { type:"window",     min:0,       optLow:50,  optHigh:250, max:500 },
      calcium:     { type:"window",     min:0,       optLow:20,  optHigh:70,  max:150 },
      magnesium:   { type:"window",     min:0,       optLow:5,   optHigh:25,  max:50 },
      sodium:      { type:"low-better", fullAt:10,   zeroAt:50 },
      pH:          { type:"window",     min:6.0,     optLow:6.8, optHigh:7.5, max:8.0 },
      bicarbonates:{ type:"window",     min:0,       optLow:50,  optHigh:200, max:500 },
      sulfates:    { type:"low-better", fullAt:50,   zeroAt:140 },
      fluorure:    { type:"low-better", fullAt:0.1,  zeroAt:0.5 },
      potassium:   { type:"low-better", fullAt:5,    zeroAt:20 },
      chlorures:   { type:"low-better", fullAt:15,   zeroAt:50 },
    },
    exclusions: [
      { criterion: "nitrates", maxValue: 15, reason: "Nitrates trop élevés pour un bébé" },
      { criterion: "fluorure", maxValue: 0.5, reason: "Fluorure excessif pour un nourrisson" },
      { criterion: "sulfates", maxValue: 140, reason: "Sulfates trop élevés" },
    ],
  },
  sport: {
    label: "Sport",
    description: "Récupération sportive",
    icon: "🏃",
    weights: { nitrates:6, residu:8, calcium:12, magnesium:14, sodium:4, pH:4, bicarbonates:12, sulfates:4, fluorure:2, potassium:10, chlorures:4 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:45 },
      residu:      { type:"window",     min:150,     optLow:500, optHigh:1500, max:3000 },
      calcium:     { type:"window",     min:50,      optLow:150, optHigh:400,  max:600 },
      magnesium:   { type:"window",     min:20,      optLow:50,  optHigh:150,  max:250 },
      sodium:      { type:"window",     min:0,       optLow:20,  optHigh:150,  max:300 },
      pH:          { type:"window",     min:5.5,     optLow:6.0, optHigh:7.5,  max:8.5 },
      bicarbonates:{ type:"window",     min:100,     optLow:500, optHigh:1500, max:3000 },
      sulfates:    { type:"window",     min:0,       optLow:50,  optHigh:300,  max:600 },
      fluorure:    { type:"low-better", fullAt:0.5,  zeroAt:2.0 },
      potassium:   { type:"window",     min:5,       optLow:20,  optHigh:100,  max:250 },
      chlorures:   { type:"window",     min:10,      optLow:30,  optHigh:100,  max:200 },
    },
  },
  low_sodium: {
    label: "Régime sans sel",
    description: "Hypertension, régime hyposodé",
    icon: "🧂",
    weights: { nitrates:10, residu:10, calcium:8, magnesium:8, sodium:14, pH:6, bicarbonates:6, sulfates:6, fluorure:4, potassium:4, chlorures:4 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:45 },
      residu:      { type:"window",     min:50,      optLow:150, optHigh:500, max:1500 },
      calcium:     { type:"window",     min:0,       optLow:50,  optHigh:150, max:500 },
      magnesium:   { type:"window",     min:0,       optLow:10,  optHigh:50,  max:150 },
      sodium:      { type:"low-better", fullAt:5,    zeroAt:20 },
      pH:          { type:"window",     min:5.5,     optLow:6.5, optHigh:7.8, max:9.0 },
      bicarbonates:{ type:"window",     min:0,       optLow:100, optHigh:400, max:1000 },
      sulfates:    { type:"low-better", fullAt:50,   zeroAt:300 },
      fluorure:    { type:"window",     min:0,       optLow:0.2, optHigh:0.8, max:1.5 },
      potassium:   { type:"window",     min:0,       optLow:2,   optHigh:15,  max:50 },
      chlorures:   { type:"low-better", fullAt:10,   zeroAt:50 },
    },
    exclusions: [
      { criterion: "sodium", maxValue: 20, reason: "Sodium trop élevé pour un régime hyposodé" },
    ],
  },
  tea: {
    label: "Thé & infusions",
    description: "Préparation du thé",
    icon: "🍵",
    weights: { nitrates:8, residu:14, calcium:8, magnesium:6, sodium:6, pH:10, bicarbonates:8, sulfates:6, fluorure:4, potassium:4, chlorures:6 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:45 },
      residu:      { type:"window",     min:0,       optLow:50,  optHigh:150, max:400 },
      calcium:     { type:"window",     min:0,       optLow:20,  optHigh:80,  max:200 },
      magnesium:   { type:"window",     min:0,       optLow:5,   optHigh:30,  max:80 },
      sodium:      { type:"low-better", fullAt:5,    zeroAt:50 },
      pH:          { type:"window",     min:6.0,     optLow:6.8, optHigh:7.5, max:8.5 },
      bicarbonates:{ type:"window",     min:0,       optLow:50,  optHigh:200, max:500 },
      sulfates:    { type:"low-better", fullAt:30,   zeroAt:150 },
      fluorure:    { type:"window",     min:0,       optLow:0.1, optHigh:0.5, max:1.0 },
      potassium:   { type:"low-better", fullAt:5,    zeroAt:30 },
      chlorures:   { type:"low-better", fullAt:15,   zeroAt:60 },
    },
  },
  grossesse: {
    label: "Grossesse",
    description: "Femmes enceintes ou allaitantes",
    icon: "🤰",
    weights: { nitrates:14, residu:10, calcium:12, magnesium:10, sodium:6, pH:4, bicarbonates:6, sulfates:4, fluorure:8, potassium:4, chlorures:2 },
    rules: {
      nitrates:    { type:"low-better", fullAt:3,    zeroAt:25 },
      residu:      { type:"window",     min:100,     optLow:200, optHigh:600, max:1200 },
      calcium:     { type:"window",     min:50,      optLow:100, optHigh:250, max:500 },
      magnesium:   { type:"window",     min:10,      optLow:30,  optHigh:80,  max:150 },
      sodium:      { type:"low-better", fullAt:15,   zeroAt:100 },
      pH:          { type:"window",     min:6.0,     optLow:6.8, optHigh:7.8, max:8.5 },
      bicarbonates:{ type:"window",     min:50,      optLow:150, optHigh:400, max:800 },
      sulfates:    { type:"low-better", fullAt:100,  zeroAt:300 },
      fluorure:    { type:"window",     min:0,       optLow:0.2, optHigh:0.7, max:1.0 },
      potassium:   { type:"window",     min:2,       optLow:5,   optHigh:20,  max:50 },
      chlorures:   { type:"low-better", fullAt:20,   zeroAt:100 },
    },
    exclusions: [
      { criterion: "nitrates", maxValue: 25, reason: "Nitrates trop élevés pour la grossesse" },
      { criterion: "fluorure", maxValue: 1.0, reason: "Fluorure excessif" },
    ],
  },
  constipation: {
    label: "Transit",
    description: "Favorise le transit intestinal",
    icon: "🌿",
    weights: { nitrates:6, residu:8, calcium:6, magnesium:16, sodium:4, pH:4, bicarbonates:8, sulfates:16, fluorure:2, potassium:6, chlorures:4 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:45 },
      residu:      { type:"window",     min:300,     optLow:800, optHigh:2000, max:3000 },
      calcium:     { type:"window",     min:50,      optLow:150, optHigh:400,  max:600 },
      magnesium:   { type:"window",     min:50,      optLow:80,  optHigh:150,  max:250 },
      sodium:      { type:"low-better", fullAt:20,   zeroAt:200 },
      pH:          { type:"window",     min:5.5,     optLow:6.0, optHigh:7.5,  max:8.5 },
      bicarbonates:{ type:"window",     min:100,     optLow:300, optHigh:800,  max:1500 },
      sulfates:    { type:"window",     min:200,     optLow:500, optHigh:1200, max:1800 },
      fluorure:    { type:"low-better", fullAt:0.5,  zeroAt:2.0 },
      potassium:   { type:"window",     min:5,       optLow:15,  optHigh:50,   max:100 },
      chlorures:   { type:"low-better", fullAt:30,   zeroAt:150 },
    },
  },
  osteoporose: {
    label: "Os & calcium",
    description: "Renforcement osseux",
    icon: "🦴",
    weights: { nitrates:6, residu:8, calcium:18, magnesium:10, sodium:6, pH:6, bicarbonates:6, sulfates:6, fluorure:6, potassium:4, chlorures:4 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:45 },
      residu:      { type:"window",     min:300,     optLow:600, optHigh:1500, max:2500 },
      calcium:     { type:"window",     min:200,     optLow:350, optHigh:550,  max:700 },
      magnesium:   { type:"window",     min:20,      optLow:50,  optHigh:120,  max:200 },
      sodium:      { type:"low-better", fullAt:15,   zeroAt:150 },
      pH:          { type:"window",     min:6.0,     optLow:7.0, optHigh:7.8,  max:8.5 },
      bicarbonates:{ type:"window",     min:100,     optLow:250, optHigh:500,  max:1000 },
      sulfates:    { type:"window",     min:100,     optLow:300, optHigh:800,  max:1500 },
      fluorure:    { type:"window",     min:0.3,     optLow:0.5, optHigh:1.0,  max:1.5 },
      potassium:   { type:"window",     min:2,       optLow:5,   optHigh:20,   max:50 },
      chlorures:   { type:"low-better", fullAt:20,   zeroAt:100 },
    },
  },
  senior: {
    label: "Senior",
    description: "Personnes âgées",
    icon: "👴",
    weights: { nitrates:8, residu:10, calcium:12, magnesium:12, sodium:10, pH:6, bicarbonates:8, sulfates:4, fluorure:4, potassium:4, chlorures:2 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:40 },
      residu:      { type:"window",     min:100,     optLow:250, optHigh:700, max:1500 },
      calcium:     { type:"window",     min:50,      optLow:100, optHigh:250, max:450 },
      magnesium:   { type:"window",     min:15,      optLow:40,  optHigh:100, max:180 },
      sodium:      { type:"low-better", fullAt:10,   zeroAt:80 },
      pH:          { type:"window",     min:6.0,     optLow:6.8, optHigh:7.8, max:8.5 },
      bicarbonates:{ type:"window",     min:50,      optLow:150, optHigh:450, max:900 },
      sulfates:    { type:"low-better", fullAt:100,  zeroAt:400 },
      fluorure:    { type:"window",     min:0.1,     optLow:0.3, optHigh:0.8, max:1.2 },
      potassium:   { type:"window",     min:2,       optLow:5,   optHigh:20,  max:50 },
      chlorures:   { type:"low-better", fullAt:20,   zeroAt:100 },
    },
  },
  digestion: {
    label: "Digestion",
    description: "Aide digestive après repas",
    icon: "🍽️",
    weights: { nitrates:6, residu:8, calcium:6, magnesium:8, sodium:6, pH:10, bicarbonates:18, sulfates:6, fluorure:2, potassium:6, chlorures:4 },
    rules: {
      nitrates:    { type:"low-better", fullAt:5,    zeroAt:45 },
      residu:      { type:"window",     min:200,     optLow:500, optHigh:1500, max:3000 },
      calcium:     { type:"window",     min:30,      optLow:80,  optHigh:200,  max:400 },
      magnesium:   { type:"window",     min:10,      optLow:30,  optHigh:80,   max:150 },
      sodium:      { type:"window",     min:20,      optLow:80,  optHigh:300,  max:600 },
      pH:          { type:"window",     min:6.0,     optLow:6.5, optHigh:7.2,  max:8.0 },
      bicarbonates:{ type:"window",     min:500,     optLow:1000,optHigh:2500, max:4500 },
      sulfates:    { type:"window",     min:50,      optLow:150, optHigh:400,  max:800 },
      fluorure:    { type:"low-better", fullAt:0.5,  zeroAt:2.0 },
      potassium:   { type:"window",     min:10,      optLow:30,  optHigh:100,  max:200 },
      chlorures:   { type:"window",     min:20,      optLow:50,  optHigh:150,  max:300 },
    },
  },
};

function applyRule(v:number|undefined, r:Rule): number {
  return r.type === "low-better"
    ? lowBetter(v, r.fullAt, r.zeroAt)
    : windowed(v, r.min, r.optLow, r.optHigh, r.max);
}

export type ScoreBreakdown = Record<Criterion, number>;

export function scoreBottle(comp: Composition, profile: Profile = "daily") {
  const cfg = PROFILES[profile];
  
  const breakdown10: ScoreBreakdown = {
    nitrates:    applyRule(comp.NO3_mg_L,            cfg.rules.nitrates),
    residu:      applyRule(comp.residu_sec_180_mg_L, cfg.rules.residu),
    calcium:     applyRule(comp.Ca_mg_L,             cfg.rules.calcium),
    magnesium:   applyRule(comp.Mg_mg_L,             cfg.rules.magnesium),
    sodium:      applyRule(comp.Na_mg_L,             cfg.rules.sodium),
    pH:          applyRule(comp.pH,                  cfg.rules.pH),
    bicarbonates:applyRule(comp.HCO3_mg_L,           cfg.rules.bicarbonates),
    sulfates:    applyRule(comp.SO4_mg_L,            cfg.rules.sulfates),
    fluorure:    applyRule(comp.F_mg_L,              cfg.rules.fluorure),
    potassium:   applyRule(comp.K_mg_L,              cfg.rules.potassium),
    chlorures:   applyRule(comp.Cl_mg_L,             cfg.rules.chlorures),
  };

  const w = cfg.weights;
  const total80 = Object.keys(breakdown10).reduce((sum, key) => {
    const k = key as Criterion;
    return sum + (breakdown10[k] / 10) * w[k];
  }, 0);

  // Check exclusions
  const exclusionReasons: string[] = [];
  if (cfg.exclusions) {
    for (const ex of cfg.exclusions) {
      const value = getCompositionValue(comp, ex.criterion);
      if (value != null && value > ex.maxValue) {
        exclusionReasons.push(ex.reason);
      }
    }
  }

  return { 
    total: Math.round(total80 * 10) / 10, 
    outOf: 80, 
    breakdown10, 
    weights: w, 
    profile,
    excluded: exclusionReasons.length > 0,
    exclusionReasons,
  };
}

function getCompositionValue(comp: Composition, criterion: Criterion): number | undefined {
  switch (criterion) {
    case "nitrates": return comp.NO3_mg_L;
    case "residu": return comp.residu_sec_180_mg_L;
    case "calcium": return comp.Ca_mg_L;
    case "magnesium": return comp.Mg_mg_L;
    case "sodium": return comp.Na_mg_L;
    case "pH": return comp.pH;
    case "bicarbonates": return comp.HCO3_mg_L;
    case "sulfates": return comp.SO4_mg_L;
    case "fluorure": return comp.F_mg_L;
    case "potassium": return comp.K_mg_L;
    case "chlorures": return comp.Cl_mg_L;
  }
}

export function letterGrade(total80: number) {
  if (total80 >= 68) return "A";  // 85%+
  if (total80 >= 56) return "B";  // 70%+
  if (total80 >= 44) return "C";  // 55%+
  if (total80 >= 32) return "D";  // 40%+
  return "E";
}

export function getProfileInfo(profile: Profile) {
  return PROFILES[profile];
}

// Explications utilisateur enrichies
export function reasons(comp: Composition, profile: Profile) {
  const cfg = PROFILES[profile];
  const r: string[] = [];

  // Check exclusions first
  if (cfg.exclusions) {
    for (const ex of cfg.exclusions) {
      const value = getCompositionValue(comp, ex.criterion);
      if (value != null && value > ex.maxValue) {
        r.push(`⚠️ ${ex.reason}`);
      }
    }
  }

  // Positive points
  if ((comp.NO3_mg_L ?? 50) <= 5) r.push("✓ Nitrates très bas");
  if ((comp.Ca_mg_L ?? 0) >= 300 && (profile === "sport" || profile === "osteoporose")) 
    r.push("✓ Calcium élevé, excellent pour ce profil");
  if ((comp.Mg_mg_L ?? 0) >= 80 && (profile === "sport" || profile === "constipation")) 
    r.push("✓ Magnésium élevé, parfait pour la récupération");
  if ((comp.HCO3_mg_L ?? 0) >= 1000 && profile === "digestion") 
    r.push("✓ Bicarbonates élevés, idéal pour la digestion");
  if ((comp.SO4_mg_L ?? 0) >= 500 && profile === "constipation") 
    r.push("✓ Sulfates élevés, favorise le transit");

  // Negative points (excluding exclusions already shown)
  if ((comp.residu_sec_180_mg_L ?? 0) >= 1500 && profile === "daily")
    r.push("Résidu sec très élevé → préférez profil Sport ou Transit");
  if ((comp.Na_mg_L ?? 0) >= 100 && profile !== "sport" && profile !== "digestion")
    r.push("Sodium élevé → moins adapté à ce profil");
  if ((comp.F_mg_L ?? 0) >= 1 && (profile === "baby" || profile === "grossesse"))
    r.push("Fluorure élevé → prudence pour ce profil");

  return r;
}

// Labels pour l'affichage
export const CRITERION_LABELS: Record<Criterion, { label: string; unit: string }> = {
  nitrates:    { label: "Nitrates", unit: "mg/L" },
  residu:      { label: "Résidu sec", unit: "mg/L" },
  calcium:     { label: "Calcium", unit: "mg/L" },
  magnesium:   { label: "Magnésium", unit: "mg/L" },
  sodium:      { label: "Sodium", unit: "mg/L" },
  pH:          { label: "pH", unit: "" },
  bicarbonates:{ label: "Bicarbonates", unit: "mg/L" },
  sulfates:    { label: "Sulfates", unit: "mg/L" },
  fluorure:    { label: "Fluorure", unit: "mg/L" },
  potassium:   { label: "Potassium", unit: "mg/L" },
  chlorures:   { label: "Chlorures", unit: "mg/L" },
};

export function getCompositionForDisplay(comp: Composition): { criterion: Criterion; value: number | undefined }[] {
  return [
    { criterion: "nitrates", value: comp.NO3_mg_L },
    { criterion: "residu", value: comp.residu_sec_180_mg_L },
    { criterion: "calcium", value: comp.Ca_mg_L },
    { criterion: "magnesium", value: comp.Mg_mg_L },
    { criterion: "sodium", value: comp.Na_mg_L },
    { criterion: "pH", value: comp.pH },
    { criterion: "bicarbonates", value: comp.HCO3_mg_L },
    { criterion: "sulfates", value: comp.SO4_mg_L },
    { criterion: "fluorure", value: comp.F_mg_L },
    { criterion: "potassium", value: comp.K_mg_L },
    { criterion: "chlorures", value: comp.Cl_mg_L },
  ];
}
