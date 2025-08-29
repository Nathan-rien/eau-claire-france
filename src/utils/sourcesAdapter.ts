import type { Composition } from "@/services/waterData";

export type SourceItem = {
  source_id: string;
  source_name: string;
  location?: string;
  brands: string[];
  is_sparkling_mix?: boolean;
  count_brands: number;
  
  // Champs techniques
  flow_rate?: number;     // m³/j
  depth?: number;         // m
  temperature?: number;   // °C
  residue?: number;       // mg/L
};

function hashSource(name?: string, loc?: string) {
  const n = (name ?? "").trim().toLowerCase();
  const l = (loc ?? "").trim().toLowerCase();
  return `SRC-${n.replace(/\s+/g, "-")}-${l.replace(/\s+/g, "-")}`.replace(/[^a-z0-9\-]/g, "");
}

/** Agrège les captages depuis composition + complète avec le catalogue */
export function buildSources(
  composition: Composition[] = [],
  catalog: Record<string, string>[] = []
): SourceItem[] {
  const byKey = new Map<string, SourceItem>();

  for (const r of composition) {
    const source = (r.source_name ?? "").trim();
    if (!source) continue;
    const loc = (r.location ?? "").trim();
    const brand = (r.brand ?? "").trim();
    const key = hashSource(source, loc);

    if (!byKey.has(key)) {
      byKey.set(key, {
        source_id: key,
        source_name: source,
        location: loc || undefined,
        brands: [],
        is_sparkling_mix: false,
        count_brands: 0,
      });
    }
    const item = byKey.get(key)!;
    if (brand && !item.brands.includes(brand)) item.brands.push(brand);
    if (r.is_sparkling === true || r.is_sparkling === "true") item.is_sparkling_mix = true;
  }

  for (const c of catalog) {
    const source = (c.source_name ?? "").trim();
    if (!source) continue;
    const key = hashSource(source, "");
    if (!byKey.has(key)) {
      byKey.set(key, {
        source_id: key,
        source_name: source,
        location: undefined,
        brands: [],
        is_sparkling_mix: false,
        count_brands: 0,
      });
    }
    const brand = (c.brand ?? "").trim();
    const item = byKey.get(key)!;
    if (brand && !item.brands.includes(brand)) item.brands.push(brand);
    if ((c.variant ?? "").toLowerCase() === "gazeuse") item.is_sparkling_mix = true;
  }

  return Array.from(byKey.values())
    .map(s => ({ ...s, count_brands: s.brands.length }))
    .sort((a, b) => (b.count_brands - a.count_brands) || a.source_name.localeCompare(b.source_name));
}