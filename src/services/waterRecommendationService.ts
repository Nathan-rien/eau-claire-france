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
      .filter(rec => rec.score > 30) // Only show bottles with decent scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 recommendations
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
    let score = 100;
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

    // Evaluate each mineral criterion
    Object.entries(criteria).forEach(([key, criterion]) => {
      if (!criterion) return;

      const bottleKey = mineralMap[key];
      if (!bottleKey) return;
      
      const value = bottle[bottleKey] as number;
      if (value === undefined || typeof value !== 'number') return;

      const { min, max, priority } = criterion;
      let mineralScore = 100;
      let reason = '';

      if (max !== undefined && value > max) {
        const excess = ((value - max) / max) * 100;
        mineralScore = Math.max(0, 100 - excess * priority);
        
        if (priority >= 4) {
          warnings.push(`Taux de ${this.getMineralName(key)} élevé (${value} mg/L)`);
        }
      }

      if (min !== undefined && value < min) {
        const deficit = ((min - value) / min) * 100;
        mineralScore = Math.max(0, 100 - deficit * priority);
        
        if (priority >= 3) {
          reason = `Faible en ${this.getMineralName(key)}`;
        }
      }

      if (min !== undefined && max !== undefined && value >= min && value <= max) {
        reason = `Taux optimal de ${this.getMineralName(key)}`;
      } else if (min !== undefined && value >= min) {
        reason = `Riche en ${this.getMineralName(key)}`;
      } else if (max !== undefined && value <= max) {
        reason = `Pauvre en ${this.getMineralName(key)}`;
      }

      if (reason) {
        reasons.push(reason);
      }

      score = Math.min(score, mineralScore);
    });

    // Add specific reasons based on profiles
    profiles.forEach(profile => {
      switch (profile.id) {
        case 'nourrisson':
          if (bottle.sodium_mgL <= 10 && bottle.nitrates_mgL <= 10) {
            reasons.push('Adaptée aux nourrissons');
          }
          break;
        case 'grossesse':
          if (bottle.nitrates_mgL <= 10 && bottle.calcium_mgL >= 80) {
            reasons.push('Sûre pendant la grossesse');
          }
          break;
        case 'hypertension':
          if (bottle.sodium_mgL <= 20) {
            reasons.push('Faible teneur en sodium');
          }
          break;
        case 'sportif-regulier':
        case 'activite-intense':
          if (bottle.magnesium_mgL >= 20) {
            reasons.push('Bonne récupération sportive');
          }
          break;
      }
    });

    // Check for serious intolerance violations
    intolerances.forEach(intolerance => {
      if (intolerance.id === 'intolerance-nitrates' && bottle.nitrates_mgL > 10) {
        warnings.push('⚠️ Attention : Taux de nitrates élevé');
        score *= 0.5;
      }
      if (intolerance.id === 'intolerance-sodium' && bottle.sodium_mgL > 20) {
        warnings.push('⚠️ Attention : Taux de sodium élevé');
        score *= 0.5;
      }
    });

    // Bonus for ecological considerations
    if (bottle.ecoscore === 'A' || bottle.ecoscore === 'B') {
      score += 5;
      reasons.push('Bon éco-score');
    }

    return {
      score: Math.round(score),
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