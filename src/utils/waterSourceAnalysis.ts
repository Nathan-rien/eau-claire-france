import React from 'react';
import type { SourceItem } from '@/utils/sourcesAdapter';

export const getMineralizationLevel = (residue?: number) => {
  if (residue === undefined) return null;
  if (residue < 50) return { label: 'Très faiblement minéralisée', color: 'bg-sky-100 text-sky-800 border-sky-200' };
  if (residue < 500) return { label: 'Faiblement minéralisée', color: 'bg-green-100 text-green-800 border-green-200' };
  if (residue < 1500) return { label: 'Moyennement minéralisée', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  return { label: 'Fortement minéralisée', color: 'bg-red-100 text-red-800 border-red-200' };
};

export const computeHardness = (ca?: number, mg?: number): number | null => {
  if (ca === undefined && mg === undefined) return null;
  return ((ca ?? 0) / 40.08 + (mg ?? 0) / 24.31) * 5.0;
};

export const getHardnessLabel = (th: number): string => {
  if (th < 5) return 'Très douce';
  if (th < 15) return 'Douce';
  if (th < 25) return 'Moyennement dure';
  if (th < 35) return 'Dure';
  return 'Très dure';
};

export type UsageRecommendation = { label: string; iconName: 'Baby' | 'Sparkles'; color: string };

export const getUsageRecommendations = (s: SourceItem): UsageRecommendation[] => {
  const recs: UsageRecommendation[] = [];
  const residue = s.residu_sec_180_mg_L ?? s.residue;
  const no3 = s.NO3_mg_L;
  const f = s.F_mg_L;
  const na = s.Na_mg_L;
  const ca = s.Ca_mg_L;
  const mg = s.Mg_mg_L;
  const hco3 = s.HCO3_mg_L;

  if (residue !== undefined && residue < 500 && (no3 === undefined || no3 < 10) && (f === undefined || f < 0.5)) {
    recs.push({ label: 'Convient aux nourrissons', iconName: 'Baby', color: 'bg-pink-100 text-pink-800' });
  }
  if (na !== undefined && na < 20) {
    recs.push({ label: 'Pauvre en sodium', iconName: 'Sparkles', color: 'bg-teal-100 text-teal-800' });
  }
  if (ca !== undefined && ca > 150) {
    recs.push({ label: 'Riche en calcium', iconName: 'Sparkles', color: 'bg-blue-100 text-blue-800' });
  }
  if (mg !== undefined && mg > 50) {
    recs.push({ label: 'Riche en magnésium', iconName: 'Sparkles', color: 'bg-indigo-100 text-indigo-800' });
  }
  if (hco3 !== undefined && hco3 > 600) {
    recs.push({ label: 'Riche en bicarbonates', iconName: 'Sparkles', color: 'bg-violet-100 text-violet-800' });
  }
  return recs;
};

export type ComplianceItem = { param: string; value: number; limit: number; unit: string; ok: boolean };

export const getComplianceChecks = (s: SourceItem): ComplianceItem[] => {
  const checks: ComplianceItem[] = [];
  if (s.NO3_mg_L !== undefined) checks.push({ param: 'Nitrates', value: s.NO3_mg_L, limit: 50, unit: 'mg/L', ok: s.NO3_mg_L <= 50 });
  if (s.F_mg_L !== undefined) checks.push({ param: 'Fluor', value: s.F_mg_L, limit: 1.5, unit: 'mg/L', ok: s.F_mg_L <= 1.5 });
  if (s.Na_mg_L !== undefined) checks.push({ param: 'Sodium', value: s.Na_mg_L, limit: 200, unit: 'mg/L', ok: s.Na_mg_L <= 200 });
  return checks;
};

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'Eau de source': return 'bg-green-100 text-green-800 border-green-200';
    case 'Eau minérale naturelle': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Eau minérale naturelle gazeuse': return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getMineralRows = (source: SourceItem) => {
  return [
    { label: 'pH', value: source.pH, unit: '' },
    { label: 'Résidu sec', value: source.residu_sec_180_mg_L, unit: 'mg/L' },
    { label: 'Calcium (Ca)', value: source.Ca_mg_L, unit: 'mg/L' },
    { label: 'Magnésium (Mg)', value: source.Mg_mg_L, unit: 'mg/L' },
    { label: 'Sodium (Na)', value: source.Na_mg_L, unit: 'mg/L' },
    { label: 'Nitrates (NO₃)', value: source.NO3_mg_L, unit: 'mg/L' },
    { label: 'Bicarbonates (HCO₃)', value: source.HCO3_mg_L, unit: 'mg/L' },
    { label: 'Sulfates (SO₄)', value: source.SO4_mg_L, unit: 'mg/L' },
    { label: 'Chlorures (Cl)', value: source.Cl_mg_L, unit: 'mg/L' },
    { label: 'Potassium (K)', value: source.K_mg_L, unit: 'mg/L' },
    { label: 'Fluor (F)', value: source.F_mg_L, unit: 'mg/L' },
    { label: 'Silice (SiO₂)', value: source.SiO2_mg_L, unit: 'mg/L' },
  ].filter(row => row.value !== undefined && row.value !== null);
};

/** Check if a point [lng, lat] is inside a polygon defined by coordinates array */
export const isPointInZone = (
  lng: number, lat: number,
  coordinates: number[][][]
): boolean => {
  const poly = coordinates[0]; // outer ring
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};
