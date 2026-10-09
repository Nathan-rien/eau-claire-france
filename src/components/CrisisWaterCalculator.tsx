import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

// ICI, 8 octobre 2026 : moyenne départementale ; moitié demandée dans le Nord-Finistère.
export const FINISTERE_AVG = 112;
export const TARGET = 56;
// ARS Normandie, « Initier aux principaux usages domestiques de l'eau » :
// https://www.normandie.ars.sante.fr/media/2763/download?inline
// Débit de douche ≈12 L/min ; hypothèses de fréquence choisies par le foyer.
export const INPUT_BOUNDS = {
  people: [1, 8], showers: [0, 14], minutes: [1, 20], baths: [0, 14],
  flushes: [0, 10], laundry: [0, 14], dishes: [0, 14],
} as const;
type NumericKey = keyof typeof INPUT_BOUNDS;
export interface CrisisInputs {
  people: number; showers: number; minutes: number; baths: number;
  flushes: number; laundry: number; dishes: number;
  toilet: 'classic' | 'dual'; dishMode: 'machine' | 'hand';
}
export const DEFAULT_INPUTS: CrisisInputs = {
  people: 2, showers: 7, minutes: 5, baths: 0, flushes: 4,
  toilet: 'classic', laundry: 3, dishes: 4, dishMode: 'machine',
};
export function boundInput(key: NumericKey, value: number): number {
  const [min, max] = INPUT_BOUNDS[key];
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : min;
}
export function calculateConsumption(input: CrisisInputs) {
  const p = input.people;
  const shower = p * (input.showers / 7) * input.minutes * 12;
  const bath = input.baths / 7 * 150;
  const dish = input.dishMode === 'machine' ? input.dishes / 7 * 15 : p * 15;
  const shared = shower + bath + dish;
  const low = shared + p * 11 + p * input.flushes * (input.toilet === 'classic' ? 10 : 3) + input.laundry / 7 * 40 + 5;
  const high = shared + p * 12 + p * input.flushes * (input.toilet === 'classic' ? 10 : 6) + input.laundry / 7 * 80 + 10;
  return { low, high, perPersonLow: low / p, perPersonHigh: high / p, central: (low + high) / (2 * p) };
}
export function calculateSavings(input: CrisisInputs) {
  const options: { id: string; label: string; household: number }[] = [];
  if (input.minutes > 2) options.push({ id: 'shower', label: 'Raccourcir chaque douche de 2 minutes', household: input.people * input.showers / 7 * 2 * 12 });
  // Milieu de la fourchette du double débit : (3 + 6) / 2.
  if (input.toilet === 'classic') options.push({ id: 'toilet', label: 'Passer d’une chasse classique au double débit', household: input.people * input.flushes * (10 - (3 + 6) / 2) });
  // Remplacer un bain hebdomadaire par une douche de la durée saisie, au même débit.
  if (input.baths >= 1) options.push({ id: 'bath', label: 'Remplacer un bain par semaine par une douche', household: (150 - input.minutes * 12) / 7 });
  if (input.laundry >= 1) options.push({ id: 'laundry', label: 'Faire une lessive de moins par semaine', household: ((40 + 80) / 2) / 7 });
  return options.filter(option => option.household > 0).sort((a, b) => b.household - a.household).slice(0, 3)
    .map(option => ({ ...option, perPerson: option.household / input.people }));
}
const number = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const FIELDS: { key: NumericKey; label: string }[] = [
  { key: 'people', label: 'Nombre de personnes' },
  { key: 'showers', label: 'Douches par personne et par semaine' },
  { key: 'minutes', label: 'Durée d’une douche (minutes)' },
  { key: 'baths', label: 'Bains par semaine pour le foyer' },
  { key: 'flushes', label: 'Chasses d’eau par personne et par jour (hypothèse moyenne)' },
  { key: 'laundry', label: 'Lessives par semaine pour le foyer' },
];

