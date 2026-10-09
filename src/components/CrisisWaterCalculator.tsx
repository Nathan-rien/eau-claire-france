import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trackEvent } from '@/utils/ga';
import {
  FINISTERE_AVG, TARGET, INPUT_BOUNDS, DEFAULT_INPUTS, PRESETS, NO_LEVERS, boundInput, boundMeter,
  calculateConsumption, calculateLevers, allAvailableLevers, isLeverAvailable, volumeFromIndexes,
  measuredPerPersonPerDay, resultBucket, type CrisisInputs, type NumericKey, type Levers, type LeverId,
} from '@/lib/crisisWaterModel';

const number = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const range = (a: number, b: number) => number(a) === number(b) ? number(a) : `${number(a)} à ${number(b)}`;
const FIELDS: { key: NumericKey; label: string }[] = [
  { key: 'people', label: 'Nombre de personnes' },
  { key: 'showers', label: 'Douches par personne et par semaine' },
  { key: 'minutes', label: 'Durée d’une douche (minutes)' },
  { key: 'baths', label: 'Bains par semaine pour le foyer' },
  { key: 'flushes', label: 'Chasses d’eau par personne et par jour (hypothèse moyenne)' },
  { key: 'laundry', label: 'Lessives par semaine pour le foyer' },
];
const SHARE_URL = 'https://infoeau.fr/actualites/crise-eau-finistere#calculateur';

function Comparisons({ value }: { value: number }) {
  const rel = (ref: number) => value > ref ? 'Au-dessus' : value < ref ? 'En dessous' : 'Au niveau';
  return <div className="space-y-4">
    <div><p className="text-sm mb-2">Par rapport à la moyenne du Finistère : {FINISTERE_AVG} L/pers/jour (ICI)</p>
      <Progress value={Math.min(100, value / FINISTERE_AVG * 100)} aria-label="Comparaison à la moyenne du Finistère" aria-valuetext={`${number(value)} litres ; référence ${FINISTERE_AVG} litres`} />
      <p className="text-sm text-muted-foreground mt-1">{rel(FINISTERE_AVG)} de cette moyenne.</p>
    </div>
    <div><p className="text-sm mb-2">Objectif Nord-Finistère / Pays de Brest : {TARGET} L/pers/jour (moitié de la moyenne)</p>
      <Progress value={Math.min(100, value / TARGET * 100)} aria-label="Comparaison à l’objectif Nord-Finistère" aria-valuetext={`${number(value)} litres ; objectif ${TARGET} litres`} />
      <p className="text-sm text-muted-foreground mt-1">{rel(TARGET)} de cet objectif ; cela ne garantit pas qu’il soit atteignable.</p>
    </div>
  </div>;
}

function MeterField({ id, label, value, onChange, step = '0.001' }: { id: string; label: string; value: string; onChange: (v: string) => void; step?: string }) {
  return <div className="space-y-2 min-w-0">
    <Label htmlFor={id} className="block leading-relaxed">{label}</Label>
    <Input id={id} type="number" inputMode="decimal" min={0} max={step === '1' ? 366 : 999999} step={step} className="h-11" value={value} onChange={e => onChange(e.target.value)} />
  </div>;
}

