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
  nitrates_mgL: number;
  residu_sec_mgL: number;
  calcium_mgL: number;
  magnesium_mgL: number;
  sodium_mgL: number;
  pH: number;
  emballage: string;
  recyclable: string;
  consigne: string;
  impact_carbone_gCO2L: number;
  ecoscore: string;
  url_fiche?: string;
}