export default function CrisisWaterCalculator() {
  const [input, setInput] = useState<CrisisInputs>(DEFAULT_INPUTS);
  const result = calculateConsumption(input);
  const savings = calculateSavings(input);
  const numericField = (key: NumericKey, label: string) => {
    const [min, max] = INPUT_BOUNDS[key];
    return <div key={key} className="space-y-2 min-w-0">
      <Label htmlFor={`crisis-${key}`} className="block leading-relaxed">{label}</Label>
      <Input id={`crisis-${key}`} type="number" inputMode="numeric" min={min} max={max} step={1}
        className="h-11" value={input[key]} onChange={event => setInput(previous => ({ ...previous, [key]: boundInput(key, event.target.valueAsNumber) }))} />
    </div>;
  };
  return <div className="rounded-lg border border-border bg-card p-4 sm:p-6 text-card-foreground">
    <div className="grid gap-5 sm:grid-cols-2">{FIELDS.map(field => numericField(field.key, field.label))}</div>
    <fieldset className="mt-6">
      <legend className="text-sm font-medium mb-2">Type de chasse d’eau</legend>
      <RadioGroup value={input.toilet} onValueChange={value => { if (value === 'classic' || value === 'dual') setInput(previous => ({ ...previous, toilet: value })); }} className="sm:grid-cols-2">
        <Label htmlFor="crisis-classic" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-classic" value="classic" />Classique</Label>
        <Label htmlFor="crisis-dual" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-dual" value="dual" />Double débit</Label>
      </RadioGroup>
    </fieldset>
    <fieldset className="mt-6">
      <legend className="text-sm font-medium mb-2">Vaisselle du foyer</legend>
      <RadioGroup value={input.dishMode} onValueChange={value => { if (value === 'machine' || value === 'hand') setInput(previous => ({ ...previous, dishMode: value })); }} className="sm:grid-cols-2">
        <Label htmlFor="crisis-machine" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-machine" value="machine" />Lave-vaisselle</Label>
        <Label htmlFor="crisis-hand" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-hand" value="hand" />À la main (estimation)</Label>
      </RadioGroup>
      {input.dishMode === 'machine' && <div className="mt-3">{numericField('dishes', 'Cycles de lave-vaisselle par semaine')}</div>}
    </fieldset>
    <div className="mt-8 border-t border-border pt-6" aria-live="polite" aria-atomic="true">
      <h3 className="text-lg font-semibold">Votre estimation par personne et par jour</h3>
      <p className="text-2xl font-bold mt-2">{number(result.perPersonLow)} à {number(result.perPersonHigh)} L</p>
      <p className="text-sm text-muted-foreground mb-5">Valeur centrale : {number(result.central)} L par personne et par jour.</p>
      <div className="space-y-4">
        <div><p className="text-sm mb-2">Par rapport à la moyenne du Finistère : {FINISTERE_AVG} L/pers/jour (ICI)</p>
          <Progress value={Math.min(100, result.central / FINISTERE_AVG * 100)} aria-label="Comparaison à la moyenne du Finistère" aria-valuetext={`${number(result.central)} litres estimés ; référence ${FINISTERE_AVG} litres`} />
          <p className="text-sm text-muted-foreground mt-1">{result.central > FINISTERE_AVG ? 'Au-dessus' : result.central < FINISTERE_AVG ? 'En dessous' : 'Au niveau'} de cette moyenne.</p>
        </div>
        <div><p className="text-sm mb-2">Objectif Nord-Finistère / Pays de Brest : {TARGET} L/pers/jour (moitié de la moyenne)</p>
          <Progress value={Math.min(100, result.central / TARGET * 100)} aria-label="Comparaison à l’objectif Nord-Finistère" aria-valuetext={`${number(result.central)} litres estimés ; objectif ${TARGET} litres`} />
          <p className="text-sm text-muted-foreground mt-1">{result.central > TARGET ? 'Au-dessus' : result.central < TARGET ? 'En dessous' : 'Au niveau'} de cet objectif ; cette estimation ne garantit pas qu’il soit atteignable.</p>
        </div>
      </div>
      <h3 className="text-lg font-semibold mt-6">3 gestes à plus fort gain</h3>
      {savings.length > 0 ? <ol className="mt-3 space-y-3">{savings.map(saving => <li key={saving.id}>
        <span className="font-medium">{saving.label}</span>
        <span className="block text-sm text-muted-foreground">Gain estimé : {number(saving.household)} L/jour pour le foyer, soit {number(saving.perPerson)} L/jour par personne.</span>
      </li>)}</ol> : <p className="text-sm text-muted-foreground mt-3">Aucun gain positif parmi les gestes proposés avec ces habitudes.</p>}
      {savings.length > 0 && savings.length < 3 && <p className="text-sm text-muted-foreground mt-3">Seuls les gestes avec un gain positif pour vos habitudes sont présentés.</p>}
      <p className="text-sm text-muted-foreground mt-3">Gains indicatifs calculés séparément, non cumulés ; double débit et lessive : milieu des fourchettes. Douche remplaçant un bain : durée saisie.</p>
    </div>
    <p className="text-sm mt-6">Une fuite de chasse d’eau représente 30 à 250 m³ par an (ARS)</p>
    <p className="text-sm text-muted-foreground mt-4">Estimation indicative fondée sur des valeurs moyennes (ARS ; les ordres de grandeur varient selon les sources, ADEME et CIEAU donnent parfois des valeurs plus élevées pour la douche). Votre consommation réelle se lit sur votre compteur. Ne couvre ni jardin, ni voiture, ni piscine, ni fuites. Les consignes officielles priment.</p>
  </div>;
}
