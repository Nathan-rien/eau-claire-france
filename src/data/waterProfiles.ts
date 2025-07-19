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
    id: 'sportif',
    name: 'Sportif',
    description: 'Besoin de récupération après l\'effort',
    criteria: {
      magnesium: { min: 15, priority: 3 },
      sodium: { min: 10, priority: 2 },
      calcium: { min: 50, priority: 2 }
    },
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'femme-enceinte',
    name: 'Femme enceinte',
    description: 'Besoins spécifiques pendant la grossesse',
    criteria: {
      nitrates: { max: 10, priority: 5 },
      calcium: { min: 80, priority: 3 },
      sodium: { max: 20, priority: 2 }
    },
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  {
    id: 'nourrisson',
    name: 'Nourrisson',
    description: 'Eau adaptée aux bébés',
    criteria: {
      sodium: { max: 10, priority: 5 },
      nitrates: { max: 10, priority: 5 },
      residusSec: { max: 500, priority: 3 }
    },
    color: 'bg-blue-100 text-blue-800 border-blue-200'
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
    name: 'Ostéoporose',
    description: 'Prévention et soutien osseux',
    criteria: {
      calcium: { min: 150, priority: 4 },
      magnesium: { min: 20, priority: 2 }
    },
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'problemes-digestifs',
    name: 'Problèmes digestifs',
    description: 'Amélioration du transit',
    criteria: {
      magnesium: { min: 50, priority: 4 },
      residusSec: { min: 1000, priority: 2 }
    },
    color: 'bg-purple-100 text-purple-800 border-purple-200'
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
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    id: 'fatigue-chronique',
    name: 'Fatigue chronique',
    description: 'Apport en magnésium',
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
  }
];

export const userIntolerances: UserIntolerance[] = [
  {
    id: 'intolerance-sodium',
    name: 'Intolérance au sodium',
    description: 'Éviter les eaux riches en sodium',
    criteria: {
      sodium: { max: 15, priority: 5 }
    }
  },
  {
    id: 'intolerance-calcium',
    name: 'Intolérance au calcium',
    description: 'Éviter les eaux très calciques',
    criteria: {
      calcium: { max: 100, priority: 4 }
    }
  },
  {
    id: 'intolerance-magnesium',
    name: 'Intolérance au magnésium',
    description: 'Éviter les eaux très magnésiennes',
    criteria: {
      magnesium: { max: 50, priority: 4 }
    }
  },
  {
    id: 'intolerance-nitrates',
    name: 'Sensibilité aux nitrates',
    description: 'Privilégier les eaux pauvres en nitrates',
    criteria: {
      nitrates: { max: 5, priority: 5 }
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