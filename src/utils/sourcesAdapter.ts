import { parseCSV, toNumber } from "./csv";

export type SourceItem = {
  source_id: string;
  source_name: string;
  location?: string;
  brands: string[];
  count_brands: number;
  latitude: number;
  longitude: number;
  water_category: "Eau minérale naturelle" | "Eau minérale naturelle gazeuse" | "Eau de source";
  residue?: number;
  flow_rate?: number;
  depth?: number;
  temperature?: number;
  // Composition minérale
  pH?: number;
  residu_sec_180_mg_L?: number;
  HCO3_mg_L?: number;
  Ca_mg_L?: number;
  Cl_mg_L?: number;
  F_mg_L?: number;
  Mg_mg_L?: number;
  NO3_mg_L?: number;
  K_mg_L?: number;
  SiO2_mg_L?: number;
  Na_mg_L?: number;
  SO4_mg_L?: number;
};

const mapCategory = (raw?: string, isGaseous?: boolean): SourceItem["water_category"] => {
  const v = (raw ?? "").toLowerCase();
  if (v.includes("gazeuse") || v === "emng") return "Eau minérale naturelle gazeuse";
  if (v.includes("source") || v === "es") return "Eau de source";
  if (isGaseous) return "Eau minérale naturelle gazeuse";
  return "Eau minérale naturelle";
};

const norm = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const key = (a?: string, b?: string, c?: string) =>
  [norm(a), norm(b), norm(c)].filter(Boolean).join("|");

export async function buildSources(): Promise<SourceItem[]> {
  const log = (...a: any[]) => console.log("[buildSources]", ...a);

  const [coordsTxt, compTxt] = await Promise.all([
    fetch("/data/water_sources_coordinates.csv").then(r => r.text()),
    fetch("/data/infoeau_emn_composition_v2_partial.csv").then(r => r.text()).catch(() => "")
  ]);

  const coords = parseCSV(coordsTxt);
  const comp = compTxt ? parseCSV(compTxt) : { headers: [], rows: [] };

  log("rows", { coords: coords.rows.length, comp: comp.rows.length });

  // Index composition par clé souple
  type CompositionData = {
    residue?: number;
    flow_rate?: number;
    depth?: number;
    temperature?: number;
    pH?: number;
    residu_sec_180_mg_L?: number;
    HCO3_mg_L?: number;
    Ca_mg_L?: number;
    Cl_mg_L?: number;
    F_mg_L?: number;
    Mg_mg_L?: number;
    NO3_mg_L?: number;
    K_mg_L?: number;
    SiO2_mg_L?: number;
    Na_mg_L?: number;
    SO4_mg_L?: number;
  };

  const compIndex = new Map<string, CompositionData>();
  // Build index with multiple keys for flexible matching
  for (const row of comp.rows) {
    const data: CompositionData = {
      residue: toNumber(row["residu_sec_180_mg_L"]) ?? toNumber(row["residu"]) ?? undefined,
      flow_rate: toNumber(row["flow_rate"]),
      depth: toNumber(row["depth"]),
      temperature: toNumber(row["temperature"]),
      pH: toNumber(row["pH"]),
      residu_sec_180_mg_L: toNumber(row["residu_sec_180_mg_L"]),
      HCO3_mg_L: toNumber(row["HCO3_mg_L"]),
      Ca_mg_L: toNumber(row["Ca_mg_L"]),
      Cl_mg_L: toNumber(row["Cl_mg_L"]),
      F_mg_L: toNumber(row["F_mg_L"]),
      Mg_mg_L: toNumber(row["Mg_mg_L"]),
      NO3_mg_L: toNumber(row["NO3_mg_L"]),
      K_mg_L: toNumber(row["K_mg_L"]),
      SiO2_mg_L: toNumber(row["SiO2_mg_L"]),
      Na_mg_L: toNumber(row["Na_mg_L"]),
      SO4_mg_L: toNumber(row["SO4_mg_L"]),
    };

    // Index by multiple key variants for best matching
    const commune = row["commune"] || row["location"] || "";
    const keys = [
      key(row["source_name"], row["brand"], commune),
      key(row["source_name"], undefined, commune),
      key(undefined, row["brand"], commune),
      key(row["source_name"]),
      key(undefined, row["brand"]),
    ];
    for (const k of keys) {
      if (k && !compIndex.has(k)) compIndex.set(k, data);
    }
  }
  log("compIndex", compIndex.size);

  const items: SourceItem[] = [];
  let i = 0;

  for (const r of coords.rows) {
    const lat = toNumber(r["latitude"]);
    const lng = toNumber(r["longitude"]);
    if (lat === undefined || lng === undefined) continue;

    const srcName = r["source_name"] || r["Source"] || r["source"] || "";
    const brand = r["brand"] || r["Marque"] || r["marque"] || "";
    const commune = r["commune"] || r["Commune"] || "";
    const department = r["department"] || r["Département"] || r["Departement"] || "";
    const rawCategory = r["category"] || r["Catégorie"] || r["Categorie"] || "";

    const candidateKeys = [
      key(srcName, brand, commune),
      key(srcName, undefined, commune),
      key(undefined, brand, commune),
      key(srcName),
      key(undefined, brand),
    ].filter(Boolean) as string[];

    const matchedKey = candidateKeys.find((candidate) => compIndex.has(candidate));
    const meta = matchedKey ? compIndex.get(matchedKey) ?? {} : {};
    
    if (srcName.toLowerCase().includes('romains') || brand.toLowerCase().includes('rozana')) {
      log('🔍 Des Romains/Rozana found:', { srcName, brand, commune, matchedKey, hasMeta: !!matchedKey, meta });
    }

    const it: SourceItem = {
      source_id: `src_${i++}`,
      source_name: srcName || (brand ? `Source ${brand}` : "Source"),
      location: [commune, department].filter(Boolean).join(", "),
      brands: brand ? [brand] : [],
      count_brands: brand ? 1 : 0,
      latitude: lng !== undefined && lat !== undefined ? lat : 0, // lat
      longitude: lng !== undefined ? lng : 0, // lng
      water_category: mapCategory(rawCategory),
      residue: meta.residue,
      flow_rate: meta.flow_rate,
      depth: meta.depth,
      temperature: meta.temperature,
      pH: meta.pH,
      residu_sec_180_mg_L: meta.residu_sec_180_mg_L,
      HCO3_mg_L: meta.HCO3_mg_L,
      Ca_mg_L: meta.Ca_mg_L,
      Cl_mg_L: meta.Cl_mg_L,
      F_mg_L: meta.F_mg_L,
      Mg_mg_L: meta.Mg_mg_L,
      NO3_mg_L: meta.NO3_mg_L,
      K_mg_L: meta.K_mg_L,
      SiO2_mg_L: meta.SiO2_mg_L,
      Na_mg_L: meta.Na_mg_L,
      SO4_mg_L: meta.SO4_mg_L,
    };

    // Nettoyage des champs indéfinis/NaN
    (["residue","flow_rate","depth","temperature","pH","residu_sec_180_mg_L","HCO3_mg_L","Ca_mg_L","Cl_mg_L","F_mg_L","Mg_mg_L","NO3_mg_L","K_mg_L","SiO2_mg_L","Na_mg_L","SO4_mg_L"] as const).forEach(k => {
      const v = it[k];
      if (v === undefined || Number.isNaN(v)) delete (it as any)[k];
    });

    items.push(it);
  }

  // Filtre final sécurité
  const sanitized = items.filter(it => Number.isFinite(it.latitude) && Number.isFinite(it.longitude));

  log("built items", sanitized.length);
  return sanitized;
}