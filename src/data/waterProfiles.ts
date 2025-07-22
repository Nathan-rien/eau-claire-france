// Configuration des profils et critères pour les recommandations d'eau
export interface WaterCriteria {
  nitrates?: { max?: number; min?: number; priority: number };
  sodium?: { max?: number; min?: number; priority: number };
  calcium?: { max?: number; min?: number; priority: number };
  magnesium?: { max?: number; min?: number; priority: number };
  residusSec?: { max?: number; min?: number; priority: number };
}

export interface UserProfile {
  id: string;
  name: string;
  description: string;
  criteria: WaterCriteria;
  color: string;
}

export interface UserIntolerance {
  id: string;
  name: string;
  description: string;
  criteria: WaterCriteria;
}

export interface UserPreference {
  id: string;
  name: string;
  description: string;
  criteria: WaterCriteria;
}

export const userProfiles: UserProfile[] = [
  {
    id: 'sportif-regulier',
    name: 'Sportif régulier',
    description: 'Activité sportive modérée régulière',
    criteria: {
      magnesium: { min: 20, priority: 3 },
      sodium: { min: 10, max: 50, priority: 2 }
    },
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'activite-intense',
    name: 'Activité intense / endurance',
    description: 'Sport de haut niveau, endurance',
    criteria: {
      sodium: { min: 50, priority: 3 },
      residusSec: { min: 1000, priority: 3 },
      magnesium: { min: 30, priority: 2 }
    },
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    id: 'hypertension',
    name: 'Hypertension',
    description: 'Contrôle de la tension artérielle',
    criteria: {
      sodium: { max: 20, priority: 5 },
      calcium: { min: 50, priority: 2 },
      magnesium: { min: 10, priority: 2 }
    },
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'grossesse',
    name: 'Grossesse',
    description: 'Besoins spécifiques pendant la grossesse',
    criteria: {
      nitrates: { max: 10, priority: 5 },
      calcium: { min: 80, priority: 4 },
      sodium: { max: 20, priority: 3 }
    },
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  {
    id: 'nourrisson',
    name: 'Nourrisson / bébé 0-6 mois',
    description: 'Eau adaptée aux tout-petits',
    criteria: {
      sodium: { max: 10, priority: 5 },
      nitrates: { max: 10, priority: 5 },
      residusSec: { max: 500, priority: 4 }
    },
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'constipation',
    name: 'Constipation',
    description: 'Amélioration du transit intestinal',
    criteria: {
      magnesium: { min: 50, priority: 4 },
      residusSec: { min: 1000, priority: 3 }
    },
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'diarrhee-colon',
    name: 'Diarrhée ou côlon irritable',
    description: 'Apaisement du système digestif',
    criteria: {
      magnesium: { max: 30, priority: 4 },
      residusSec: { max: 800, priority: 3 },
      sodium: { max: 20, priority: 2 }
    },
    color: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  {
    id: 'calculs-renaux',
    name: 'Calculs rénaux',
    description: 'Prévention des calculs rénaux',
    criteria: {
      calcium: { max: 100, priority: 4 },
      residusSec: { max: 800, priority: 3 },
      sodium: { max: 20, priority: 2 }
    },
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 'osteoporose',
    name: 'Ostéoporose / prévention osseuse',
    description: 'Renforcement osseux',
    criteria: {
      calcium: { min: 150, priority: 4 },
      magnesium: { min: 20, priority: 3 }
    },
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'fatigue-chronique',
    name: 'Fatigue chronique / stress',
    description: 'Apport en magnésium pour l\'énergie',
    criteria: {
      magnesium: { min: 30, priority: 4 },
      calcium: { min: 50, priority: 2 }
    },
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    id: 'regime-sans-sel',
    name: 'Régime sans sel',
    description: 'Restriction sodique stricte',
    criteria: {
      sodium: { max: 10, priority: 5 }
    },
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  {
    id: 'alimentation-alcaline',
    name: 'Alimentation alcaline',
    description: 'Équilibre acido-basique',
    criteria: {
      residusSec: { min: 800, priority: 3 },
      magnesium: { min: 20, priority: 2 }
    },
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    id: 'acidite-gastrique',
    name: 'Acidité gastrique',
    description: 'Neutralisation de l\'acidité',
    criteria: {
      magnesium: { min: 25, priority: 3 },
      calcium: { min: 80, priority: 2 }
    },
    color: 'bg-lime-100 text-lime-800 border-lime-200'
  },
  {
    id: 'menopause-seniors',
    name: 'Ménopause / seniors',
    description: 'Besoins spécifiques après 50 ans',
    criteria: {
      calcium: { min: 120, priority: 4 },
      magnesium: { min: 25, priority: 3 },
      sodium: { max: 30, priority: 2 }
    },
    color: 'bg-violet-100 text-violet-800 border-violet-200'
  },
  {
    id: 'gout-neutre',
    name: 'Goût neutre recherché',
    description: 'Eau peu minéralisée, goût discret',
    criteria: {
      residusSec: { max: 300, priority: 4 }
    },
    color: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  {
    id: 'eau-pure',
    name: 'Eau très pure',
    description: 'Minéralisation minimale',
    criteria: {
      residusSec: { max: 200, priority: 5 },
      sodium: { max: 5, priority: 3 }
    },
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    id: 'suivi-medical',
    name: 'Suivi médical',
    description: 'Besoins médicaux spécifiques',
    criteria: {
      sodium: { max: 15, priority: 3 },
      residusSec: { max: 600, priority: 2 }
    },
    color: 'bg-rose-100 text-rose-800 border-rose-200'
  }
];

export const userIntolerances: UserIntolerance[] = [
  {
    id: 'intolerance-sulfates',
    name: 'Sulfates',
    description: 'éviter si présent >50 mg/L',
    criteria: {
      // Note: sulfates pas disponible dans bottleWaterData, critère ignoré pour l'instant
    }
  },
  {
    id: 'intolerance-fluor',
    name: 'Fluor',
    description: 'éviter si présent >0,3 mg/L',
    criteria: {
      // Note: fluor pas disponible dans bottleWaterData, critère ignoré pour l'instant
    }
  },
  {
    id: 'intolerance-nitrates',
    name: 'Nitrates',
    description: 'éviter si présent >10 mg/L',
    criteria: {
      nitrates: { max: 10, priority: 5 }
    }
  },
  {
    id: 'intolerance-sodium',
    name: 'Sodium (sel)',
    description: 'éviter si présent >20 mg/L',
    criteria: {
      sodium: { max: 20, priority: 5 }
    }
  },
  {
    id: 'intolerance-calcium',
    name: 'Calcium',
    description: 'éviter si présent >100 mg/L',
    criteria: {
      calcium: { max: 100, priority: 4 }
    }
  },
  {
    id: 'intolerance-magnesium',
    name: 'Magnésium',
    description: 'éviter si présent >50 mg/L',
    criteria: {
      magnesium: { max: 50, priority: 4 }
    }
  },
  {
    id: 'intolerance-bicarbonates',
    name: 'Bicarbonates',
    description: 'éviter si présent >600 mg/L',
    criteria: {
      // Note: bicarbonates pas disponible dans bottleWaterData, critère ignoré pour l'instant
    }
  },
  {
    id: 'intolerance-ph-acide',
    name: 'pH acide (<7)',
    description: 'éviter si pH < 7',
    criteria: {
      // Note: pH pas disponible dans bottleWaterData, critère ignoré pour l'instant
    }
  },
  {
    id: 'intolerance-ph-basique',
    name: 'pH basique (>8,5)',
    description: 'éviter si pH > 8.5',
    criteria: {
      // Note: pH pas disponible dans bottleWaterData, critère ignoré pour l'instant
    }
  },
  {
    id: 'intolerance-mineralisation',
    name: 'Eau très minéralisée',
    description: 'éviter si résidu sec >1000 mg/L',
    criteria: {
      residusSec: { max: 1000, priority: 4 }
    }
  },
  {
    id: 'intolerance-ne-sais-pas',
    name: 'Ne sais pas',
    description: 'supprimer toutes les eaux à risques potentiels',
    criteria: {
      nitrates: { max: 10, priority: 5 },
      residusSec: { max: 500, priority: 4 },
      sodium: { max: 20, priority: 4 }
    }
  }
];

export const userPreferences: UserPreference[] = [
  {
    id: 'eau-legere',
    name: 'Eau légère',
    description: 'Faible minéralisation',
    criteria: {
      residusSec: { max: 500, priority: 3 }
    }
  },
  {
    id: 'eau-riche-calcium',
    name: 'Riche en calcium',
    description: 'Apport calcique élevé',
    criteria: {
      calcium: { min: 150, priority: 3 }
    }
  },
  {
    id: 'eau-riche-magnesium',
    name: 'Riche en magnésium',
    description: 'Apport en magnésium',
    criteria: {
      magnesium: { min: 50, priority: 3 }
    }
  },
  {
    id: 'eau-pauvre-sodium',
    name: 'Pauvre en sodium',
    description: 'Très faible teneur en sodium',
    criteria: {
      sodium: { max: 20, priority: 3 }
    }
  }
];