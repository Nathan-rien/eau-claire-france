import { BottleWaterData, getUniqueBottles } from '@/data/bottleComparisonData';
import { UserProfile, UserIntolerance, UserPreference, WaterCriteria } from '@/data/waterProfiles';

export interface WaterRecommendation {
  bottle: BottleWaterData;
  score: number;
  reasons: string[];
  warnings: string[];
}

export class WaterRecommendationService {
  private bottles: BottleWaterData[] = getUniqueBottles();

  calculateRecommendations(
    selectedProfiles: UserProfile[],
    selectedIntolerances: UserIntolerance[],
    selectedPreferences: UserPreference[]
  ): WaterRecommendation[] {
    const combinedCriteria = this.combineCriteria(selectedProfiles, selectedIntolerances, selectedPreferences);
    
    const recommendations = this.bottles.map(bottle => {
      const { score, reasons, warnings } = this.evaluateBottle(bottle, combinedCriteria, selectedProfiles, selectedIntolerances, selectedPreferences);
      return {
        bottle,
        score,
        reasons,
        warnings
      };
    });

    return recommendations
      .filter(rec => rec.score > 10) // Plus permissif pour avoir plus de résultats
      .sort((a, b) => b.score - a.score)
      .slice(0, 15); // Plus de recommandations
  }

  private combineCriteria(
    profiles: UserProfile[],
    intolerances: UserIntolerance[],
    preferences: UserPreference[]
  ): WaterCriteria {
    const combined: WaterCriteria = {};

    // Process profiles
    profiles.forEach(profile => {
      this.mergeCriteria(combined, profile.criteria);
    });

    // Process intolerances (override with strict limits)
    intolerances.forEach(intolerance => {
      this.mergeCriteria(combined, intolerance.criteria, true);
    });

    // Process preferences
    preferences.forEach(preference => {
      this.mergeCriteria(combined, preference.criteria);
    });

    return combined;
  }

  private mergeCriteria(target: WaterCriteria, source: WaterCriteria, isIntolerance = false) {
    Object.entries(source).forEach(([key, criteria]) => {
      if (!criteria) return;
      
      const targetKey = key as keyof WaterCriteria;
      if (!target[targetKey]) {
        target[targetKey] = { priority: 0 };
      }

      const targetCriteria = target[targetKey]!;

      // For intolerances, override with strict limits
      if (isIntolerance) {
        if (criteria.max !== undefined) {
          targetCriteria.max = Math.min(targetCriteria.max ?? criteria.max, criteria.max);
        }
        if (criteria.min !== undefined) {
          targetCriteria.min = Math.max(targetCriteria.min ?? criteria.min, criteria.min);
        }
        targetCriteria.priority = Math.max(targetCriteria.priority, criteria.priority);
      } else {
        // For profiles and preferences, use weighted average
        if (criteria.max !== undefined) {
          if (targetCriteria.max === undefined) {
            targetCriteria.max = criteria.max;
          } else {
            targetCriteria.max = (targetCriteria.max + criteria.max) / 2;
          }
        }
        if (criteria.min !== undefined) {
          if (targetCriteria.min === undefined) {
            targetCriteria.min = criteria.min;
          } else {
            targetCriteria.min = (targetCriteria.min + criteria.min) / 2;
          }
        }
        targetCriteria.priority = Math.max(targetCriteria.priority, criteria.priority);
      }
    });
  }

  private evaluateBottle(
    bottle: BottleWaterData,
    criteria: WaterCriteria,
    profiles: UserProfile[],
    intolerances: UserIntolerance[],
    preferences: UserPreference[]
  ): { score: number; reasons: string[]; warnings: string[] } {
    let totalScore = 0;
    let weightSum = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];

    // Map criteria keys to actual bottle property names
    const mineralMap: Record<string, keyof BottleWaterData> = {
      nitrates: 'nitrates_mgL',
      sodium: 'sodium_mgL', 
      calcium: 'calcium_mgL',
      magnesium: 'magnesium_mgL',
      residusSec: 'residu_sec_mgL'
    };

    // Score de base pour toutes les bouteilles
    let baseScore = 70;

