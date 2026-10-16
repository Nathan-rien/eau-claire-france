import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trackEvent } from '@/utils/ga';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  FINISTERE_AVG, TARGET, NATIONAL_AVG, NATIONAL_SOURCE, nationalBucket, INPUT_BOUNDS, DEFAULT_INPUTS, PRESETS, NO_LEVERS, boundInput, boundMeter,
  calculateConsumption, calculateLevers, allAvailableLevers, isLeverAvailable, volumeFromIndexes,
  measuredPerPersonPerDay, resultBucket, type CrisisInputs, type NumericKey, type Levers, type LeverId,
} from '@/lib/crisisWaterModel';

type Lang = 'fr' | 'en';
export type CalculatorContext = 'finistere' | 'generic';
const fmt = (lang: Lang) => (value: number) => value.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 1 });
const FIELD_LABELS: Record<Lang, Record<NumericKey, string>> = {
  fr: {
    people: 'Nombre de personnes', showers: 'Douches par personne et par semaine', minutes: 'Durée d’une douche (minutes)',
    baths: 'Bains par semaine pour le foyer', flushes: 'Chasses d’eau par personne et par jour (hypothèse moyenne)',
    laundry: 'Lessives par semaine pour le foyer', dishes: 'Cycles de lave-vaisselle par semaine',
  },
  en: {
    people: 'Number of people', showers: 'Showers per person per week', minutes: 'Length of a shower (minutes)',
    baths: 'Baths per week for the household', flushes: 'Toilet flushes per person per day (average assumption)',
    laundry: 'Laundry loads per week for the household', dishes: 'Dishwasher cycles per week',
  },
};
const FIELD_KEYS: NumericKey[] = ['people', 'showers', 'minutes', 'baths', 'flushes', 'laundry'];
const EN_LEVERS: Record<LeverId, string> = {
  shorterShower: 'Shorten each shower by 2 minutes', dualFlush: 'Switch from a standard to a dual flush',
  bathToShower: 'Replace one bath a week with a shower', fewerLaundry: 'Run one fewer laundry load a week',
};
const EN_PRESETS: Record<string, string> = { single: 'One person', couple: 'Couple', family4: 'Family of 4' };
const STR = {
  fr: {
    habits: 'Estimer selon mes habitudes', meter: 'Mesurer avec mon compteur', presets: 'Hypothèses de départ, à ajuster',
    toilet: 'Type de chasse d’eau', classic: 'Classique', dual: 'Double débit', dishes: 'Vaisselle du foyer',
    machine: 'Lave-vaisselle', hand: 'À la main (estimation)', reset: 'Réinitialiser',
    estimateTitle: 'Votre estimation par personne et par jour', to: 'à',
    central: (v: string, l: boolean) => `Valeur centrale : ${v} L par personne et par jour${l ? ', avec les gestes cochés' : ''}.`,
    levers: 'Gestes possibles', leverGain: (h: string, p: string) => `${h} L/jour pour le foyer, soit ${p} L par personne.`,
    uncheck: 'Tout décocher', check: 'Tout cocher', noLever: 'Aucun geste proposé avec un gain positif pour ces habitudes.',
    leverNote: 'Gains indicatifs calculés séparément ; plusieurs gestes cochés sont recalculés ensemble. Double débit et lessive : fourchettes. Douche remplaçant un bain : durée saisie.',
    allTitle: 'Avec tous les gestes proposés', perDay: 'L par personne et par jour',
    peopleLabel: 'Nombre de personnes', myData: 'Mes données', twoReadings: 'J’ai deux relevés de compteur', bill: 'J’ai un volume sur ma facture',
    i1: 'Index 1 (m³)', i2: 'Index 2 (m³)', days: 'Jours entre les relevés', volume: 'Volume facturé (m³)', billDays: 'Nombre de jours',
    indexError: 'L’index 2 doit être supérieur ou égal à l’index 1 : vérifiez l’ordre de vos relevés.',
    meterNote: 'Un compteur collectif d’immeuble ou un foyer avec jardin ou piscine fausse cette mesure : elle inclut tous les usages.',
    measured: (v: string) => `Consommation mesurée : ${v} L par personne et par jour`,
    over: 'Votre mesure dépasse votre estimation : des usages non comptés ou une fuite sont possibles.',
    fill: 'Renseignez vos relevés pour afficher votre consommation mesurée.', copy: 'Copier mon résultat', copied: 'Copié',
    footer: 'Estimation indicative fondée sur des valeurs moyennes (ARS ; les ordres de grandeur varient selon les sources, ADEME et CIEAU donnent parfois des valeurs plus élevées pour la douche). Votre consommation réelle se lit sur votre compteur. Ne couvre ni jardin, ni voiture, ni piscine, ni fuites. Les consignes officielles priment.',
    above: 'Au-dessus', below: 'En dessous', level: 'Au niveau',
    natTitle: `Par rapport à la moyenne nationale : ${NATIONAL_AVG} L/pers/jour (${NATIONAL_SOURCE.fr})`,
    natAria: 'Comparaison à la moyenne nationale', natRel: (r: string) => `${r} de cette moyenne.`,
    ref: 'référence', litres: 'litres',
    share: (n: number, v: string, habits: boolean, url: string) => `Mon foyer (${n} personne${n > 1 ? 's' : ''}) : environ ${v} L par personne et par jour (${habits ? 'estimation indicative' : 'mesuré avec mon compteur'}). Moyenne nationale : ${NATIONAL_AVG} L. Calculez le vôtre : ${url}`,
    sticky: (v: string) => `≈ ${v} L/pers/jour · moyenne nationale ${NATIONAL_AVG} L`,
  },
  en: {
    habits: 'Estimate from my habits', meter: 'Measure with my water meter', presets: 'Starting assumptions, to adjust',
    toilet: 'Toilet flush type', classic: 'Standard', dual: 'Dual flush', dishes: 'Household dishwashing',
    machine: 'Dishwasher', hand: 'By hand (estimate)', reset: 'Reset',
    estimateTitle: 'Your estimate per person per day', to: 'to',
    central: (v: string, l: boolean) => `Central value: ${v} L per person per day${l ? ', with the selected actions' : ''}.`,
    levers: 'Possible actions', leverGain: (h: string, p: string) => `${h} L/day for the household, i.e. ${p} L per person.`,
    uncheck: 'Uncheck all', check: 'Check all', noLever: 'No action with a positive saving for these habits.',
    leverNote: 'Indicative savings calculated separately; several selected actions are recalculated together. Dual flush and laundry: ranges. Shower replacing a bath: length entered.',
    allTitle: 'With all suggested actions', perDay: 'L per person per day',
    peopleLabel: 'Number of people', myData: 'My data', twoReadings: 'I have two meter readings', bill: 'I have a volume on my bill',
    i1: 'Reading 1 (m³)', i2: 'Reading 2 (m³)', days: 'Days between readings', volume: 'Billed volume (m³)', billDays: 'Number of days',
    indexError: 'Reading 2 must be greater than or equal to reading 1: check the order of your readings.',
    meterNote: 'A shared building meter, or a household with a garden or pool, skews this measurement: it includes all uses.',
    measured: (v: string) => `Measured consumption: ${v} L per person per day`,
    over: 'Your measurement exceeds your estimate: uncounted uses or a leak are possible.',
    fill: 'Enter your readings to display your measured consumption.', copy: 'Copy my result', copied: 'Copied',
    footer: 'Indicative estimate based on average values (ARS; orders of magnitude vary between sources, ADEME and CIEAU sometimes give higher values for showers). Your actual consumption is shown on your meter. Does not cover garden, car, pool or leaks. Official instructions take precedence.',
    above: 'Above', below: 'Below', level: 'At the level',
    natTitle: `Compared with the French national average: ${NATIONAL_AVG} L/person/day (${NATIONAL_SOURCE.en})`,
    natAria: 'Comparison with the national average', natRel: (r: string) => `${r} this average.`,
    ref: 'reference', litres: 'litres',
    share: (n: number, v: string, habits: boolean, url: string) => `My household (${n} ${n > 1 ? 'people' : 'person'}): about ${v} L per person per day (${habits ? 'indicative estimate' : 'measured with my meter'}). French national average: ${NATIONAL_AVG} L. Work out yours: ${url}`,
    sticky: (v: string) => `≈ ${v} L/person/day · national average ${NATIONAL_AVG} L`,
  },
};
const SHARE_URL = 'https://infoeau.fr/actualites/crise-eau-finistere#calculateur';
const GENERIC_URL = { fr: 'https://infoeau.fr/calculateur-consommation-eau', en: 'https://infoeau.fr/en/calculateur-consommation-eau' };

