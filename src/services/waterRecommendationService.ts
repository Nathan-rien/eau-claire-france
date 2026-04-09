import { BottleWaterData, getUniqueBottles } from '@/data/bottleComparisonData';
import { UserProfile, UserIntolerance, UserPreference, WaterCriteria, DiagnosticContext, ageGenderModifiers } from '@/data/waterProfiles';

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
    selectedPreferences: UserPreference[],
    context?: DiagnosticContext
  ): WaterRecommendation[] {
    const combinedCriteria = this.combineCriteria(selectedProfiles, selectedIntolerances, selectedPreferences, context);
    
    const recommendations = this.bottles.map(bottle => {
      const { score, reasons, warnings } = this.evaluateBottle(bottle, combinedCriteria, selectedProfiles, selectedIntolerances, selectedPreferences, context);
      return { bottle, score, reasons, warnings };
    });

    return recommendations
      .filter(rec => rec.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }

  private combineCriteria(
    profiles: UserProfile[],
    intolerances: UserIntolerance[],
    preferences: UserPreference[],
    context?: DiagnosticContext
  ): WaterCriteria {
    const combined: WaterCriteria = {};

    profiles.forEach(profile => this.mergeCriteria(combined, profile.criteria));
    intolerances.forEach(intolerance => this.mergeCriteria(combined, intolerance.criteria, true));
    preferences.forEach(preference => this.mergeCriteria(combined, preference.criteria));

    // Apply age/gender modifiers
    if (context) {
      const ageKey = context.age || '';
      const genderAgeKey = context.gender && context.age ? `${context.gender}-${context.age}` : '';

      if (ageKey && ageGenderModifiers[ageKey]) {
        this.mergeCriteria(combined, ageGenderModifiers[ageKey] as WaterCriteria);
      }
      if (genderAgeKey && ageGenderModifiers[genderAgeKey]) {
        this.mergeCriteria(combined, ageGenderModifiers[genderAgeKey] as WaterCriteria);
      }
    }

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

      if (isIntolerance) {
        if (criteria.max !== undefined) {
          targetCriteria.max = Math.min(targetCriteria.max ?? criteria.max, criteria.max);
        }
        if (criteria.min !== undefined) {
          targetCriteria.min = Math.max(targetCriteria.min ?? criteria.min, criteria.min);
        }
        targetCriteria.priority = Math.max(targetCriteria.priority, criteria.priority);
      } else {
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
    preferences: UserPreference[],
    context?: DiagnosticContext
  ): { score: number; reasons: string[]; warnings: string[] } {
    let totalScore = 0;
    let weightSum = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];

    const mineralMap: Record<string, keyof BottleWaterData> = {
      nitrates: 'nitrates_mgL',
      sodium: 'sodium_mgL', 
      calcium: 'calcium_mgL',
      magnesium: 'magnesium_mgL',
      residusSec: 'residu_sec_mgL'
    };

    let baseScore = 70;

    Object.entries(criteria).forEach(([key, criterion]) => {
      if (!criterion) return;
      const bottleKey = mineralMap[key];
      if (!bottleKey) return;
      const value = bottle[bottleKey] as number;
      if (value === undefined || typeof value !== 'number') return;

      const { min, max, priority } = criterion;
      let mineralScore = 50;
      let reason = '';

      if (min !== undefined && max !== undefined) {
        if (value >= min && value <= max) {
          mineralScore = 100;
          reason = `Taux optimal de ${this.getMineralName(key)}`;
        } else if (value < min) {
          const deficit = Math.abs((min - value) / min);
          mineralScore = Math.max(20, 100 - deficit * 50);
          if (priority >= 3) reason = `Faible en ${this.getMineralName(key)}`;
        } else if (value > max) {
          const excess = (value - max) / max;
          mineralScore = Math.max(10, 100 - excess * 60);
          if (priority >= 4) warnings.push(`Taux de ${this.getMineralName(key)} élevé (${value} mg/L)`);
        }
      } else if (min !== undefined) {
        if (value >= min) {
          mineralScore = 90;
          reason = `Riche en ${this.getMineralName(key)}`;
        } else {
          const deficit = (min - value) / min;
          mineralScore = Math.max(30, 70 - deficit * 40);
          if (priority >= 3) reason = `Faible en ${this.getMineralName(key)}`;
        }
      } else if (max !== undefined) {
        if (value <= max) {
          mineralScore = 85;
          reason = `Faible en ${this.getMineralName(key)}`;
        } else {
          const excess = (value - max) / max;
          mineralScore = Math.max(15, 80 - excess * 50);
          if (priority >= 4) warnings.push(`Taux de ${this.getMineralName(key)} élevé (${value} mg/L)`);
        }
      }

      if (reason) reasons.push(reason);
      const weight = priority || 1;
      totalScore += mineralScore * weight;
      weightSum += weight;
    });

    let finalScore = baseScore;
    if (weightSum > 0) {
      const weightedScore = totalScore / weightSum;
      finalScore = (baseScore + weightedScore) / 2;
    }

    // Profile-specific bonuses
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
        case 'allaitement':
          if (bottle.calcium_mgL >= 100 && bottle.nitrates_mgL <= 10) {
            reasons.push('Adaptée à l\'allaitement');
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
        case 'diabete-type2':
          if (bottle.magnesium_mgL >= 30 && bottle.sodium_mgL <= 20) {
            reasons.push('Adaptée au diabète type 2');
            finalScore += 8;
          }
          break;
        case 'insuffisance-renale':
          if (bottle.sodium_mgL <= 10 && bottle.residu_sec_mgL <= 500) {
            reasons.push('Compatible insuffisance rénale');
            finalScore += 10;
          }
          break;
        case 'regime-cetogene':
          if (bottle.sodium_mgL >= 30 && bottle.magnesium_mgL >= 30) {
            reasons.push('Compense les pertes électrolytiques (keto)');
            finalScore += 8;
          }
          break;
        case 'crampes-musculaires':
          if (bottle.magnesium_mgL >= 40) {
            reasons.push('Riche en magnésium anti-crampes');
            finalScore += 8;
          }
          break;
        case 'detox-drainage':
          if (bottle.residu_sec_mgL <= 300) {
            reasons.push('Eau légère idéale pour le drainage');
            finalScore += 8;
          }
          break;
        case 'retention-eau':
          if (bottle.sodium_mgL <= 10) {
            reasons.push('Très pauvre en sodium, anti-rétention');
            finalScore += 8;
          }
          break;
      }
    });

    // Intolerance violations
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

    // Eco-responsable preference
    const hasEcoPref = preferences.some(p => p.id === 'eco-responsable');
    if (bottle.ecoscore === 'A') {
      finalScore += hasEcoPref ? 12 : 8;
      reasons.push(hasEcoPref ? '🌿 Excellent éco-score (A)' : 'Excellent éco-score');
    } else if (bottle.ecoscore === 'B') {
      finalScore += hasEcoPref ? 8 : 5;
      reasons.push(hasEcoPref ? '🌿 Bon éco-score (B)' : 'Bon éco-score');
    }

    // Budget preference
    const hasBudgetPref = preferences.some(p => p.id === 'budget-serre');
    if (hasBudgetPref && bottle.prix_moyen_litre !== undefined && bottle.prix_moyen_litre <= 0.30) {
      finalScore += 10;
      reasons.push(`💰 Petit prix (${bottle.prix_moyen_litre.toFixed(2)} €/L)`);
    }

    // Water type bonus
    if (bottle.type_eau === 'Eau de source' || bottle.type_eau === 'Eau minérale naturelle') {
      finalScore += 2;
    }

    // Context-based adjustments
    if (context) {
      // High consumption + highly mineralized → warning
      if (context.dailyConsumption === '3L+' && bottle.residu_sec_mgL > 1000) {
        warnings.push('⚠️ Eau très minéralisée pour une consommation > 3L/jour');
        finalScore -= 5;
      }

      // Contextual reasons
      if (context.dailyConsumption === '3L+' && bottle.residu_sec_mgL <= 500) {
        reasons.push('Adaptée à une forte consommation quotidienne');
      }

      // Gender + age contextual info
      if (context.gender === 'femme' && context.age === 'senior' && bottle.calcium_mgL >= 150) {
        reasons.push('Riche en calcium (important pour les femmes 50+)');
        finalScore += 5;
      }
    }

    return {
      score: Math.min(100, Math.max(15, Math.round(finalScore))),
      reasons: reasons.slice(0, 5),
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