    // Evaluate each mineral criterion
    Object.entries(criteria).forEach(([key, criterion]) => {
      if (!criterion) return;

      const bottleKey = mineralMap[key];
      if (!bottleKey) return;
      
      const value = bottle[bottleKey] as number;
      if (value === undefined || typeof value !== 'number') return;

      const { min, max, priority } = criterion;
      let mineralScore = 50; // Score neutre par défaut
      let reason = '';

      // Calcul du score pour ce minéral
      if (min !== undefined && max !== undefined) {
        if (value >= min && value <= max) {
          mineralScore = 100;
          reason = `Taux optimal de ${this.getMineralName(key)}`;
        } else if (value < min) {
          const deficit = Math.abs((min - value) / min);
          mineralScore = Math.max(20, 100 - deficit * 50);
          if (priority >= 3) {
            reason = `Faible en ${this.getMineralName(key)}`;
          }
        } else if (value > max) {
          const excess = (value - max) / max;
          mineralScore = Math.max(10, 100 - excess * 60);
          if (priority >= 4) {
            warnings.push(`Taux de ${this.getMineralName(key)} élevé (${value} mg/L)`);
          }
        }
      } else if (min !== undefined) {
        if (value >= min) {
          mineralScore = 90;
          reason = `Riche en ${this.getMineralName(key)}`;
        } else {
          const deficit = (min - value) / min;
          mineralScore = Math.max(30, 70 - deficit * 40);
          if (priority >= 3) {
            reason = `Faible en ${this.getMineralName(key)}`;
          }
        }
      } else if (max !== undefined) {
        if (value <= max) {
          mineralScore = 85;
          reason = `Faible en ${this.getMineralName(key)}`;
        } else {
          const excess = (value - max) / max;
          mineralScore = Math.max(15, 80 - excess * 50);
          if (priority >= 4) {
            warnings.push(`Taux de ${this.getMineralName(key)} élevé (${value} mg/L)`);
          }
        }
      }

      if (reason) {
        reasons.push(reason);
      }

      // Pondération du score selon la priorité
      const weight = priority || 1;
      totalScore += mineralScore * weight;
      weightSum += weight;
    });

    // Calcul du score final
    let finalScore = baseScore;
    if (weightSum > 0) {
      const weightedScore = totalScore / weightSum;
      finalScore = (baseScore + weightedScore) / 2;
    }

    // Add specific reasons based on profiles
    profiles.forEach(profile => {
      switch (profile.id) {
        case 'nourrisson':
          if (bottle.sodium_mgL <= 10 && bottle.nitrates_mgL <= 10) {
            reasons.push('Adaptée aux nourrissons');
            finalScore += 10;
          }
          break;
        case 'grossesse':
          if (bottle.nitrates_mgL <= 10 && bottle.calcium_mgL >= 80) {
            reasons.push('Sûre pendant la grossesse');
            finalScore += 8;
          }
          break;
        case 'hypertension':
          if (bottle.sodium_mgL <= 20) {
            reasons.push('Faible teneur en sodium');
            finalScore += 8;
          }
          break;
        case 'sportif-regulier':
          if (bottle.magnesium_mgL >= 20) {
            reasons.push('Bonne récupération sportive');
            finalScore += 8;
          }
          break;
        case 'activite-intense':
          if (bottle.magnesium_mgL >= 30 && bottle.sodium_mgL >= 30) {
            reasons.push('Excellente pour le sport intense');
            finalScore += 12;
          }
          break;
      }
    });

    // Check for serious intolerance violations
    intolerances.forEach(intolerance => {
      if (intolerance.id === 'intolerance-nitrates' && bottle.nitrates_mgL > 10) {
        warnings.push('⚠️ Attention : Taux de nitrates élevé');
        finalScore *= 0.6;
      }
      if (intolerance.id === 'intolerance-sodium' && bottle.sodium_mgL > 20) {
        warnings.push('⚠️ Attention : Taux de sodium élevé');
        finalScore *= 0.6;
      }
    });

    // Bonus for ecological considerations
    if (bottle.ecoscore === 'A') {
      finalScore += 8;
      reasons.push('Excellent éco-score');
    } else if (bottle.ecoscore === 'B') {
      finalScore += 5;
      reasons.push('Bon éco-score');
    }

    // Bonus pour les eaux plates si le filtre est appliqué
    if (bottle.type_eau === 'Eau de source' || bottle.type_eau === 'Eau minérale naturelle') {
      finalScore += 2;
    }

    return {
      score: Math.min(100, Math.max(15, Math.round(finalScore))), // Entre 15 et 100
      reasons: reasons.slice(0, 4), // Limit to 4 main reasons
      warnings
    };
  }

  private getMineralName(key: string): string {
    const names: Record<string, string> = {
      nitrates: 'nitrates',
      sodium: 'sodium',
      calcium: 'calcium',
      magnesium: 'magnésium',
      residusSec: 'résidu sec'
    };
    return names[key] || key;
  }
}

export const waterRecommendationService = new WaterRecommendationService();