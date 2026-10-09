// Modèle pur du calculateur de crise Finistère (aucun JSX, aucun stockage).
// ICI, 8 octobre 2026 : moyenne départementale ; moitié demandée dans le Nord-Finistère.
export const FINISTERE_AVG = 112;
export const TARGET = 56;
// ARS Normandie, « Initier aux principaux usages domestiques de l'eau » :
// https://www.normandie.ars.sante.fr/media/2763/download?inline
// Débit de douche ≈12 L/min.
export const INPUT_BOUNDS = {
  people: [1, 8], showers: [0, 14], minutes: [1, 20], baths: [0, 14],
  flushes: [0, 10], laundry: [0, 14], dishes: [0, 14],
} as const;
export const METER_BOUNDS = { days: [1, 366], index: [0, 999999], volume: [0, 999999] } as const;
export type NumericKey = keyof typeof INPUT_BOUNDS;
export interface CrisisInputs {
  people: number; showers: number; minutes: number; baths: number;
  flushes: number; laundry: number; dishes: number;
  toilet: 'classic' | 'dual'; dishMode: 'machine' | 'hand';
}
export type LeverId = 'shorterShower' | 'dualFlush' | 'bathToShower' | 'fewerLaundry';
export type Levers = Record<LeverId, boolean>;
export const NO_LEVERS: Levers = { shorterShower: false, dualFlush: false, bathToShower: false, fewerLaundry: false };
export const LEVER_LABELS: Record<LeverId, string> = {
  shorterShower: 'Raccourcir chaque douche de 2 minutes',
  dualFlush: 'Passer d’une chasse classique au double débit',
  bathToShower: 'Remplacer un bain par semaine par une douche',
  fewerLaundry: 'Faire une lessive de moins par semaine',
};
export const DEFAULT_INPUTS: CrisisInputs = {
  people: 2, showers: 7, minutes: 5, baths: 0, flushes: 4,
  toilet: 'classic', laundry: 3, dishes: 4, dishMode: 'machine',
};
// Hypothèses de départ à ajuster, pas des faits.
export const PRESETS: { id: string; label: string; input: CrisisInputs }[] = [
  { id: 'single', label: 'Une personne', input: { people: 1, showers: 7, minutes: 5, baths: 0, flushes: 4, toilet: 'classic', laundry: 2, dishMode: 'machine', dishes: 3 } },
  { id: 'couple', label: 'Couple', input: DEFAULT_INPUTS },
  { id: 'family4', label: 'Famille de 4', input: { people: 4, showers: 6, minutes: 5, baths: 2, flushes: 4, toilet: 'classic', laundry: 5, dishMode: 'machine', dishes: 6 } },
];
export function boundInput(key: NumericKey, value: number): number {
  const [min, max] = INPUT_BOUNDS[key];
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : min;
}
/** Borne une valeur compteur ; décimales limitées à 3 (m³) ou entières (jours). */
export function boundMeter(key: keyof typeof METER_BOUNDS, value: number): number {
  const [min, max] = METER_BOUNDS[key];
  if (!Number.isFinite(value)) return min;
  const v = Math.min(max, Math.max(min, value));
  return key === 'days' ? Math.round(v) : Math.round(v * 1000) / 1000;
}
export function isLeverAvailable(input: CrisisInputs, id: LeverId): boolean {
  switch (id) {
    case 'shorterShower': return input.minutes >= 4;
    case 'dualFlush': return input.toilet === 'classic';
    case 'bathToShower': return input.baths >= 1;
    case 'fewerLaundry': return input.laundry >= 1;
  }
}
export function calculateConsumption(input: CrisisInputs, levers: Partial<Levers> = {}) {
  const on = (id: LeverId) => !!levers[id] && isLeverAvailable(input, id);
  const p = input.people;
  const minutes = on('shorterShower') ? input.minutes - 2 : input.minutes;
  const toilet = on('dualFlush') ? 'dual' : input.toilet;
  const baths = on('bathToShower') ? input.baths - 1 : input.baths;
  const extraShower = on('bathToShower') ? 1 : 0;
  const laundry = on('fewerLaundry') ? input.laundry - 1 : input.laundry;
  const shower = (p * input.showers + extraShower) / 7 * minutes * 12;
  const bath = baths / 7 * 150;
  const dish = input.dishMode === 'machine' ? input.dishes / 7 * 15 : p * 15;
  const shared = shower + bath + dish;
  const low = shared + p * 11 + p * input.flushes * (toilet === 'classic' ? 10 : 3) + laundry / 7 * 40 + 5;
  const high = shared + p * 12 + p * input.flushes * (toilet === 'classic' ? 10 : 6) + laundry / 7 * 80 + 10;
  return { low, high, perPersonLow: low / p, perPersonHigh: high / p, central: (low + high) / (2 * p) };
}
export const LEVER_IDS: LeverId[] = ['shorterShower', 'dualFlush', 'bathToShower', 'fewerLaundry'];
export function allAvailableLevers(input: CrisisInputs): Levers {
  return Object.fromEntries(LEVER_IDS.map(id => [id, isLeverAvailable(input, id)])) as Levers;
}
export function calculateLevers(input: CrisisInputs) {
  const base = calculateConsumption(input);
  return LEVER_IDS.filter(id => isLeverAvailable(input, id)).map(id => {
    const w = calculateConsumption(input, { [id]: true });
    const dLow = base.low - w.low, dHigh = base.high - w.high;
    const householdLow = Math.min(dLow, dHigh), householdHigh = Math.max(dLow, dHigh);
    return { id, label: LEVER_LABELS[id], householdLow, householdHigh,
      perPersonLow: householdLow / input.people, perPersonHigh: householdHigh / input.people };
  }).filter(l => l.householdLow > 0 || l.householdHigh > 0)
    .sort((a, b) => (b.householdLow + b.householdHigh) - (a.householdLow + a.householdHigh));
}
export function volumeFromIndexes(index1: number, index2: number): number | null {
  if (!Number.isFinite(index1) || !Number.isFinite(index2)) return null;
  return index2 >= index1 ? index2 - index1 : null;
}
export function measuredPerPersonPerDay({ volumeM3, days, people }: { volumeM3: number; days: number; people: number }): number | null {
  if (![volumeM3, days, people].every(Number.isFinite) || volumeM3 < 0 || days < 1 || people < 1) return null;
  return volumeM3 * 1000 / (days * people);
}
export function resultBucket(central: number): 'lt56' | '56_112' | 'gt112' {
  return central < TARGET ? 'lt56' : central <= FINISTERE_AVG ? '56_112' : 'gt112';
}
