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
};

const mapCategory = (raw?: string): SourceItem["water_category"] => {
  const v = (raw ?? "").toLowerCase();
  if (v === "emn" || (v.includes("minérale") && !v.includes("gazeuse"))) return "Eau minérale naturelle";
  if (v.includes("gazeuse") || v === "emng") return "Eau minérale naturelle gazeuse";
  if (v.includes("source") || v === "es") return "Eau de source";
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
  const compIndex = new Map<string, { residue?: number; flow_rate?: number; depth?: number; temperature?: number }>();
  for (const row of comp.rows) {
    const k =
      key(row["source_name"], row["brand"], row["commune"]) ||
      key(row["source_name"], undefined, row["commune"]) ||
      key(undefined, row["brand"], row["commune"]) ||
      key(row["source_name"]) ||
      key(undefined, row["brand"]);
    if (!k) continue;
    compIndex.set(k, {
      residue: toNumber(row["residu_sec_180_mg_L"]) ?? toNumber(row["residu"]) ?? undefined,
      flow_rate: toNumber(row["flow_rate"]),
      depth: toNumber(row["depth"]),
      temperature: toNumber(row["temperature"]),
    });
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

    const k =
      key(srcName, brand, commune) ||
      key(srcName, undefined, commune) ||
      key(undefined, brand, commune) ||
      key(srcName) ||
      key(undefined, brand);

    const meta = (k && compIndex.get(k)) || {};

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
    };

    // Nettoyage des champs indéfinis/NaN
    (["residue","flow_rate","depth","temperature"] as const).forEach(k => {
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