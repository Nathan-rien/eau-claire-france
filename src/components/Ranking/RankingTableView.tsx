"use client";
import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Star, Plus, Check, Sparkles } from 'lucide-react';
import { Composition, scoreBottle, letterGrade, Profile, getCompositionForDisplay, formatMineralValue } from '@/utils/rankingV2';
import type { WaterSource } from '@/hooks/useWaterCompositions';

type SortKey = 'rank' | 'name' | 'score' | 'residu' | 'calcium' | 'magnesium' | 'sodium' | 'nitrates' | 'pH';

interface Props {
  waters: WaterSource[];
  profile: Profile;
  favorites: Set<string>;
  selectedIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onToggleSelect: (id: string) => void;
}

const letterColor = (l: string) => ({
  A: 'bg-green-100 text-green-700',
  B: 'bg-green-50 text-green-600',
  C: 'bg-yellow-50 text-yellow-700',
  D: 'bg-orange-50 text-orange-600',
  E: 'bg-red-50 text-red-600',
  X: 'bg-red-100 text-red-700 border border-red-300',
}[l] || 'bg-gray-100 text-gray-600');

export default function RankingTableView({
  waters, profile, favorites, selectedIds, onToggleFavorite, onToggleSelect
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const scored = waters.map(w => {
    const s = scoreBottle(w.composition, profile);
    return { water: w, score: s.total, excluded: s.excluded, letter: letterGrade(s.total) };
  });

  const compVal = (c: Composition, k: string): number => {
    const map: Record<string, number | undefined> = {
      residu: c.residu_sec_180_mg_L, calcium: c.Ca_mg_L, magnesium: c.Mg_mg_L,
      sodium: c.Na_mg_L, nitrates: c.NO3_mg_L, pH: c.pH,
    };
    return map[k] ?? -Infinity;
  };

  const sorted = [...scored].sort((a, b) => {
    if (a.excluded !== b.excluded) return a.excluded ? 1 : -1;
    let av: number | string = 0, bv: number | string = 0;
    if (sortKey === 'rank' || sortKey === 'score') { av = a.score; bv = b.score; }
    else if (sortKey === 'name') { av = a.water.brand; bv = b.water.brand; }
    else { av = compVal(a.water.composition, sortKey); bv = compVal(b.water.composition, sortKey); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // For rank: always sort by score desc visually
  if (sortKey === 'rank') sorted.sort((a, b) => (a.excluded !== b.excluded ? (a.excluded ? 1 : -1) : b.score - a.score));

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir(k === 'score' || k === 'rank' ? 'desc' : 'asc'); }
  };

  const SortHead = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="px-2 py-2 text-left font-medium">
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-blue-600">
        {label}
        {sortKey === k ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
      </button>
    </th>
  );

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-600 border-b">
          <tr>
            <th className="px-2 py-2 w-8"></th>
            <th className="px-2 py-2 w-8"></th>
            <SortHead k="rank" label="#" />
            <SortHead k="name" label="Eau" />
            <SortHead k="score" label="Score" />
            <th className="px-2 py-2 text-left font-medium">Note</th>
            <SortHead k="residu" label="Résidu" />
            <SortHead k="calcium" label="Ca" />
            <SortHead k="magnesium" label="Mg" />
            <SortHead k="sodium" label="Na" />
            <SortHead k="nitrates" label="NO₃" />
            <SortHead k="pH" label="pH" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const w = row.water;
            const isSelected = selectedIds.has(w.id);
            const isFav = favorites.has(w.id);
            return (
              <tr key={w.id} className={`border-b last:border-0 hover:bg-gray-50 ${row.excluded ? 'opacity-60' : ''}`}>
                <td className="px-2 py-2">
                  <button onClick={() => onToggleSelect(w.id)} aria-label="Sélectionner pour comparer"
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 hover:border-blue-400'}`}>
                    {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 opacity-0 hover:opacity-50" />}
                  </button>
                </td>
                <td className="px-2 py-2">
                  <button onClick={() => onToggleFavorite(w.id)} aria-label="Favori">
                    <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`} />
                  </button>
                </td>
                <td className="px-2 py-2 font-medium text-gray-500">{row.excluded ? '—' : i + 1}</td>
                <td className="px-2 py-2">
                  <div className="font-medium text-gray-900 flex items-center gap-1">
                    {w.brand}
                    {w.is_sparkling && <Sparkles className="w-3 h-3 text-blue-400" />}
                  </div>
                  <div className="text-xs text-gray-500">{w.source_name}</div>
                </td>
                <td className="px-2 py-2 font-semibold">{row.score}</td>
                <td className="px-2 py-2">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded font-bold text-sm ${letterColor(row.letter)}`}>
                    {row.letter}
                  </span>
                </td>
                <td className="px-2 py-2 text-gray-700">{formatMineralValue(w.composition.residu_sec_180_mg_L, 'residu')}</td>
                <td className="px-2 py-2 text-gray-700">{formatMineralValue(w.composition.Ca_mg_L, 'calcium')}</td>
                <td className="px-2 py-2 text-gray-700">{formatMineralValue(w.composition.Mg_mg_L, 'magnesium')}</td>
                <td className="px-2 py-2 text-gray-700">{formatMineralValue(w.composition.Na_mg_L, 'sodium')}</td>
                <td className="px-2 py-2 text-gray-700">{formatMineralValue(w.composition.NO3_mg_L, 'nitrates')}</td>
                <td className="px-2 py-2 text-gray-700">{formatMineralValue(w.composition.pH, 'pH')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
