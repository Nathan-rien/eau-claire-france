
import { BottleWaterData } from '@/data/bottleComparisonData';
import { WaterData } from '@/data/bottleWaterData';

export const convertBottleWaterDataToWaterData = (bottle: BottleWaterData): WaterData => {
  return {
    id: bottle.id.toString(),
    name: bottle.nom_bouteille,
    type: bottle.type_eau,
    source: bottle.source || 'Non spécifiée',
    price: bottle.prix_moyen_litre,
    co2: bottle.impact_carbone_gCO2L ? bottle.impact_carbone_gCO2L / 1000 : 0, // Convert g to kg
    composition: {
      nitrates: bottle.nitrates_mgL,
      sodium: bottle.sodium_mgL,
      calcium: bottle.calcium_mgL,
      magnesium: bottle.magnesium_mgL,
      residusSec: bottle.residu_sec_mgL
    },
    producer: bottle.marque,
    packaging: bottle.emballage,
    volumeAnnuel: 0 // BottleWaterData doesn't have volume info, so default to 0
  };
};

export const convertWaterDataToBottleWaterData = (favorite: WaterData): BottleWaterData => {
  // Safety check for composition property
  const composition = favorite.composition || {
    nitrates: 0,
    sodium: 0,
    calcium: 0,
    magnesium: 0,
    residusSec: 0
  };

  return {
    id: parseInt(favorite.id),
    marque: favorite.producer || 'Non spécifié',
    nom_bouteille: favorite.name,
    type_eau: favorite.type,
    source: favorite.source,
    format: '1L',
    prix_moyen_litre: favorite.price || 0,
    nitrates_mgL: composition.nitrates,
    sodium_mgL: composition.sodium,
    calcium_mgL: composition.calcium,
    magnesium_mgL: composition.magnesium,
    residu_sec_mgL: composition.residusSec,
    pH: 7,
    emballage: favorite.packaging || 'Non spécifié',
    recyclable: 'Oui',
    consigne: 'Non',
    impact_carbone_gCO2L: (favorite.co2 || 0) * 1000, // Convert kg to g
    ecoscore: 'C'
  };
};
