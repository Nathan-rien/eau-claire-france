
import { WaterData } from '@/data/bottleWaterData';

export interface BottleRanking extends WaterData {
  nutritionalScore: number;
  scoreBreakdown: {
    nitrates: number;
    residuSec: number;
    calcium: number;
    magnesium: number;
    sodium: number;
  };
}

export const calculateNutritionalScore = (bottle: WaterData): BottleRanking => {
  const scores = {
    nitrates: 0,
    residuSec: 0,
    calcium: 0,
    magnesium: 0,
    sodium: 0,
  };

  // Score pour les nitrates (0-10 points, plus c'est faible mieux c'est)
  if (bottle.composition.nitrates < 5) scores.nitrates = 10;
  else if (bottle.composition.nitrates <= 10) scores.nitrates = 6;
  else scores.nitrates = 2;

  // Score pour le résidu sec (0-10 points)
  if (bottle.composition.residusSec >= 150 && bottle.composition.residusSec <= 500) scores.residuSec = 10;
  else if (bottle.composition.residusSec > 500 && bottle.composition.residusSec <= 1500) scores.residuSec = 6;
  else scores.residuSec = 2;

  // Score pour le calcium (0-10 points)
  if (bottle.composition.calcium >= 150) scores.calcium = 10;
  else if (bottle.composition.calcium >= 50) scores.calcium = 6;
  else scores.calcium = 2;

  // Score pour le magnésium (0-10 points)
  if (bottle.composition.magnesium > 50) scores.magnesium = 10;
  else if (bottle.composition.magnesium >= 20) scores.magnesium = 6;
  else scores.magnesium = 2;

  // Score pour le sodium (0-10 points, plus c'est faible mieux c'est)
  if (bottle.composition.sodium < 20) scores.sodium = 10;
  else if (bottle.composition.sodium <= 100) scores.sodium = 6;
  else scores.sodium = 2;

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return {
    ...bottle,
    nutritionalScore: totalScore,
    scoreBreakdown: scores,
  };
};

export const rankBottles = (bottles: WaterData[]): BottleRanking[] => {
  return bottles
    .map(calculateNutritionalScore)
    .sort((a, b) => b.nutritionalScore - a.nutritionalScore);
};

export const getScoreGrade = (score: number): { grade: string; color: string; description: string } => {
  if (score >= 45) return { grade: 'A', color: 'text-green-600', description: 'Excellente qualité nutritionnelle' };
  if (score >= 35) return { grade: 'B', color: 'text-blue-600', description: 'Très bonne qualité nutritionnelle' };
  if (score >= 25) return { grade: 'C', color: 'text-yellow-600', description: 'Bonne qualité nutritionnelle' };
  if (score >= 15) return { grade: 'D', color: 'text-orange-600', description: 'Qualité nutritionnelle moyenne' };
  return { grade: 'E', color: 'text-red-600', description: 'Qualité nutritionnelle faible' };
};
