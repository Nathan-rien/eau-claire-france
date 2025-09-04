export type Profile = "daily"|"baby"|"sport"|"low_sodium"|"tea";

export type Composition = {
  NO3_mg_L?: number;             // Nitrates
  residu_sec_180_mg_L?: number;  // Résidu sec
  Ca_mg_L?: number;              // Calcium
  Mg_mg_L?: number;              // Magnésium
  Na_mg_L?: number;              // Sodium
};

type Rule =
  | { type:"low-better"; fullAt:number; zeroAt:number } // 10 pts à fullAt ou moins, 0 pt à zeroAt ou plus
  | { type:"window"; min:number; optLow:number; optHigh:number; max:number }; // 0 aux extrêmes, 10 dans la fenêtre

type Criterion = "nitrates"|"residu"|"calcium"|"magnesium"|"sodium";

type ProfileConfig = {
  weights: Record<Criterion, number>;          // somme = 50
  rules:   Record<Criterion, Rule>;
};

const lowBetter = (v:number|undefined, fullAt:number, zeroAt:number) => {
  if (v == null || !Number.isFinite(v)) return 0;
  if (v <= fullAt) return 10;
  if (v >= zeroAt) return 0;
  return ((zeroAt - v) / (zeroAt - fullAt)) * 10;
};

const windowed = (v:number|undefined, min:number, optLow:number, optHigh:number, max:number) => {
  if (v == null || !Number.isFinite(v)) return 0;
  if (v <= min || v >= max) return 0;
  if (v >= optLow && v <= optHigh) return 10;
  if (v < optLow)  return ((v - min) / (optLow - min)) * 10;
  return ((max - v) / (max - optHigh)) * 10;
};

export const PROFILES: Record<Profile, ProfileConfig> = {
  daily: {
    weights: { nitrates:12, residu:14, calcium:9, magnesium:7, sodium:8 },
    rules: {
      nitrates: { type:"low-better", fullAt:5,  zeroAt:45 },
      residu:   { type:"window",     min:50,  optLow:150, optHigh:500, max:1500 },
      calcium:  { type:"window",     min:0,   optLow:50,  optHigh:150, max:500 },
      magnesium:{ type:"window",     min:0,   optLow:10,  optHigh:50,  max:150 },
      sodium:   { type:"low-better", fullAt:10, zeroAt:200 },
    },
  },
  baby: {
    weights: { nitrates:16, residu:16, calcium:6, magnesium:6, sodium:6 },
    rules: {
      nitrates: { type:"low-better", fullAt:2,  zeroAt:25 },
      residu:   { type:"window",     min:0,   optLow:50,  optHigh:250, max:500 },
      calcium:  { type:"window",     min:0,   optLow:20,  optHigh:70,  max:200 },
      magnesium:{ type:"window",     min:0,   optLow:5,   optHigh:25,  max:60 },
      sodium:   { type:"low-better", fullAt:10, zeroAt:50 },
    },
  },
  sport: {
    weights: { nitrates:8, residu:10, calcium:14, magnesium:14, sodium:4 },
    rules: {
      nitrates: { type:"low-better", fullAt:5,  zeroAt:45 },
      residu:   { type:"window",     min:150, optLow:500, optHigh:1200, max:2000 },
      calcium:  { type:"window",     min:20,  optLow:100, optHigh:200,  max:500 },
      magnesium:{ type:"window",     min:5,   optLow:50,  optHigh:100,  max:200 },
      sodium:   { type:"low-better", fullAt:10, zeroAt:250 },
    },
  },
  low_sodium: {
    weights: { nitrates:12, residu:10, calcium:10, magnesium:8, sodium:10 },
    rules: {
      nitrates: { type:"low-better", fullAt:5,  zeroAt:45 },
      residu:   { type:"window",     min:50,  optLow:150, optHigh:500, max:1500 },
      calcium:  { type:"window",     min:0,   optLow:50,  optHigh:150, max:500 },
      magnesium:{ type:"window",     min:0,   optLow:10,  optHigh:50,  max:150 },
      sodium:   { type:"low-better", fullAt:5,  zeroAt:50 },
    },
  },
  tea: {
    weights: { nitrates:10, residu:16, calcium:8, magnesium:8, sodium:8 },
    rules: {
      nitrates: { type:"low-better", fullAt:5,  zeroAt:45 },
      residu:   { type:"window",     min:0,   optLow:50,  optHigh:150, max:500 },
      calcium:  { type:"window",     min:0,   optLow:20,  optHigh:80,  max:200 },
      magnesium:{ type:"window",     min:0,   optLow:5,   optHigh:30,  max:80 },
      sodium:   { type:"low-better", fullAt:5,  zeroAt:50 },
    },
  },
};

function applyRule(v:number|undefined, r:Rule): number {
  return r.type === "low-better"
    ? lowBetter(v, r.fullAt, r.zeroAt)
    : windowed(v, r.min, r.optLow, r.optHigh, r.max);
}

export function scoreBottle(comp: Composition, profile: Profile = "daily") {
  const cfg = PROFILES[profile];
  const sN  = applyRule(comp.NO3_mg_L,            cfg.rules.nitrates);
  const sR  = applyRule(comp.residu_sec_180_mg_L, cfg.rules.residu);
  const sC  = applyRule(comp.Ca_mg_L,             cfg.rules.calcium);
  const sM  = applyRule(comp.Mg_mg_L,             cfg.rules.magnesium);
  const sNa = applyRule(comp.Na_mg_L,             cfg.rules.sodium);

  const breakdown10 = { nitrates:sN, residu:sR, calcium:sC, magnesium:sM, sodium:sNa };
  const w = cfg.weights;

  const total50 =
    (sN/10)*w.nitrates +
    (sR/10)*w.residu +
    (sC/10)*w.calcium +
    (sM/10)*w.magnesium +
    (sNa/10)*w.sodium;

  return { total: Math.round(total50*10)/10, outOf:50, breakdown10, weights:w, profile };
}

export function letterGrade(total50:number) {
  if (total50 >= 42) return "A";
  if (total50 >= 35) return "B";
  if (total50 >= 28) return "C";
  if (total50 >= 22) return "D";
  return "E";
}

// Explications utilisateur (pour les puces "pourquoi")
export function reasons(comp: Composition, profile: Profile) {
  const cfg = PROFILES[profile];
  const r: string[] = [];
  const c = comp;

  if ((c.residu_sec_180_mg_L ?? 0) >= 1500 && profile === "daily")
    r.push("Résidu sec très élevé → peu adapté au quotidien");
  if ((c.Ca_mg_L ?? 0) >= 300)
    r.push("Calcium très élevé → intéressant en profil Sport/Supplémentation");
  if ((c.Mg_mg_L ?? 0) >= 80)
    r.push("Magnésium très élevé → intéressant en profil Sport");
  if ((c.Na_mg_L ?? 0) >= 100 && profile !== "sport")
    r.push("Sodium élevé → moins adapté (préférez profil Sport)");
  if ((c.NO3_mg_L ?? 0) <= 2)
    r.push("Nitrates très bas");
  return r;
}