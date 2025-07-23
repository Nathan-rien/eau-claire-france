import { bottledWaters } from '@/data/bottleWaterData';
import { WaterCriteria, UserProfile, UserIntolerance, UserPreference } from '@/data/waterProfiles';

export interface WaterScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  badge: 'ideal' | 'good' | 'acceptable' | 'avoid';
  badgeText: string;
  badgeColor: string;
  reasons: string[];
  pedagogicalSummary: string;
  composition: {
    nitrates: number;
    sodium: number;
    calcium: number;
    magnesium: number;
    residusSec: number;
  };
  price: number;
  type: string;
  source: string;
}

export interface RecommendationFilters {
  profiles: UserProfile[];
  intolerances: UserIntolerance[];
  preferences: UserPreference[];
  waterType?: 'all' | 'plate' | 'gazeuse';
}

function generatePedagogicalSummary(water: typeof bottledWaters[0], filters: RecommendationFilters): string {
  const composition = water.composition;
  const profiles = filters.profiles.map(p => p.name.toLowerCase()).join(', ');
  const summary: string[] = [];

  // Analyze composition
  if (composition.sodium <= 20) summary.push("faible en sodium");
  else if (composition.sodium >= 50) summary.push("riche en sodium");

  if (composition.calcium >= 150) summary.push("riche en calcium");
  else if (composition.calcium <= 50) summary.push("pauvre en calcium");

  if (composition.magnesium >= 50) summary.push("riche en magnésium");
  else if (composition.magnesium <= 20) summary.push("pauvre en magnésium");

  if (composition.nitrates <= 5) summary.push("très pauvre en nitrates");
  else if (composition.nitrates <= 10) summary.push("faible en nitrates");

  if (composition.residusSec <= 500) summary.push("faiblement minéralisée");
  else if (composition.residusSec >= 1000) summary.push("fortement minéralisée");

  const summaryText = summary.length > 0 ? summary.join(', ') : "composition équilibrée";
  return `Eau ${summaryText}, adaptée ${profiles ? `aux profils : ${profiles}` : 'à vos besoins'}.`;
}