export default function CrisisWaterCalculator() {
  const [mode, setMode] = useState<'habits' | 'meter'>('habits');
  const [input, setInput] = useState<CrisisInputs>(DEFAULT_INPUTS);
  const [levers, setLevers] = useState<Levers>(NO_LEVERS);
  const [touched, setTouched] = useState(false);
  const [meterPeople, setMeterPeople] = useState(2);
  const [meterMethod, setMeterMethod] = useState<'indexes' | 'bill'>('indexes');
  const [index1, setIndex1] = useState('');
  const [index2, setIndex2] = useState('');
  const [indexDays, setIndexDays] = useState('');
  const [billVolume, setBillVolume] = useState('');
  const [billDays, setBillDays] = useState('365');
  const [copied, setCopied] = useState(false);
  const started = useRef(false);
  const copyTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const start = () => { if (!started.current) { started.current = true; trackEvent('crisis_calc_start'); } };
  const update = (patch: Partial<CrisisInputs>) => { setTouched(true); setInput(prev => ({ ...prev, ...patch })); };

  const result = calculateConsumption(input, levers);
  const options = calculateLevers(input);
  const all = calculateConsumption(input, allAvailableLevers(input));
  const estimateBase = calculateConsumption(input);
  const allChecked = options.length > 0 && options.every(o => levers[o.id]);

  const parse = (v: string, key: 'days' | 'index' | 'volume') => v.trim() === '' ? NaN : boundMeter(key, Number(v));
  const i1 = parse(index1, 'index'), i2 = parse(index2, 'index');
  const indexError = Number.isFinite(i1) && Number.isFinite(i2) && i2 < i1;
  const volume = meterMethod === 'indexes' ? volumeFromIndexes(i1, i2) : parse(billVolume, 'volume');
  const days = parse(meterMethod === 'indexes' ? indexDays : billDays, 'days');
  const measured = volume === null ? null : measuredPerPersonPerDay({ volumeM3: volume, days, people: meterPeople });

  const shown = mode === 'habits' ? result.central : measured;

  const toggleLever = (id: LeverId, checked: boolean) => {
    setLevers(prev => ({ ...prev, [id]: checked }));
    if (checked) trackEvent('crisis_calc_lever', { lever: id });
  };
  const toggleAll = () => {
    if (allChecked) { setLevers(NO_LEVERS); return; }
    options.filter(o => !levers[o.id]).forEach(o => trackEvent('crisis_calc_lever', { lever: o.id }));
    setLevers({ ...NO_LEVERS, ...Object.fromEntries(options.map(o => [o.id, true])) });
  };
  const copy = async () => {
    if (shown === null) return;
    const n = mode === 'habits' ? input.people : meterPeople;
    const text = `Mon foyer (${n} personne${n > 1 ? 's' : ''}) : environ ${number(shown)} L par personne et par jour (${mode === 'habits' ? 'estimation indicative' : 'mesuré avec mon compteur'}). Objectif demandé dans le Nord-Finistère : ${TARGET} L. Calculez le vôtre : ${SHARE_URL}`;
    trackEvent('crisis_calc_copy', { bucket: resultBucket(shown) });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch { /* repli silencieux */ }
  };

  const numericField = (key: NumericKey, label: string) => {
    const [min, max] = INPUT_BOUNDS[key];
    return <div key={key} className="space-y-2 min-w-0">
      <Label htmlFor={`crisis-${key}`} className="block leading-relaxed">{label}</Label>
      <Input id={`crisis-${key}`} type="number" inputMode="numeric" min={min} max={max} step={1}
        className="h-11" value={input[key]} onChange={event => update({ [key]: boundInput(key, event.target.valueAsNumber) })} />
    </div>;
  };

  return <div className="relative rounded-lg border border-border bg-card text-card-foreground" onPointerDownCapture={start} onKeyDownCapture={start}>
    <div className="p-4 sm:p-6">
      <Tabs value={mode} onValueChange={v => { if (v === 'habits' || v === 'meter') { setMode(v); trackEvent('crisis_calc_mode', { mode: v }); } }}>
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="habits" className="min-h-11 whitespace-normal">Estimer selon mes habitudes</TabsTrigger>
          <TabsTrigger value="meter" className="min-h-11 whitespace-normal">Mesurer avec mon compteur</TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="mt-6">
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Hypothèses de départ, à ajuster</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => <Button key={p.id} type="button" variant="outline" className="min-h-11" onClick={() => { setTouched(true); setInput(p.input); setLevers(NO_LEVERS); }}>{p.label}</Button>)}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">{FIELDS.map(field => numericField(field.key, field.label))}</div>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium mb-2">Type de chasse d’eau</legend>
            <RadioGroup value={input.toilet} onValueChange={value => { if (value === 'classic' || value === 'dual') update({ toilet: value }); }} className="sm:grid-cols-2">
              <Label htmlFor="crisis-classic" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-classic" value="classic" />Classique</Label>
              <Label htmlFor="crisis-dual" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-dual" value="dual" />Double débit</Label>
            </RadioGroup>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium mb-2">Vaisselle du foyer</legend>
            <RadioGroup value={input.dishMode} onValueChange={value => { if (value === 'machine' || value === 'hand') update({ dishMode: value }); }} className="sm:grid-cols-2">
              <Label htmlFor="crisis-machine" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-machine" value="machine" />Lave-vaisselle</Label>
              <Label htmlFor="crisis-hand" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-hand" value="hand" />À la main (estimation)</Label>
            </RadioGroup>
            {input.dishMode === 'machine' && <div className="mt-3">{numericField('dishes', 'Cycles de lave-vaisselle par semaine')}</div>}
          </fieldset>
          <Label htmlFor="crisis-leak" className="mt-6 flex items-center gap-3 min-h-11">
            <Checkbox id="crisis-leak" checked={input.leak} onCheckedChange={c => update({ leak: c === true })} />Une chasse d’eau fuit chez moi
          </Label>
          <Button type="button" variant="ghost" className="mt-2 min-h-11" onClick={() => { setInput(DEFAULT_INPUTS); setLevers(NO_LEVERS); setTouched(false); }}>Réinitialiser</Button>

          <div className="mt-8 border-t border-border pt-6" aria-live="polite" aria-atomic="true">
            <h3 className="text-lg font-semibold">Votre estimation par personne et par jour</h3>
            <p className="text-2xl font-bold mt-2">{number(result.perPersonLow)} à {number(result.perPersonHigh)} L</p>
            <p className="text-sm text-muted-foreground mb-5">Valeur centrale : {number(result.central)} L par personne et par jour{options.some(o => levers[o.id]) ? ', avec les gestes cochés' : ''}.</p>
            <Comparisons value={result.central} />
          </div>

          <fieldset className="mt-6">
            <legend className="text-lg font-semibold">Gestes possibles</legend>
            {options.length > 0 ? <>
              <ul className="mt-3 space-y-3">{options.map(o => <li key={o.id}>
                <Label htmlFor={`lever-${o.id}`} className="flex items-start gap-3 min-h-11 font-normal">
                  <Checkbox id={`lever-${o.id}`} className="mt-1" checked={levers[o.id] && isLeverAvailable(input, o.id)} onCheckedChange={c => toggleLever(o.id, c === true)} />
                  <span className="min-w-0"><span className="font-medium block">{o.label}</span>
                    <span className="block text-sm text-muted-foreground">{range(o.householdLow, o.householdHigh)} L/jour pour le foyer, soit {range(o.perPersonLow, o.perPersonHigh)} L par personne.</span></span>
                </Label>
              </li>)}</ul>
              <Button type="button" variant="outline" className="mt-3 min-h-11" onClick={toggleAll}>{allChecked ? 'Tout décocher' : 'Tout cocher'}</Button>
            </> : <p className="text-sm text-muted-foreground mt-3">Aucun geste proposé avec un gain positif pour ces habitudes.</p>}
            <p className="text-sm text-muted-foreground mt-3">Gains indicatifs calculés séparément ; plusieurs gestes cochés sont recalculés ensemble. Double débit et lessive : fourchettes. Douche remplaçant un bain : durée saisie.</p>
          </fieldset>

          <div className="mt-6 rounded-md border border-border bg-muted p-4">
            <h3 className="font-semibold">Avec tous les gestes proposés</h3>
            <p className="text-xl font-bold mt-1">{number(all.perPersonLow)} à {number(all.perPersonHigh)} L par personne et par jour</p>
            <p className="text-sm mt-1">{all.central > TARGET
              ? `Ces gestes ne suffisent pas, selon cette estimation, à atteindre ${TARGET} L par personne et par jour.`
              : `Selon cette estimation, ces gestes permettraient d’atteindre ${TARGET} L par personne et par jour.`}</p>
          </div>
        </TabsContent>

        <TabsContent value="meter" className="mt-6">
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="meter-people">Nombre de personnes</Label>
            <Input id="meter-people" type="number" inputMode="numeric" min={1} max={8} step={1} className="h-11" value={meterPeople} onChange={e => setMeterPeople(boundInput('people', e.target.valueAsNumber))} />
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium mb-2">Mes données</legend>
            <RadioGroup value={meterMethod} onValueChange={v => { if (v === 'indexes' || v === 'bill') setMeterMethod(v); }} className="sm:grid-cols-2">
              <Label htmlFor="meter-indexes" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="meter-indexes" value="indexes" />J’ai deux relevés de compteur</Label>
              <Label htmlFor="meter-bill" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="meter-bill" value="bill" />J’ai un volume sur ma facture</Label>
            </RadioGroup>
          </fieldset>
          {meterMethod === 'indexes' ? <div className="grid gap-5 sm:grid-cols-3 mt-4">
            <MeterField id="meter-i1" label="Index 1 (m³)" value={index1} onChange={setIndex1} />
            <MeterField id="meter-i2" label="Index 2 (m³)" value={index2} onChange={setIndex2} />
            <MeterField id="meter-days" label="Jours entre les relevés" value={indexDays} onChange={setIndexDays} step="1" />
          </div> : <div className="grid gap-5 sm:grid-cols-2 mt-4">
            <MeterField id="meter-volume" label="Volume facturé (m³)" value={billVolume} onChange={setBillVolume} />
            <MeterField id="meter-bill-days" label="Nombre de jours" value={billDays} onChange={setBillDays} step="1" />
          </div>}
          {indexError && <p role="alert" className="text-sm text-destructive mt-3">L’index 2 doit être supérieur ou égal à l’index 1 : vérifiez l’ordre de vos relevés.</p>}
          <p className="text-sm text-muted-foreground mt-4">Un compteur collectif d’immeuble ou un foyer avec jardin ou piscine fausse cette mesure : elle inclut tous les usages.</p>
          <div className="mt-6 border-t border-border pt-6" aria-live="polite" aria-atomic="true">
            {measured !== null ? <>
              <p className="text-xl font-bold mb-5">Consommation mesurée : {number(measured)} L par personne et par jour</p>
              <Comparisons value={measured} />
              {touched && measured > estimateBase.perPersonHigh && <p className="text-sm font-medium mt-4">Votre mesure dépasse votre estimation : une fuite ou des usages non comptés sont possibles. Faites le test ci-dessous.</p>}
            </> : <p className="text-sm text-muted-foreground">Renseignez vos relevés pour afficher votre consommation mesurée.</p>}
          </div>
        </TabsContent>
      </Tabs>

      <details className="mt-6 rounded-md border border-border p-4">
        <summary className="cursor-pointer font-medium min-h-11 flex items-center">Tester une fuite</summary>
        <div className="mt-3 space-y-3 text-sm">
          <p><strong>Test du compteur :</strong> fermez tous les robinets et arrêtez les appareils (lave-linge, lave-vaisselle, arrosage). Notez l’index du compteur, attendez quelques heures sans consommer d’eau (idéalement la nuit), puis relevez-le à nouveau : si l’index a bougé, il y a probablement une fuite.</p>
          <p><strong>Chasse d’eau :</strong> versez quelques gouttes de colorant alimentaire dans le réservoir sans tirer la chasse. Attendez au moins 30 minutes à 1 heure : si la couleur apparaît dans la cuvette, le mécanisme fuit.</p>
          <p>En cas de doute, contactez votre service de l’eau ou un plombier.</p>
          <p className="text-muted-foreground">Méthodes courantes décrites par des guides pratiques, pas une consigne officielle.</p>
        </div>
      </details>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" className="min-h-11" onClick={copy} disabled={shown === null}>Copier mon résultat</Button>
        <span aria-live="polite" className="text-sm text-muted-foreground">{copied ? 'Copié' : ''}</span>
      </div>

      <p className="text-sm mt-6">Une fuite de chasse d’eau représente 30 à 250 m³ par an (ARS)</p>
      <p className="text-sm text-muted-foreground mt-4">Estimation indicative fondée sur des valeurs moyennes (ARS ; les ordres de grandeur varient selon les sources, ADEME et CIEAU donnent parfois des valeurs plus élevées pour la douche). Votre consommation réelle se lit sur votre compteur. Ne couvre ni jardin, ni voiture, ni piscine, ni fuites. Les consignes officielles priment.</p>
    </div>
    {shown !== null && <div aria-hidden="true" className="sticky bottom-0 z-10 rounded-b-lg border-t border-border bg-card py-3 pl-4 pr-24 text-sm font-semibold">
      ≈ {number(shown)} L/pers/jour · objectif {TARGET} L
    </div>}
  </div>;
}
