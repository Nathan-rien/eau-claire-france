/**
 * Bottle water data types - separated from data to avoid pulling 50KB+ data
 * into chunks that only need type definitions.
 */

export interface BottleWaterData {
  id: number;
  marque: string;
  nom_bouteille: string;
  type_eau: string;
  format: string;
  source: string;
  prix_moyen_litre: number;
  nitrates_mgL: number | null;
  residu_sec_mgL: number | null;
  calcium_mgL: number | null;
  magnesium_mgL: number | null;
  sodium_mgL: number | null;
  fluor_mgL?: number | null;
  pH: number | null;
  emballage: string;
  recyclable: string;
  consigne: string;
  impact_carbone_gCO2L: number;
  ecoscore: string;
  url_fiche?: string;

  /** Eau gazeuse (dérivé de type_eau, contient "gazeuse"). */
  gazeuse?: boolean;
  /**
   * Mention réglementaire officielle « convient à l'alimentation des nourrissons ».
   * DONNÉE RÉGLEMENTAIRE : à revérifier sur l'étiquette réelle de chaque eau avant
   * publication. Ne pas déduire d'un score calculé.
   */
  mention_nourrissons?: boolean;
  /** Marque multi-captages : composition variable selon la source embouteillée. */
  source_variable?: boolean;
}
