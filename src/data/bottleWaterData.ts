
export const bottledWaters = [
  {
    id: 'cristaline',
    name: 'Cristaline',
    type: 'Eau de source',
    source: 'Multiples sources',
    price: 0.20,
    co2: 0.25,
    composition: {
      nitrates: 2.6,
      sodium: 5.5,
      calcium: 58.0,
      magnesium: 8.0,
      residusSec: 331
    },
    producer: 'Sources Alma',
    packaging: 'Plastique',
    volumeAnnuel: 2500000000
  },
  {
    id: 'evian',
    name: 'Evian',
    type: 'Eau minérale naturelle',
    source: 'Source Cachat',
    price: 0.45,
    co2: 0.35,
    composition: {
      nitrates: 3.8,
      sodium: 6.5,
      calcium: 80.0,
      magnesium: 26.0,
      residusSec: 345
    },
    producer: 'Danone',
    packaging: 'Plastique',
    volumeAnnuel: 1600000000
  },
  {
    id: 'vittel',
    name: 'Vittel',
    type: 'Eau minérale naturelle',
    source: 'Vosges',
    price: 0.46,
    co2: 0.32,
    composition: {
      nitrates: 4.9,
      sodium: 5.2,
      calcium: 94.0,
      magnesium: 20.0,
      residusSec: 305
    },
    producer: 'Nestlé Waters',
    packaging: 'Plastique',
    volumeAnnuel: 900000000
  },
  {
    id: 'volvic',
    name: 'Volvic',
    type: 'Eau minérale naturelle',
    source: 'Volcan d\'Auvergne',
    price: 0.43,
    co2: 0.3,
    composition: {
      nitrates: 6.9,
      sodium: 11.6,
      calcium: 12.0,
      magnesium: 8.0,
      residusSec: 130
    },
    producer: 'Danone',
    packaging: 'Plastique',
    volumeAnnuel: 1000000000
  },
  {
    id: 'contrex',
    name: 'Contrex',
    type: 'Eau minérale naturelle',
    source: 'Contrexéville (Vosges)',
    price: 0.75,
    co2: 0.38,
    composition: {
      nitrates: 0.7,
      sodium: 9.4,
      calcium: 468.0,
      magnesium: 74.5,
      residusSec: 2078
    },
    producer: 'Nestlé Waters',
    packaging: 'Plastique',
    volumeAnnuel: 500000000
  },
  {
    id: 'hepar',
    name: 'Hépar',
    type: 'Eau minérale naturelle',
    source: 'Vittel (Vosges)',
    price: 0.7,
    co2: 0.4,
    composition: {
      nitrates: 2.6,
      sodium: 10.0,
      calcium: 549.0,
      magnesium: 119.0,
      residusSec: 2510
    },
    producer: 'Nestlé Waters',
    packaging: 'Plastique',
    volumeAnnuel: 400000000
  },
  {
    id: 'st-yorre',
    name: 'St-Yorre',
    type: 'Eau minérale naturelle gazeuse',
    source: 'Saint-Yorre (Allier)',
    price: 0.55,
    co2: 0.33,
    composition: {
      nitrates: 0.3,
      sodium: 1700.0,
      calcium: 160.0,
      magnesium: 80.0,
      residusSec: 4774
    },
    producer: 'Neptune',
    packaging: 'Plastique',
    volumeAnnuel: 300000000
  },
  {
    id: 'quezac',
    name: 'Quézac',
    type: 'Eau minérale naturelle gazeuse',
    source: 'Quézac (Lozère)',
    price: 0.6,
    co2: 0.35,
    composition: {
      nitrates: 0.2,
      sodium: 100.0,
      calcium: 90.0,
      magnesium: 15.0,
      residusSec: 1100
    },
    producer: 'Ogeu',
    packaging: 'Verre / Plastique',
    volumeAnnuel: 150000000
  },
  {
    id: 'la-salvetat',
    name: 'La Salvetat',
    type: 'Eau minérale naturelle gazeuse',
    source: 'La Salvetat-sur-Agout (Hérault)',
    price: 0.5,
    co2: 0.28,
    composition: {
      nitrates: 0.6,
      sodium: 10.0,
      calcium: 50.0,
      magnesium: 10.0,
      residusSec: 400
    },
    producer: 'Nestlé Waters',
    packaging: 'Plastique',
    volumeAnnuel: 250000000
  },
  {
    id: 'mont-roucous',
    name: 'Mont Roucous',
    type: 'Eau minérale naturelle',
    source: 'Lacaune (Tarn)',
    price: 0.5,
    co2: 0.26,
    composition: {
      nitrates: 1.2,
      sodium: 3.1,
      calcium: 2.5,
      magnesium: 0.9,
      residusSec: 22
    },
    producer: 'Sources Mont Roucous',
    packaging: 'Plastique',
    volumeAnnuel: 100000000
  },
  {
    id: 'thonon',
    name: 'Thonon',
    type: 'Eau minérale naturelle',
    source: 'Thonon-les-Bains (Haute-Savoie)',
    price: 0.45,
    co2: 0.27,
    composition: {
      nitrates: 2.1,
      sodium: 5.0,
      calcium: 60.0,
      magnesium: 5.0,
      residusSec: 300
    },
    producer: 'Neptune',
    packaging: 'Plastique',
    volumeAnnuel: 150000000
  },
  {
    id: 'saint-amand',
    name: 'Saint-Amand',
    type: 'Eau minérale naturelle',
    source: 'Saint-Amand-les-Eaux (Nord)',
    price: 0.4,
    co2: 0.24,
    composition: {
      nitrates: 1.5,
      sodium: 10.0,
      calcium: 85.0,
      magnesium: 8.0,
      residusSec: 430
    },
    producer: 'Spadel',
    packaging: 'Plastique',
    volumeAnnuel: 300000000
  }
];

export const tapWater = {
  name: 'Eau du robinet (Paris)',
  price: 0.004,
  co2: 0.001,
  composition: {
    nitrates: 12,
    sodium: 15,
    calcium: 90,
    magnesium: 8,
    residusSec: 280
  }
};

export type WaterData = typeof bottledWaters[0];
export type TapWaterData = typeof tapWater;
