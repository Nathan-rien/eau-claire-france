// src/services/waterData.ts
type Row = Record<string, string>;

const COMPO_URL   = import.meta.env.VITE_WATER_COMPO_CSV_URL as string;
const CATALOG_URL = import.meta.env.VITE_WATER_CATALOG_CSV_URL as string;
const MDD_URL     = import.meta.env.VITE_WATER_MDD_CSV_URL as string;

async function fetchText(url?: string) {
  if (!url) throw new Error("URL CSV manquante");
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Fetch ${url}: ${r.status} ${r.statusText}`);
  return r.text();
}

// CSV -> JSON (simple, sans guillemets imbriqués)
function csvToJson(csv: string): Row[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const o: Row = {};
    headers.forEach((h, i) => (o[h] = (cells[i] ?? "").trim()));
    return o;
  });
}

// util: convertir certaines colonnes en nombres (mg/L, etc.)
function toNumber(x?: string) {
  if (!x) return NaN;
  const v = Number(String(x).replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
}

export type Composition = {
  brand?: string;
  source_name?: string;
  location?: string;
  is_sparkling?: string | boolean;
  pH?: number; 
  residu_sec_180_mg_L?: number;
  HCO3_mg_L?: number; 
  Ca_mg_L?: number; 
  Mg_mg_L?: number; 
  Na_mg_L?: number;
  K_mg_L?: number; 
  SO4_mg_L?: number; 
  Cl_mg_L?: number; 
  NO3_mg_L?: number;
  SiO2_mg_L?: number; 
  F_mg_L?: number;
  [k: string]: any;
};

function normalizeComposition(rows: Row[]): Composition[] {
  return rows.map(r => ({
    ...r,
    pH: toNumber(r.pH),
    residu_sec_180_mg_L: toNumber(r.residu_sec_180_mg_L),
    HCO3_mg_L: toNumber(r.HCO3_mg_L),
    Ca_mg_L: toNumber(r.Ca_mg_L),
    Mg_mg_L: toNumber(r.Mg_mg_L),
    Na_mg_L: toNumber(r.Na_mg_L),
    K_mg_L: toNumber(r.K_mg_L),
    SO4_mg_L: toNumber(r.SO4_mg_L),
    Cl_mg_L: toNumber(r.Cl_mg_L),
    NO3_mg_L: toNumber(r.NO3_mg_L),
    SiO2_mg_L: toNumber(r.SiO2_mg_L),
    F_mg_L: toNumber(r.F_mg_L),
    is_sparkling: r.is_sparkling === "true" || r.is_sparkling === "True" || r.is_sparkling === "1",
  }));
}

let cache: {
  composition?: Composition[];
  catalog?: Row[];
  mdd?: Row[];
} = {};

export async function loadComposition() {
  if (!cache.composition) {
    const txt = await fetchText(COMPO_URL);
    cache.composition = normalizeComposition(csvToJson(txt));
  }
  return cache.composition!;
}

export async function loadCatalog() {
  if (!cache.catalog) {
    const txt = await fetchText(CATALOG_URL);
    cache.catalog = csvToJson(txt);
  }
  return cache.catalog!;
}

export async function loadMdd() {
  if (!cache.mdd) {
    const txt = await fetchText(MDD_URL);
    cache.mdd = csvToJson(txt);
  }
  return cache.mdd!;
}