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

  // Process each mineral
  ['nitrates', 'sodium', 'calcium', 'magnesium', 'residusSec'].forEach(mineral => {
    const mineralValue = water.composition[mineral as keyof typeof water.composition];
    
    allCriteria.forEach(criteria => {
      const criteriaForMineral = criteria[mineral as keyof WaterCriteria];
      if (!criteriaForMineral) return;

      const { min, max, priority } = criteriaForMineral;
      maxPossibleScore += priority;

      let mineralScore = 0;
      let reason = '';

      if (min !== undefined && max !== undefined) {
        // Range criteria
        if (mineralValue >= min && mineralValue <= max) {
          mineralScore = priority;
          reason = `${mineral}: ${mineralValue} (optimal: ${min}-${max})`;
        } else if (mineralValue < min) {
          const ratio = mineralValue / min;
          mineralScore = priority * Math.max(0, ratio);
          reason = `${mineral}: ${mineralValue} (en dessous de ${min})`;
        } else {
          const ratio = max / mineralValue;
          mineralScore = priority * Math.max(0, ratio);
          reason = `${mineral}: ${mineralValue} (au dessus de ${max})`;
        }
      } else if (min !== undefined) {
        // Minimum criteria
        if (mineralValue >= min) {
          mineralScore = priority;
          reason = `${mineral}: ${mineralValue} (≥ ${min} ✓)`;
        } else {
          const ratio = mineralValue / min;
          mineralScore = priority * ratio;
          reason = `${mineral}: ${mineralValue} (< ${min})`;
        }
      } else if (max !== undefined) {
        // Maximum criteria
        if (mineralValue <= max) {
          mineralScore = priority;
          reason = `${mineral}: ${mineralValue} (≤ ${max} ✓)`;
        } else {
          const ratio = max / mineralValue;
          mineralScore = priority * Math.max(0, ratio);
          reason = `${mineral}: ${mineralValue} (> ${max})`;
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
    badgeText = 'Idéal pour vous';
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
    reasons: reasons.slice(0, 3), // Limit to top 3 reasons
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

  const scores = bottledWaters.map(water => calculateWaterScore(water, filters));
  
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