function Comparisons({ value, context, lang }: { value: number; context: CalculatorContext; lang: Lang }) {
  const number = fmt(lang); const t = STR[lang];
  const rel = (ref: number) => value > ref ? t.above : value < ref ? t.below : t.level;
  if (context === 'generic') {
    return <div className="space-y-4">
      <div><p className="text-sm mb-2" title={NATIONAL_SOURCE[lang]}>{t.natTitle}</p>
        <Progress value={Math.min(100, value / NATIONAL_AVG * 100)} aria-label={t.natAria} aria-valuetext={`${number(value)} ${t.litres} ; ${t.ref} ${NATIONAL_AVG} ${t.litres}`} />
        <p className="text-sm text-muted-foreground mt-1">{t.natRel(rel(NATIONAL_AVG))}</p>
      </div>
    </div>;
  }
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

export default function CrisisWaterCalculator({ context = 'finistere' }: { context?: CalculatorContext }) {
  const { language } = useLanguage();
  const generic = context === 'generic';
  const lang: Lang = generic && language === 'en' ? 'en' : 'fr';
  const t = STR[lang];
  const number = fmt(lang);
  const range = (a: number, b: number) => number(a) === number(b) ? number(a) : `${number(a)} ${t.to} ${number(b)}`;
  const ev = (name: string, params?: Record<string, string>) => trackEvent(`${generic ? 'water_calc' : 'crisis_calc'}_${name}`, params);
  const leverLabel = (id: LeverId, fr: string) => lang === 'en' ? EN_LEVERS[id] : fr;
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

  const start = () => { if (!started.current) { started.current = true; ev('start'); } };
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
    if (checked) ev('lever', { lever: id });
  };
  const toggleAll = () => {
    if (allChecked) { setLevers(NO_LEVERS); return; }
    options.filter(o => !levers[o.id]).forEach(o => ev('lever', { lever: o.id }));
    setLevers({ ...NO_LEVERS, ...Object.fromEntries(options.map(o => [o.id, true])) });
  };
  const copy = async () => {
    if (shown === null) return;
    const n = mode === 'habits' ? input.people : meterPeople;
    const text = generic ? t.share(n, number(shown), mode === 'habits', GENERIC_URL[lang])
      : `Mon foyer (${n} personne${n > 1 ? 's' : ''}) : environ ${number(shown)} L par personne et par jour (${mode === 'habits' ? 'estimation indicative' : 'mesuré avec mon compteur'}). Objectif demandé dans le Nord-Finistère : ${TARGET} L. Calculez le vôtre : ${SHARE_URL}`;
    ev('copy', { bucket: generic ? nationalBucket(shown) : resultBucket(shown) });
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
      <Tabs value={mode} onValueChange={v => { if (v === 'habits' || v === 'meter') { setMode(v); ev('mode', { mode: v }); } }}>
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="habits" className="min-h-11 whitespace-normal">{t.habits}</TabsTrigger>
          <TabsTrigger value="meter" className="min-h-11 whitespace-normal">{t.meter}</TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="mt-6">
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">{t.presets}</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => <Button key={p.id} type="button" variant="outline" className="min-h-11" onClick={() => { setTouched(true); setInput(p.input); setLevers(NO_LEVERS); }}>{lang === 'en' ? EN_PRESETS[p.id] ?? p.label : p.label}</Button>)}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">{FIELD_KEYS.map(key => numericField(key, FIELD_LABELS[lang][key]))}</div>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium mb-2">{t.toilet}</legend>
            <RadioGroup value={input.toilet} onValueChange={value => { if (value === 'classic' || value === 'dual') update({ toilet: value }); }} className="sm:grid-cols-2">
              <Label htmlFor="crisis-classic" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-classic" value="classic" />{t.classic}</Label>
              <Label htmlFor="crisis-dual" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-dual" value="dual" />{t.dual}</Label>
            </RadioGroup>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium mb-2">{t.dishes}</legend>
            <RadioGroup value={input.dishMode} onValueChange={value => { if (value === 'machine' || value === 'hand') update({ dishMode: value }); }} className="sm:grid-cols-2">
              <Label htmlFor="crisis-machine" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-machine" value="machine" />{t.machine}</Label>
              <Label htmlFor="crisis-hand" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="crisis-hand" value="hand" />{t.hand}</Label>
            </RadioGroup>
            {input.dishMode === 'machine' && <div className="mt-3">{numericField('dishes', FIELD_LABELS[lang].dishes)}</div>}
          </fieldset>
          <Button type="button" variant="ghost" className="mt-2 min-h-11" onClick={() => { setInput(DEFAULT_INPUTS); setLevers(NO_LEVERS); setTouched(false); }}>{t.reset}</Button>

          <div className="mt-8 border-t border-border pt-6" aria-live="polite" aria-atomic="true">
            <h3 className="text-lg font-semibold">{t.estimateTitle}</h3>
            <p className="text-2xl font-bold mt-2">{number(result.perPersonLow)} {t.to} {number(result.perPersonHigh)} L</p>
            <p className="text-sm text-muted-foreground mb-5">{t.central(number(result.central), options.some(o => levers[o.id]))}</p>
            <Comparisons value={result.central} context={context} lang={lang} />
          </div>

          <fieldset className="mt-6">
            <legend className="text-lg font-semibold">{t.levers}</legend>
            {options.length > 0 ? <>
              <ul className="mt-3 space-y-3">{options.map(o => <li key={o.id}>
                <Label htmlFor={`lever-${o.id}`} className="flex items-start gap-3 min-h-11 font-normal">
                  <Checkbox id={`lever-${o.id}`} className="mt-1" checked={levers[o.id] && isLeverAvailable(input, o.id)} onCheckedChange={c => toggleLever(o.id, c === true)} />
                  <span className="min-w-0"><span className="font-medium block">{leverLabel(o.id, o.label)}</span>
                    <span className="block text-sm text-muted-foreground">{t.leverGain(range(o.householdLow, o.householdHigh), range(o.perPersonLow, o.perPersonHigh))}</span></span>
                </Label>
              </li>)}</ul>
              <Button type="button" variant="outline" className="mt-3 min-h-11" onClick={toggleAll}>{allChecked ? t.uncheck : t.check}</Button>
            </> : <p className="text-sm text-muted-foreground mt-3">{t.noLever}</p>}
            <p className="text-sm text-muted-foreground mt-3">{t.leverNote}</p>
          </fieldset>

          <div className="mt-6 rounded-md border border-border bg-muted p-4">
            <h3 className="font-semibold">{t.allTitle}</h3>
            <p className="text-xl font-bold mt-1">{number(all.perPersonLow)} {t.to} {number(all.perPersonHigh)} {t.perDay}</p>
            {!generic && <p className="text-sm mt-1">{all.central > TARGET
              ? `Ces gestes ne suffisent pas, selon cette estimation, à atteindre ${TARGET} L par personne et par jour.`
              : `Selon cette estimation, ces gestes permettraient d’atteindre ${TARGET} L par personne et par jour.`}</p>}
          </div>
        </TabsContent>

        <TabsContent value="meter" className="mt-6">
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="meter-people">{t.peopleLabel}</Label>
            <Input id="meter-people" type="number" inputMode="numeric" min={1} max={8} step={1} className="h-11" value={meterPeople} onChange={e => setMeterPeople(boundInput('people', e.target.valueAsNumber))} />
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium mb-2">{t.myData}</legend>
            <RadioGroup value={meterMethod} onValueChange={v => { if (v === 'indexes' || v === 'bill') setMeterMethod(v); }} className="sm:grid-cols-2">
              <Label htmlFor="meter-indexes" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="meter-indexes" value="indexes" />{t.twoReadings}</Label>
              <Label htmlFor="meter-bill" className="flex items-center gap-3 min-h-11"><RadioGroupItem id="meter-bill" value="bill" />{t.bill}</Label>
            </RadioGroup>
          </fieldset>
          {meterMethod === 'indexes' ? <div className="grid gap-5 sm:grid-cols-3 mt-4">
            <MeterField id="meter-i1" label={t.i1} value={index1} onChange={setIndex1} />
            <MeterField id="meter-i2" label={t.i2} value={index2} onChange={setIndex2} />
            <MeterField id="meter-days" label={t.days} value={indexDays} onChange={setIndexDays} step="1" />
          </div> : <div className="grid gap-5 sm:grid-cols-2 mt-4">
            <MeterField id="meter-volume" label={t.volume} value={billVolume} onChange={setBillVolume} />
            <MeterField id="meter-bill-days" label={t.billDays} value={billDays} onChange={setBillDays} step="1" />
          </div>}
          {indexError && <p role="alert" className="text-sm text-destructive mt-3">{t.indexError}</p>}
          <p className="text-sm text-muted-foreground mt-4">{t.meterNote}</p>
          <div className="mt-6 border-t border-border pt-6" aria-live="polite" aria-atomic="true">
            {measured !== null ? <>
              <p className="text-xl font-bold mb-5">{t.measured(number(measured))}</p>
              <Comparisons value={measured} context={context} lang={lang} />
              {touched && measured > estimateBase.perPersonHigh && <p className="text-sm font-medium mt-4">{t.over}</p>}
            </> : <p className="text-sm text-muted-foreground">{t.fill}</p>}
          </div>
        </TabsContent>
      </Tabs>


      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" className="min-h-11" onClick={copy} disabled={shown === null}>{t.copy}</Button>
        <span aria-live="polite" className="text-sm text-muted-foreground">{copied ? t.copied : ''}</span>
      </div>

      <p className="text-sm text-muted-foreground mt-4">{t.footer}</p>
    </div>
    {shown !== null && <div aria-hidden="true" className="sticky bottom-0 z-10 rounded-b-lg border-t border-border bg-card py-3 pl-4 pr-24 text-sm font-semibold">
      {generic ? t.sticky(number(shown)) : `≈ ${number(shown)} L/pers/jour · objectif ${TARGET} L`}
    </div>}
  </div>;
}