export function calculateWaterScore(
  water: typeof bottledWaters[0],
  filters: RecommendationFilters
): WaterScore {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const reasons: string[] = [];
  
  // Combine all criteria from profiles, intolerances, and preferences
  const allCriteria: WaterCriteria[] = [
    ...filters.profiles.map(p => p.criteria),
    ...filters.intolerances.map(i => i.criteria),
    ...filters.preferences.map(p => p.criteria)
  ];

  // Priority handling - critical profiles (nourrisson, grossesse) get higher weight
  const hasCriticalProfile = filters.profiles.some(p => 
    ['nourrisson', 'grossesse', 'hypertension', 'calculs-renaux'].includes(p.id)
  );

  // Special handling for diarrhea profile - strongly penalize high magnesium waters like Hépar
  const hasDiarrheaProfile = filters.profiles.some(p => p.id === 'diarrhee-colon');
  if (hasDiarrheaProfile && water.id === 'hepar') {
    // Automatically give very low score to Hépar for diarrhea profile
    return {
      id: water.id,
      name: water.name,
      score: 0,
      maxScore: 100,
      percentage: 0,
      badge: 'avoid',
      badgeText: 'À éviter absolument',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      reasons: ['Hépar est fortement déconseillée en cas de diarrhée ou côlon irritable en raison de sa très haute teneur en magnésium (119 mg/L) qui a un effet laxatif'],
      pedagogicalSummary: 'Eau très riche en magnésium, déconseillée pour les troubles digestifs.',
      composition: water.composition,
      price: water.price,
      type: water.type,
      source: water.source
    };
  }

  // Process each mineral
  ['nitrates', 'sodium', 'calcium', 'magnesium', 'residusSec'].forEach(mineral => {
    const mineralValue = water.composition[mineral as keyof typeof water.composition];
    
    allCriteria.forEach((criteria, index) => {
      const criteriaForMineral = criteria[mineral as keyof WaterCriteria];
      if (!criteriaForMineral) return;

      let { min, max, priority } = criteriaForMineral;
      
      // Boost priority for critical profiles
      if (hasCriticalProfile && index < filters.profiles.length) {
        const profile = filters.profiles[index];
        if (['nourrisson', 'grossesse', 'hypertension', 'calculs-renaux'].includes(profile.id)) {
          priority = priority * 1.5;
        }
      }

      maxPossibleScore += priority;

      let mineralScore = 0;
      let reason = '';

      if (min !== undefined && max !== undefined) {
        // Range criteria
        if (mineralValue >= min && mineralValue <= max) {
          mineralScore = priority;
          reason = `${mineral}: ${mineralValue} mg/L (optimal: ${min}-${max})`;
        } else if (mineralValue < min) {
          const ratio = mineralValue / min;
          mineralScore = priority * Math.max(0, ratio);
          reason = `${mineral}: ${mineralValue} mg/L (en dessous de ${min})`;
        } else {
          const ratio = max / mineralValue;
          mineralScore = priority * Math.max(0, ratio);
          reason = `${mineral}: ${mineralValue} mg/L (au dessus de ${max})`;
        }
      } else if (min !== undefined) {
        // Minimum criteria
        if (mineralValue >= min) {
          mineralScore = priority;
          reason = `${mineral}: ${mineralValue} mg/L (≥ ${min} ✓)`;
        } else {
          const ratio = mineralValue / min;
          mineralScore = priority * ratio;
          reason = `${mineral}: ${mineralValue} mg/L (insuffisant, besoin ≥ ${min})`;
        }
      } else if (max !== undefined) {
        // Maximum criteria
        if (mineralValue <= max) {
          mineralScore = priority;
          reason = `${mineral}: ${mineralValue} mg/L (≤ ${max} ✓)`;
        } else {
          const ratio = max / mineralValue;
          mineralScore = priority * Math.max(0, ratio);
          reason = `${mineral}: ${mineralValue} mg/L (trop élevé, max recommandé ${max})`;
        }
      }

      totalScore += mineralScore;
      if (reason) reasons.push(reason);
    });
  });

  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  
  // Determine badge
  let badge: WaterScore['badge'];
  let badgeText: string;
  let badgeColor: string;

  if (percentage >= 80) {
    badge = 'ideal';
    badgeText = 'Idéale pour vous';
    badgeColor = 'bg-green-100 text-green-800 border-green-200';
  } else if (percentage >= 60) {
    badge = 'good';
    badgeText = 'Bonne option';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (percentage >= 40) {
    badge = 'acceptable';
    badgeText = 'Option acceptable';
    badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    badge = 'avoid';
    badgeText = 'À éviter';
    badgeColor = 'bg-red-100 text-red-800 border-red-200';
  }

  return {
    id: water.id,
    name: water.name,
    score: Math.round(totalScore * 10) / 10,
    maxScore: Math.round(maxPossibleScore * 10) / 10,
    percentage: Math.round(percentage),
    badge,
    badgeText,
    badgeColor,
    reasons: reasons.slice(0, 4), // Increased to 4 reasons
    pedagogicalSummary: generatePedagogicalSummary(water, filters),
    composition: water.composition,
    price: water.price,
    type: water.type,
    source: water.source
  };
}

export function getWaterRecommendations(filters: RecommendationFilters): WaterScore[] {
  if (filters.profiles.length === 0 && filters.intolerances.length === 0 && filters.preferences.length === 0) {
    return [];
  }

  // Filter waters by type first
  let filteredWaters = bottledWaters;
  if (filters.waterType === 'plate') {
    filteredWaters = bottledWaters.filter(water => 
      !water.type.toLowerCase().includes('gazeuse')
    );
  } else if (filters.waterType === 'gazeuse') {
    filteredWaters = bottledWaters.filter(water => 
      water.type.toLowerCase().includes('gazeuse')
    );
  }

  const scores = filteredWaters.map(water => calculateWaterScore(water, filters));
  
  // Sort by percentage score (descending)
  return scores.sort((a, b) => b.percentage - a.percentage);
}

export function getMineralColor(mineral: string, value: number): string {
  const ranges = {
    nitrates: { low: 5, medium: 15 },
    sodium: { low: 20, medium: 100 },
    calcium: { low: 50, medium: 150 },
    magnesium: { low: 20, medium: 50 },
    residusSec: { low: 500, medium: 1500 }
  };

  const range = ranges[mineral as keyof typeof ranges];
  if (!range) return 'text-gray-600';

  if (value <= range.low) return 'text-green-600';
  if (value <= range.medium) return 'text-yellow-600';
  return 'text-orange-600';
}