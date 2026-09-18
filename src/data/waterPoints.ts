// Domain model for the "Zone d'Eau" community water points map.
// Kept separate from the price/quality comparator data on purpose.

import { supabase } from '@/integrations/supabase/client';

export const WATER_POINT_PHOTO_BUCKET = 'water-points-photos';

export type WaterPointType =
  | 'fontaine_publique'
  | 'source'
  | 'point_recharge'
  | 'autre';

export type WaterPointPotabilite =
  | 'non_verifie'
  | 'declare_potable'
  | 'declare_non_potable';

export type WaterPointSourceDonnee = 'citoyen' | 'import_osm' | 'officiel';

export type WaterPointModeration = 'en_attente' | 'valide' | 'rejete';

export type WaterPointReportType =
  | 'hors_service'
  | 'information_incorrecte'
  | 'autre';

export interface WaterPoint {
  id: string;
  type: WaterPointType;
  latitude: number;
  longitude: number;
  description: string | null;
  photo_url: string | null;
  accessibilite: string | null;
  statut_potabilite: WaterPointPotabilite;
  source_donnee: WaterPointSourceDonnee;
  statut_moderation: WaterPointModeration;
  soumis_par: string | null;
  created_at: string;
  updated_at: string;
  derniere_verification_at: string | null;
}

export const WATER_POINT_TYPE_META: Record<
  WaterPointType,
  { label: string; short: string; color: string; bg: string }
> = {
  fontaine_publique: {
    label: 'Fontaine publique',
    short: 'Fontaine',
    color: '#3b82f6',
    bg: '#dbeafe',
  },
  source: {
    label: 'Source naturelle',
    short: 'Source',
    color: '#22c55e',
    bg: '#dcfce7',
  },
  point_recharge: {
    label: 'Point de recharge (type Refill)',
    short: 'Recharge',
    color: '#0ea5e9',
    bg: '#e0f2fe',
  },
  autre: {
    label: 'Autre point d\u2019eau',
    short: 'Autre',
    color: '#64748b',
    bg: '#f1f5f9',
  },
};

export const WATER_POINT_TYPES = Object.keys(
  WATER_POINT_TYPE_META
) as WaterPointType[];

export const POTABILITE_META: Record<
  WaterPointPotabilite,
  { label: string; badgeClass: string }
> = {
  non_verifie: {
    label: 'Potabilité non vérifiée',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  declare_potable: {
    label: 'Déclarée potable par le contributeur',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  declare_non_potable: {
    label: 'Déclarée non potable',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
};

export const MODERATION_META: Record<
  WaterPointModeration,
  { label: string; badgeClass: string }
> = {
  en_attente: {
    label: 'En attente',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  valide: {
    label: 'Validé',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  rejete: {
    label: 'Rejeté',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
};

export const REPORT_TYPE_LABEL: Record<WaterPointReportType, string> = {
  hors_service: 'Hors service',
  information_incorrecte: 'Information incorrecte',
  autre: 'Autre',
};

export const SOURCE_DONNEE_LABEL: Record<WaterPointSourceDonnee, string> = {
  citoyen: 'Contribution citoyenne',
  import_osm: 'Import OpenStreetMap',
  officiel: 'Source officielle',
};

/**
 * The photo bucket is private: build a short-lived signed URL for display.
 * Returns null when the path is empty or signing fails.
 */
export const getWaterPointPhotoUrl = async (
  path: string | null
): Promise<string | null> => {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(WATER_POINT_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) {
    console.error('Water point photo signing error:', error);
    return null;
  }
  return data?.signedUrl ?? null;
};

/** Signs every photo of a list of points in one pass. */
export const signWaterPointPhotos = async (
  points: WaterPoint[]
): Promise<Record<string, string>> => {
  const withPhoto = points.filter((p) => !!p.photo_url);
  const entries = await Promise.all(
    withPhoto.map(async (p) => {
      const url = await getWaterPointPhotoUrl(p.photo_url);
      return [p.id, url] as const;
    })
  );
  return Object.fromEntries(
    entries.filter((e): e is readonly [string, string] => !!e[1])
  );
};
