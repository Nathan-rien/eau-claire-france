"use client";
import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

export interface RankingFilterState {
  showSparkling: boolean;
  showStill: boolean;
  hideExcluded: boolean;
  showMddOnly: boolean;
  origins: ('FR' | 'EU' | 'Monde')[];
  residuRange: [number, number];
  calciumRange: [number, number];
  sodiumRange: [number, number];
  nitratesMax: number;
  pHRange: [number, number];
}

export const DEFAULT_FILTERS: RankingFilterState = {
  showSparkling: true,
  showStill: true,
  hideExcluded: false,
  showMddOnly: false,
  origins: ['FR', 'EU', 'Monde'],
  residuRange: [0, 5000],
  calciumRange: [0, 600],
  sodiumRange: [0, 2000],
  nitratesMax: 50,
  pHRange: [5, 9],
};

interface Props {
  filters: RankingFilterState;
  onChange: (f: RankingFilterState) => void;
  resultCount: number;
}

export default function RankingFilters({ filters, onChange, resultCount }: Props) {
  const [open, setOpen] = useState(false);

  const update = <K extends keyof RankingFilterState>(key: K, value: RankingFilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleOrigin = (o: 'FR' | 'EU' | 'Monde') => {
    const next = filters.origins.includes(o)
      ? filters.origins.filter(x => x !== o)
      : [...filters.origins, o];
    update('origins', next);
  };

  const reset = () => onChange(DEFAULT_FILTERS);

  return (
    <div className="mb-4 bg-white rounded-lg border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-sm">Filtres avancés</span>
          <Badge variant="secondary" className="ml-2">{resultCount} eaux</Badge>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={filters.showStill} onCheckedChange={(v) => update('showStill', v)} id="f-still" />
              <Label htmlFor="f-still" className="text-sm cursor-pointer">Plate</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={filters.showSparkling} onCheckedChange={(v) => update('showSparkling', v)} id="f-spark" />
              <Label htmlFor="f-spark" className="text-sm cursor-pointer flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gazeuse
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={filters.hideExcluded} onCheckedChange={(v) => update('hideExcluded', v)} id="f-excl" />
              <Label htmlFor="f-excl" className="text-sm cursor-pointer">Masquer non-recommandées</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={filters.showMddOnly} onCheckedChange={(v) => update('showMddOnly', v)} id="f-mdd" />
              <Label htmlFor="f-mdd" className="text-sm cursor-pointer">MDD uniquement</Label>
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Origine</Label>
            <div className="flex gap-2">
              {(['FR', 'EU', 'Monde'] as const).map(o => (
                <button
                  key={o}
                  onClick={() => toggleOrigin(o)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    filters.origins.includes(o)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {o === 'FR' ? '🇫🇷 France' : o === 'EU' ? '🇪🇺 Europe' : '🌍 Monde'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <SliderField
              label="Minéralisation (résidu sec, mg/L)"
              value={filters.residuRange}
              min={0} max={5000} step={50}
              onChange={(v) => update('residuRange', v)}
            />
            <SliderField
              label="Calcium (mg/L)"
              value={filters.calciumRange}
              min={0} max={600} step={10}
              onChange={(v) => update('calciumRange', v)}
            />
            <SliderField
              label="Sodium (mg/L)"
              value={filters.sodiumRange}
              min={0} max={2000} step={10}
              onChange={(v) => update('sodiumRange', v)}
            />
            <SliderField
              label="pH"
              value={filters.pHRange}
              min={5} max={9} step={0.1}
              onChange={(v) => update('pHRange', v)}
            />
            <div>
              <Label className="text-sm flex justify-between mb-2">
                <span>Nitrates max</span>
                <span className="text-gray-500">≤ {filters.nitratesMax} mg/L</span>
              </Label>
              <Slider
                value={[filters.nitratesMax]}
                onValueChange={(v) => update('nitratesMax', v[0])}
                min={0} max={50} step={1}
              />
            </div>
          </div>

          <button
            onClick={reset}
            className="text-xs text-blue-600 hover:underline"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      )}
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange }: {
  label: string;
  value: [number, number];
  min: number; max: number; step: number;
  onChange: (v: [number, number]) => void;
}) {
  return (
    <div>
      <Label className="text-sm flex justify-between mb-2">
        <span>{label}</span>
        <span className="text-gray-500">{value[0]} – {value[1]}</span>
      </Label>
      <Slider
        value={value}
        onValueChange={(v) => onChange([v[0], v[1]])}
        min={min} max={max} step={step}
      />
    </div>
  );
}
